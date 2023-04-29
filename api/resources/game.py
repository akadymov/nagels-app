# -*- coding: utf-8 -*-

from flask import url_for, request, jsonify, Blueprint
from flask_cors import cross_origin
from app import db
from app.models import User, Room, Game, Player, Hand, HandScore, TurnCard, Turn
from datetime import datetime
import random
from config import get_settings, get_environment
from app.text import get_phrase


game = Blueprint('game', __name__)
game_cfg = get_settings('GAME')
env = get_environment()


@game.route('{base_path}/game/<game_id>/score'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['GET'])
@cross_origin()
def game_score(game_id):

    g = Game.query.filter_by(id=game_id).first()
    lang = request.headers.get('Accept-Language')
    if not g:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('game_not_exist_error', lang).format(game_id=game_id)
                }
            ]
        }), 400

    game_scores = g.get_scores()

    return jsonify({
        'gameId': game_id,
        'gameScores': game_scores
    }), 200


@game.route('{base_path}/game/start'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['POST'])
@cross_origin()
def start():
    token = request.json.get('token')
    autodeal = request.json.get('autodeal')
    one_card_hands = request.json.get('singleCardHands')
    rating_game = request.json.get('ratingGame')
    lang = request.headers.get('Accept-Language')
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
    if not hosted_room:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('no_hosted_rooms_error', lang).format(
                        username=requesting_user.username,
                        create_room_url=url_for('room.create')
                    )
                }
            ]
        }), 403

    if not game_cfg['MIN_PLAYERS'][env] <= hosted_room.connected_users.count() <= game_cfg['MAX_PLAYERS'][env]:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('incorrect_players_number_error', lang).format(
                        players_count=hosted_room.connected_users.count(),
                        room_name=hosted_room.room_name
                    )
                }
            ]
        }), 403
    for room_game in hosted_room.games:
        if room_game.finished is None:
            return jsonify({
                'errors': [
                    {
                        'message': get_phrase('game_already_started_error', lang).format(
                            game_id=room_game.id,
                            game_start=room_game.started
                        )
                    }
                ]
            }), 403
    g = Game(
        room=hosted_room,
        autodeal=1 if autodeal else 0,
        one_card_hands=1 if one_card_hands else 0,
        rating_game=1 if rating_game else 0
    )
    db.session.add(g)
    db.session.commit()

    players_list = []
    for player in hosted_room.connected_users.all():
        g.connect(player)
        p = Player(game_id=g.id, user_id=player.id)
        db.session.add(p)
        players_list.append(player.username)
    db.session.commit()

    return jsonify({
        'gameId': g.id,
        'room': g.room.room_name,
        'autodeal': autodeal == 1,
        'host': g.room.host.username,
        'status': 'active' if g.finished is None else 'finished',
        'started': g.started,
        'players': players_list,
        'startedHands': [],
        'gameScores': []
    }), 200


@game.route('{base_path}/game/finish'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['POST'])
@cross_origin()
def finish():

    token = request.json.get('token')
    lang = request.headers.get('Accept-Language')
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
    if not hosted_room:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('no_hosted_rooms_error', lang).format(
                        username=requesting_user.username,
                        create_room_url=url_for('room.create')
                    )
                }
            ]
        }), 403
    active_games = []
    for room_game in hosted_room.games:
        if room_game.finished is None:
            active_games.append(room_game)
    if len(active_games) != 1:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('active_games_in_room_error', lang).format(room_name=hosted_room.room_name, active_games=len(active_games))
                }
            ]
        }), 403

    g = active_games[0]
    g.finished = datetime.utcnow()
    for player in hosted_room.connected_users:
        user = User.query.filter_by(id=player.id).first()
        hosted_room.not_ready(user)
    db.session.commit()

    players_list = []
    for player in hosted_room.connected_users.all():
        g.connect(player)
        players_list.append(player.username)



    return jsonify({
        'gameId': g.id,
        'room': g.room.room_name,
        'host': g.room.host.username,
        'status': 'active' if g.finished is None else 'finished',
        'started': g.started,
        'finished': g.finished,
        'players': players_list
    }), 200


@game.route('{base_path}/game/<game_id>/positions'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['POST'])
@cross_origin()
def positions(game_id):

    token = request.json.get('token')
    lang = request.headers.get('Accept-Language')
    if token is None:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('auth_token_absent_error', lang).format(post_token_url=url_for('user.post_token'))
                }
            ]
        }), 401
    requesting_user = User.verify_api_auth_token(token)

    game = Game.query.filter_by(id=game_id).first()
    if not game:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('game_not_started_error', lang).format(game_id=game_id)
                }
            ]
        }), 400

    room = Room.query.filter_by(id=game.room_id).first()
    if room.host != requesting_user:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('only_host_shuffle_error', lang)
                }
            ]
        }), 403

    players = Player.query.filter_by(game_id=game_id).all()
    for player in players:
        if player.position is not None:
            return jsonify({
                'errors': [
                    {
                        'message': get_phrase('positions_already_defined_error', lang).format(game_id=game_id)
                    }
                ]
            }), 403

    players = Player.query.filter_by(game_id=game_id).all()
    random.shuffle(players)

    players_list = []
    requesting_user_is_player = False
    for player in players:
        p = Player.query.filter_by(game_id=game_id, user_id=player.user_id).first()
        p.position = players.index(player) + 1
        db.session.commit()
    for player in players:
        if player.user_id == requesting_user.id:
            requesting_user_is_player = True
        user = User.query.filter_by(id=player.user_id).first()
        if user:
            players_list.append({
                'username': user.username,
                'position': player.position,
                'relativePosition': game.get_player_relative_positions(requesting_user.id,
                                                                       player.user_id) if requesting_user_is_player else player.position
            })

    return jsonify({
        'gameId': game_id,
        'players': players_list
    }), 200


@game.route('{base_path}/game/<game_id>'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['POST'])
@cross_origin()
def status(game_id):

    game = Game.query.filter_by(id=game_id).first()
    lang = request.headers.get('Accept-Language')
    if not game:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('game_not_found_error', lang).format(game_id=game_id)
                }
            ]
        }), 404

    room = Room.query.filter_by(id=game.room_id).first()
    if not room:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('game_room_not_found_error', lang).format(room_id=game.room_id, game_id=game_id)
                }
            ]
        }), 401

    players_enriched = []
    players = Player.query.filter_by(game_id=game_id).order_by(Player.position).all()
    positions_defined = True
    requesting_user = None
    requesting_user_is_player = False

    current_hand = game.last_open_hand()

    token = request.json.get('token')
    my_info = {}
    cards_on_table = []
    last_turn_cards = []
    if token:
        requesting_user = User.verify_api_auth_token(token)
        if requesting_user:
            for player in players:
                if player.user_id == requesting_user.id:
                    requesting_user_is_player = True
                    my_info['username'] = requesting_user.username
                    my_info['position'] = player.position
                    if current_hand:
                        my_scores = HandScore.query.filter_by(player_id=requesting_user.id, hand_id=current_hand.id).first()
                        my_info['dealtCards'] = current_hand.get_user_current_hand(requesting_user, current_hand.trump)
                        my_info['betSize'] = my_scores.bet_size if my_scores else None
                        my_info['tookTurns'] = my_scores.took_turns() if my_scores else None
                        my_info['selectedCard'] = None
                    else:
                        my_info['dealtCards'] = []

    next_player = None
    if current_hand:
        next_player = current_hand.next_acting_player()
        for player in players:
            user = User.query.filter_by(id=player.user_id).first()
            if user:
                user_scores = HandScore.query.filter_by(player_id=user.id, hand_id=current_hand.id).first()
                players_enriched.append({
                    'username': user.username,
                    'position': current_hand.get_position(user),
                    'betSize': user_scores.bet_size if user_scores else None,
                    'tookTurns': user_scores.took_turns() if user_scores else None,
                    'cardsOnHand': len(current_hand.get_user_current_hand(user)),
                    'relativePosition': game.get_player_relative_positions(requesting_user.id, player.user_id) if requesting_user_is_player else player.position
                })
        current_turn = current_hand.get_current_turn(closed=True)

        if current_turn:
            for card in current_turn.stroke_cards():
                card_user = User.query.filter_by(id=card.player_id).first()
                player_position = None
                player_relative_position = None
                if card_user:
                    player_position = current_hand.get_position(card_user)
                    player_relative_position = player_position
                    if requesting_user_is_player:
                        player_relative_position = game.get_player_relative_positions(requesting_user.id, card_user.id)
                cards_on_table.append({
                    'cardId': str(card.card_id) + card.card_suit,
                    'playerId': card.player_id,
                    'playerUsername': card_user.username,
                    'playerPosition': player_position,
                    'playerRelativePosition': player_relative_position
                })
    else:
        for player in players:
            user = User.query.filter_by(id=player.user_id).first()
            if player.position is None:
                positions_defined = False
            if user:
                players_enriched.append({
                    'username': user.username,
                    'position': player.position,
                    'relativePosition': game.get_player_relative_positions(requesting_user.id, player.user_id) if requesting_user_is_player else player.position
                })

    last_turn = []
    if current_hand:
        hand_context = current_hand
        last_turn = current_hand.get_last_turn()
    if not last_turn:
        previous_hand = game.previous_hand()
        if previous_hand:
            prev_hand_turns = Turn.query.filter_by(hand_id=previous_hand.id).order_by(Turn.id.desc()).all()
            if prev_hand_turns:
                last_turn = prev_hand_turns[0]
                hand_context = previous_hand
    if last_turn and hand_context:
        for card in TurnCard.query.filter_by(turn_id=last_turn.id).all():
            card_user = User.query.filter_by(id=card.player_id).first()
            player_position = None
            player_relative_position = None
            if card_user:
                player_position = hand_context.get_position(card_user)
                player_relative_position = player_position
                if requesting_user_is_player:
                    player_relative_position = game.get_player_relative_positions(requesting_user.id, card_user.id)
            last_turn_cards.append({
                'cardId': str(card.card_id) + card.card_suit,
                'playerId': card.player_id,
                'playerPosition': player_position,
                'playerRelativePosition': player_relative_position
            })

    action_msg = get_phrase('shuffling_positions_action_message', lang).format(game_id=game_id, hostname=room.host.username)
    can_deal = False
    if game.winner_id:
        action_msg = get_phrase('congratulations', lang) + str(User.query.filter_by(id=game.winner_id).first().username) + get_phrase('congratulations_end', lang)
    elif game.finished:
        action_msg = get_phrase('game_closed_action_message', lang)
    elif positions_defined:
        if current_hand is None:                        # if hand is not started yet
            can_deal = True
            action_msg = get_phrase('dealing_cards_action_message', lang)
        elif next_player == requesting_user:
            action_msg = "It's your turn now"
        elif not current_hand.all_bets_made():          # if hand is started, but there are still bets to make
            action_msg = get_phrase('user_bets_action_message', lang).format(username=current_hand.next_acting_player().username)
        elif not current_hand.all_turns_made():         # if hand is not finished
            action_msg = get_phrase('user_turn_action_message', lang).format(username=current_hand.next_acting_player().username)
        else:                                           # if hand is just finished
            action_msg = get_phrase('hand_finished_action_message', lang)

    played_hands_count = Hand.query.filter_by(game_id=game_id, is_closed=1).count()

    response_json = {
        'gameId': game.id,
        'roomName': Room.query.filter_by(id=game.room_id).first().room_name,
        'roomId': game.room_id,
        'positionsDefined': positions_defined,
        'canDeal': can_deal,
        'betsAreMade': current_hand.all_bets_made() if current_hand else None,
        'currentHandId': current_hand.id if current_hand else None,
        'currentHandSerialNo': current_hand.serial_no if current_hand else None,
        'trump': current_hand.trump if current_hand else None,
        'cardsPerPlayer': current_hand.cards_per_player if current_hand else None,
        'currentHandLocation': url_for('hand.status', hand_id=current_hand.id, game_id=game_id) if current_hand else None,
        'playedHandsCount': played_hands_count,
        'started': game.started,
        'status': 'open' if game.finished is None else 'finished',
        'finished': game.finished,
        'players': players_enriched,
        'lastTurnCards': last_turn_cards,
        'nextActingPlayer': next_player.username if next_player else None,
        'host': room.host.username,
        'startedHands': [],
        'autodeal': game.autodeal == 1,
        'singleCardHands': game.one_card_hands == 1,
        'ratingGame': game.rating_game == 1,
        'gameScores': game.get_scores(),
        'actionMessage': action_msg,
        'myInHandInfo': my_info,
        'cardsOnTable': cards_on_table,
        'handStarter': current_hand.get_starter_new().username if current_hand else None,
    }

    return jsonify(response_json), 200
