# -*- coding: utf-8 -*-

from flask import url_for, request, jsonify, Blueprint
from flask_cors import cross_origin
from app import db
from app.models import User, Room, Stats
from datetime import datetime
from config import get_settings, get_environment
from app.text import get_phrase


room = Blueprint('room', __name__)
env = get_environment()


def generate_users_json(target_room, connected_users):
    users_json = []
    for u in connected_users:
        if target_room.host.username == u.username:
            is_ready = True
        else:
            is_ready = target_room.if_user_is_ready(u)
        user_stats = Stats.query.filter_by(user_id=u.id).first()
        win_ratio = 0.00
        if user_stats:
            if user_stats.games_played > 0:
                win_ratio = round(user_stats.games_won / user_stats.games_played, 2)
        users_json.append({
            'id': u.id,
            'username': u.username,
            'ready': is_ready,
            'winRatio': win_ratio
        })
    return users_json


def generate_games_json(target_room):
    games = target_room.games
    games_json = {
        'ongoingGameId': None,
        'gamesList': []
    }
    for game in games:
        games_json['gamesList'].append({
            'id': game.id,
            'status': 'open' if game.finished is None else 'finished'
        })
        if game.finished is None:
            games_json['ongoingGameId'] = game.id
    return games_json


@room.route('{base_path}/room/all'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['POST'])
@cross_origin()
def get_list():
    connected_room = None
    token = request.json.get('token')
    if token:
        requesting_user = User.verify_auth_token(token)
        if requesting_user:
            connected_room = requesting_user.get_connected_room_id()
    rooms = Room.query.filter_by(closed=None).all()
    if str(request.args.get('closed')).lower() == 'y':
        rooms = Room.query.all()
    rooms_json = []
    for room in rooms:
        time_delta_from_now = (datetime.utcnow() - room.created).total_seconds()
        minutes_delta = round(time_delta_from_now / 60)
        hours_delta = round(time_delta_from_now / 3600)
        days_delta = round(time_delta_from_now / (3600 * 24))
        time_ago_string = 'just now'
        if days_delta > 0:
            time_ago_string = str(days_delta) + ' days ago'
        elif hours_delta > 0:
            time_ago_string = str(hours_delta) + ' hrs ago'
        elif minutes_delta > 0:
            time_ago_string = str(minutes_delta) + ' min ago'
        rooms_json.append({
            'roomId': room.id,
            'roomName': room.room_name,
            'host': room.host.username,
            'status': room.current_status(),
            'created': time_ago_string,
            'closed': room.closed,
            'connectedUsers': room.connected_users.count(),
            'connect': url_for('room.connect', room_id=room.id)
        })

    return jsonify({
        'rooms': rooms_json,
        'myConnectedRoomId': connected_room if connected_room else None
    }), 200


@room.route('{base_path}/room'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['POST'])
@cross_origin()
def create():

    lang = request.headers.get('Accept-Language')
    token = request.json.get('token')
    if token is None:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('auth_token_absent_error', lang).format(post_token_url=url_for('user.post_token'))
                }
            ]
        }), 401

    requesting_user = User.verify_api_auth_token(token)

    hosted_room = Room.query.filter_by(host=requesting_user, closed=None).first()
    if hosted_room:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('user_already_opened_room_error', lang).format(
                    username=requesting_user.username,
                    room_name=hosted_room.room_name)
                }
            ]
        }), 403

    connected_room = requesting_user.connected_rooms
    if connected_room.count() > 0:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('user_already_connected_error', lang).format(username=requesting_user.username)
                }
            ]
        }), 403

    room_name = request.json.get('roomName')
    new_room = Room(room_name=room_name, host=requesting_user, created=datetime.utcnow())
    db.session.add(new_room)
    new_room.connect(requesting_user)
    db.session.commit()

    return jsonify({
        'roomId': new_room.id,
        'roomName': new_room.room_name,
        'host': new_room.host.username,
        'created': new_room.created,
        'closed': new_room.closed,
        'connectedUsers': new_room.connected_users.count(),
        'status': 'open',
        'connect': url_for('room.connect', room_id=new_room.id)
    }), 201


@room.route('{base_path}/room/<room_id>/close'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['POST'])
@cross_origin()
def close(room_id):

    lang = request.headers.get('Accept-Language')
    token = request.json.get('token')

    requesting_user = User.verify_api_auth_token(token)

    target_room = Room.query.filter_by(id=room_id).first()
    if target_room is None:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('room_id_not_found_error', lang).format(room_id=room_id)
                }
            ]
        }), 404
    if target_room.closed is not None:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('room_already_closed_error', lang).format(room_name=target_room.room_name)
                }
            ]
        }), 400
    if target_room.host != requesting_user:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('only_host_close_room_error', lang)
                }
            ]
        }), 403

    for game in target_room.games:
        game.finished = datetime.utcnow()

    for user in target_room.connected_users:
        target_room.disconnect(user)

    target_room.closed = datetime.utcnow()
    db.session.commit()

    return jsonify({
        'roomId': target_room.id,
        'roomName': target_room.room_name,
        'host': target_room.host.username,
        'created': target_room.created,
        'status': 'closed',
        'closed': target_room.closed
    }), 201


@room.route('{base_path}/room/<room_id>/connect'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['POST'])
@cross_origin()
def connect(room_id):

    lang = request.headers.get('Accept-Language')
    token = request.json.get('token')

    requesting_user = User.verify_api_auth_token(token)
    target_room = Room.query.filter_by(id=room_id).first()
    connected_room = requesting_user.connected_rooms

    if connected_room.count() > 0:
        if target_room.is_connected(requesting_user):
            return jsonify({
                'warning': [
                    {
                        'message': get_phrase('already_connected_error', lang).format(
                            username=requesting_user.username, room_name=target_room.room_name)
                    }
                ]
            }), 201
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('user_already_connected_error', lang).format(username=requesting_user.username)
                }
            ]
        }), 403

    if target_room is None:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('room_id_not_found_error', lang).format(room_id=room_id)
                }
            ]
        }), 404
    if target_room.closed is not None:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('room_closed_error', lang).format(room_name=target_room.room_name)
                }
            ]
        }), 400
    if target_room.connected_users.count() >= get_settings('GAME')['MAX_PLAYERS'][env]:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('room_max_players_error', lang).format(room_name=target_room.room_name)
                }
            ]
        }), 403

    target_room.connect(requesting_user)
    db.session.commit()

    return jsonify({
        'roomId': target_room.id,
        'roomName': target_room.room_name,
        'host': target_room.host.username,
        'created': target_room.created,
        'closed': target_room.closed,
        'connectedUsers': target_room.connected_users.count(),
        'status': target_room.current_status(),
        'connect': url_for('room.connect', room_id=target_room.id)
    }), 201


@room.route('{base_path}/room/<room_id>/disconnect'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['POST'])
@cross_origin()
def disconnect(room_id):

    lang = request.headers.get('Accept-Language')
    token = request.json.get('token')
    username = request.json.get('username')

    requesting_user = User.verify_api_auth_token(token)

    disconnecting_user = User.query.filter_by(username=username).first()

    target_room = Room.query.filter_by(id=room_id).first()
    if target_room is None:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('room_id_not_found_error', lang).format(room_id=room_id)
                }
            ]
        }), 404
    if target_room.closed is not None:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('room_closed_error', lang).format(room_name=target_room.room_name)
                }
            ]
        }), 400
    if requesting_user != target_room.host and disconnecting_user != requesting_user:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('only_host_disconnect_error', lang)
                }
            ]
        })
    if not target_room.is_connected(disconnecting_user):
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('room_user_not_connected_error', lang).format(username=disconnecting_user.username, room_name=target_room.room_name)
                }
            ]
        }), 200
    if target_room.host == disconnecting_user:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('host_disconnect_error', lang)
                }
            ]
        }), 403

    target_room.disconnect(disconnecting_user)

    return jsonify({
        'roomId': target_room.id,
        'roomName': target_room.room_name,
        'host': target_room.host.username,
        'created': target_room.created,
        'closed': target_room.closed,
        'connectedUsers': target_room.connected_users.count(),
        'status': target_room.current_status(),
        'connect': url_for('room.connect', room_id=target_room.id)
    }), 201


@room.route('{base_path}/room/<room_id>'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['GET'])
@cross_origin()
def status(room_id):
    lang = request.headers.get('Accept-Language')
    room = Room.query.filter_by(id=room_id).first()
    if not room:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('room_id_not_found_error', lang).format(room_id=room_id)
                }
            ]
        }), 404

    connected_users = room.connected_users
    users_json = generate_users_json(room, connected_users)
    games_json = generate_games_json(room)

    return jsonify({
            'roomId': room.id,
            'roomName': room.room_name,
            'host': room.host.username,
            'status': room.current_status(),
            'created': room.created,
            'closed': room.closed,
            'connectedUserList': users_json,
            'connect': url_for('room.connect', room_id=room.id),
            'games': games_json
    }), 200


@room.route('{base_path}/room/<room_id>/ready'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['POST'])
@cross_origin()
def ready(room_id):
    lang = request.headers.get('Accept-Language')
    token = request.json.get('token')
    username = request.json.get('username')

    requesting_user = User.verify_api_auth_token(token)

    modified_user = User.query.filter_by(username=username).first()

    target_room = Room.query.filter_by(id=room_id).first()
    if target_room is None:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('room_id_not_found_error', lang).format(room_id=room_id)
                }
            ]
        }), 404
    if target_room.closed is not None:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('room_closed_error', lang).format(room_name=target_room.room_name)
                }
            ]
        }), 400
    if target_room.host == modified_user:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('host_always_ready_error', lang)
                }
            ]
        }), 403
    if modified_user != requesting_user and requesting_user != target_room.host:
        return jsonify({
            'errors': [
                {
                    "message": get_phrase('only_host_status_error', lang)
                }
            ]
        }), 403
    if not target_room.is_connected(modified_user):
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('room_user_not_connected_error', lang).format(
                        username=modified_user.username, room_name=target_room.room_name)
                }
            ]
        }), 200

    target_room.ready(modified_user)

    connected_users = target_room.connected_users
    users_json = generate_users_json(target_room,connected_users)
    games_json = generate_games_json(target_room)

    return jsonify({
            'roomId': target_room.id,
            'roomName': target_room.room_name,
            'host': target_room.host.username,
            'status': target_room.current_status(),
            'created': target_room.created,
            'closed': target_room.closed,
            'connectedUserList': users_json,
            'connect': url_for('room.connect', room_id=target_room.id),
            'games': games_json
    }), 200


@room.route('{base_path}/room/<room_id>/notready'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['POST'])
@cross_origin()
def not_ready(room_id):
    lang = request.headers.get('Accept-Language')
    token = request.json.get('token')
    username = request.json.get('username')

    requesting_user = User.verify_api_auth_token(token)

    modified_user = User.query.filter_by(username=username).first()

    target_room = Room.query.filter_by(id=room_id).first()
    if target_room is None:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('room_id_not_found_error', lang).format(room_id=room_id)
                }
            ]
        }), 404
    if target_room.closed is not None:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('room_closed_error', lang).format(room_name=target_room.room_name)
                }
            ]
        }), 400
    if not target_room.is_connected(modified_user):
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('room_user_not_connected_error', lang).format(
                        username=modified_user.username, room_name=target_room.room_name)
                }
            ]
        }), 200
    if modified_user != requesting_user and requesting_user != target_room.host:
        return jsonify({
            'errors': [
                {
                    "message": get_phrase('only_host_status_error', lang)
                }
            ]
        }), 403
    if target_room.host == modified_user:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('host_always_ready_error', lang)
                }
            ]
        }), 403

    target_room.not_ready(modified_user)

    connected_users = target_room.connected_users
    users_json = generate_users_json(target_room,connected_users)
    games_json = generate_games_json(target_room)

    return jsonify({
            'roomId': target_room.id,
            'roomName': target_room.room_name,
            'host': target_room.host.username,
            'status': target_room.current_status(),
            'created': target_room.created,
            'closed': target_room.closed,
            'connectedUserList': users_json,
            'connect': url_for('room.connect', room_id=target_room.id),
            'games': games_json
    }), 200

