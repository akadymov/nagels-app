from flask import jsonify, Blueprint, request
from flask_cors import cross_origin
from app.email import send_feedback
from app.models import Stats, User
from config import get_settings, get_environment
from app.text import get_phrase


general = Blueprint('general', __name__)
env = get_environment()


@general.route('{base_path}/rules'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['GET'])
@cross_origin()
def get_rules():
    lang = request.headers.get('Accept-Language')
    with open("rules.html", 'r') as f:
        content = f.read()
        f.close()
    if not content:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('game_rules_not_found_error', lang)
                }
            ]
        }), 404

    return jsonify({'rules': content}), 200


@general.route('{base_path}/info'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['GET'])
@cross_origin()
def get_info():
    lang = request.headers.get('Accept-Language')
    with open("info.html", 'r') as f:
        content = f.read()
        f.close()
    if not content:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('game_info_not_found_error', lang)
                }
            ]
        }), 404

    return jsonify({'info': content}), 200


@general.route('{base_path}/feedback'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['POST'])
@cross_origin()
def feedback():
    lang = request.headers.get('Accept-Language')
    message = request.json.get('message')
    sender_email = request.json.get('senderEmail')
    sender_name = request.json.get('senderName')

    if not message:
        return jsonify({
            'errors': [{
                'field': 'message',
                'message': get_phrase('empty_message_error', lang)
            }]
        })

    if len(message)>get_settings('CONTENT')['MAX_SYMBOLS'][env]:
        return jsonify({
            'errors': [{
                'field': 'message',
                'message': get_phrase('too_long_message_error', lang)
            }]
        })

    send_feedback(message=message, sender_name=sender_name, sender_email=sender_email)
    return jsonify({'message': get_phrase('feedback_sent_message', lang)}), 200


@general.route('{base_path}/ratings'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['GET'])
@cross_origin()
def ratings():
    ratings = Stats.query.filter(Stats.games_played>0).all()
    ratings_final = []
    if ratings:
        for rating in ratings:
            user = User.query.filter_by(id=rating.user_id).first()
            if user:
                ratings_final.append({
                    'username': user.username,
                    'gamesPlayed': rating.games_played,
                    'gamesWon': rating.games_won,
                    'winRatio': round(rating.games_won / rating.games_played, 2),
                    'sumOfBets': rating.sum_of_bets,
                    'bonuses': round(rating.bonuses / rating.games_played, 2),
                    'totalScore': rating.total_score,
                    'avgScore': round(rating.total_score / rating.games_played, 2),
                    'avgBonuses': round(rating.bonuses / rating.games_played, 2),
                    'avgBets': round(rating.sum_of_bets / rating.games_played, 2)
                })
    return ratings_final