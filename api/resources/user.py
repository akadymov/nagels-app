# -*- coding: utf-8 -*-

from flask import url_for, request, jsonify, Blueprint
from flask_cors import cross_origin
from app import app, db
from app.models import User, Token
from datetime import datetime
import re
import os
from app.email import send_password_reset_email, send_registration_notification, send_invite_email
from config import get_settings, get_environment
from sqlalchemy import func
from app.text import get_phrase


user = Blueprint('user', __name__)

auth = get_settings('AUTH')
regexps = get_settings('REGEXP')
requirements = get_settings('REQUIREMENTS')
langs = get_settings('LANGS')
content = get_settings('CONTENT')
env = get_environment()


@user.route('{base_path}/user/regexps'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['GET'])
def get_user_regexps():
    return jsonify({
        'email_regexp': regexps['EMAIL'][env],
        'password_regexp': regexps['PASSWORD'][env],
        'password_requirements': requirements['PASSWORD'][env]
    }), 200


@user.route('{base_path}/user/register'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['POST'])
@cross_origin()
def create_user():
    lang = request.headers.get('Accept-Language')
    username = request.json.get('username')
    email = None
    if request.json.get('email'):
        email = request.json.get('email').casefold()
    preferred_lang = request.json.get('preferredLang') or langs['DEFAULT'][env]
    password = request.json.get('password')
    repeat_password = request.json.get('repeatPassword')
    admin_secret = request.headers.get('ADMIN_SECRET')
    last_seen = datetime.utcnow()
    registered = datetime.utcnow()
    errors = []
    if auth['REGISTRATION_RESTRICTED'][env] and admin_secret != auth['ADMIN_SECRET'][env]:
        return jsonify({
            'errors': [
                {'field': 'username', 'message': get_phrase('registration_restricted_error', lang)},
                {'field': 'email', 'message': ' '},
                {'field': 'password', 'message': ' '},
                {'field': 'repeatPassword', 'message': ' '}
            ]
        }), 400
    if username is None:
        errors.append({'field': 'username', 'message': get_phrase('required_error', lang)})
    if password is None:
        errors.append({'field': 'password', 'message': get_phrase('required_error', lang)})
    if email is None:
        errors.append({'field': 'email', 'message': get_phrase('required_error', lang)})
    if password != repeat_password:
        errors.append({'field': 'repeatPassword', 'message': get_phrase('password_confirmation_error', lang)})
    if not re.match(regexps['USERNAME'][env], username):
        errors.append({'field': 'username', 'message': get_phrase('bad_username_error', lang)})
    if email is not None and not re.match(regexps['EMAIL'][env], email):
        errors.append({'field': 'email', 'message': get_phrase('bad_email_error', lang)})
    if not re.match(regexps['PASSWORD'][env], password):
        errors.append({'field': 'password', 'message': requirements['PASSWORD'][env]})
    if User.query.filter(func.lower(User.username) == func.lower(username)).count() > 0:
        errors.append(
            {'field': 'username', 'message': get_phrase('username_not_available_error', lang).format(username=username)})
    if User.query.filter_by(email=email).first() is not None:
        errors.append({'field': 'email', 'message': get_phrase('email_not_available_error', lang).format(email=email)})
    if errors:
        return jsonify({
            'errors': errors
        }), 400
    user = User(
        username=username,
        email=email,
        preferred_language=preferred_lang,
        last_seen=last_seen,
        registered=registered
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    send_registration_notification(user, lang)
    return jsonify({
        'username': user.username,
        'email': user.email,
        'preferredLang': user.preferred_language,
        'registered': user.registered,
        'lastSeen': user.last_seen,
        'aboutMe': user.about_me,
        'colorScheme': user.color_scheme,
        'deckType': user.deck_type
    }), 200


@user.route('{base_path}/user/profile/<username>'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['GET'])
def get_user(username):
    lang = request.headers.get('Accept-Language')
    username = username
    user = User.query.filter(func.lower(User.username) == func.lower(username)).first()
    if user is None:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('user_not_found_error', lang).format(username=username)
                }
            ]
        }), 404

    return jsonify({
        'username': user.username,
        'email': user.email,
        'preferredLang': user.preferred_language,
        'registered': user.registered,
        'lastSeen': user.last_seen,
        'aboutMe': user.about_me,
        'connectedRoomId': user.get_connected_room_id(),
        'stats': user.get_stats(),
        'colorScheme': user.color_scheme,
        'deckType': user.deck_type
    }), 200


@user.route('{base_path}/user/token'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['POST'])
@cross_origin()
def post_token():
    lang = request.headers.get('Accept-Language')
    username = request.json.get('username')
    password = request.json.get('password')
    user = User.query.filter(func.lower(User.username) == func.lower(username)).first()
    if user is None or not user.check_password(str(password)):
        return jsonify({
            'errors': [
                {'field': 'password', 'message': get_phrase('invalid_username_password_error', lang)},
                {'field': 'username', 'message': '   '}
            ]
        }), 401
    else:
        token = user.generate_auth_token()
        return jsonify({
            'username': user.username,
            'token': token,
            'expiresIn': auth['TOKEN_LIFETIME'][env],
            'connectedRoomId': user.get_connected_room_id(),
            'preferredLang': user.preferred_language,
            'colorScheme': user.color_scheme,
            'deckType': user.deck_type
        }), 201


@user.route('{base_path}/user/edit/<username>'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['PUT'])
@cross_origin()
def edit_user(username):

    lang = request.headers.get('Accept-Language')
    token = request.json.get('token')
    username = username
    requesting_user = User.verify_api_auth_token(token)
    if requesting_user is None:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('invalid_username_token_error', lang)
                }
            ]
        }), 401

    modified_user = User.query.filter_by(username=username).first()
    if modified_user is None:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('user_not_found_error', lang).format(username=username)
                }
            ]
        }), 404
    if modified_user != requesting_user:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('only_own_profile_update_error', lang).format(username=str(requesting_user.username))
                }
            ]
        }), 401
    email = None
    if request.json.get('email'):
        email = request.json.get('email').casefold()
    preferred_lang = request.json.get('preferredLang') or langs['DEFAULT'][env]
    about_me = ''
    if request.json.get('aboutMe'):
        about_me = request.json.get('aboutMe')
    color_scheme = request.json.get('colorScheme')
    deck_type = request.json.get('deckType')
    errors = []
    if email is not None and not re.match(regexps['EMAIL'][env], email):
        errors.append({'field': 'email', 'message': get_phrase('bad_email_error', lang)})
    email_user = User.query.filter_by(email=email).first()
    if email_user is not None and email_user != modified_user:
        errors.append({'field': 'email', 'message': get_phrase('email_not_available_error', lang).format(email=email)})
    if len(about_me) >= content['MAX_SYMBOLS'][env]:
        errors.append(
            {'field': 'aboutMe', 'message': get_phrase('about_me_max_symbols_error', lang).format(max_symbols=content['MAX_SYMBOLS'][env])}
        )

    if errors:
        return jsonify({
            'errors': errors
        }), 400

    modified_user.email = email
    modified_user.about_me = about_me
    modified_user.color_scheme = color_scheme
    modified_user.deck_type = deck_type
    modified_user.preferred_language = preferred_lang
    modified_user.last_seen = datetime.utcnow()
    db.session.commit()

    return jsonify({
        'username': modified_user.username,
        'email': modified_user.email,
        'preferredLang': modified_user.preferred_language,
        'registered': modified_user.registered,
        'lastSeen': modified_user.last_seen,
        'aboutMe': modified_user.about_me,
        'colorScheme': modified_user.color_scheme,
        'deckType': modified_user.deck_type,
        'connectedRoomId': modified_user.get_connected_room_id(),
        'stats': modified_user.get_stats()
    }), 200


@user.route('{base_path}/user/password/recover'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['POST'])
@cross_origin()
def send_password_recovery():

    lang = request.headers.get('Accept-Language')
    email = request.json.get('email')
    username = request.json.get('username')
    if app.debug:
        print(email)
        print(username)
    err = False
    if not email and not username:
        err = True
    requesting_user = None
    if username:
        requesting_user = User.query.filter(func.lower(User.username) == func.lower(username)).first()
    if email:
        requesting_user = User.query.filter_by(email=email).first()
    if not requesting_user:
        err = True
    #elif requesting_user.email != email:
    #    err = True

    if err:
        return jsonify({
            'errors': [
                {
                    'field': 'username',
                    'message': get_phrase('invalid_username_email_error', lang)
                },
                {
                    'field': 'email',
                    'message': get_phrase('invalid_username_email_error', lang)
                }
            ]
        }), 400

    send_password_reset_email(requesting_user, lang)

    return jsonify('Password recovery link is sent!'), 200


@user.route('{base_path}/user/invite'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['POST'])
@cross_origin()
def invite_user():
    lang = request.headers.get('Accept-Language')
    email = request.json.get('email')
    message = request.json.get('message')
    room_id = request.json.get('roomId')
    if not room_id:
        return jsonify({
            'errors': [
                {
                    'field': 'email',
                    'message': get_phrase('invalid_room_id_error', lang)
                },
                {
                    'field': 'message',
                    'message': '   '
                }
            ]
        })
    if email is not None and email != '' and not re.match(regexps['EMAIL'][env], email):
        return jsonify({
            'errors': [
                {'field': 'email', 'message': get_phrase('bad_email_error', lang)}
            ]
        })
    if app.debug:
        print(email)
        print(message)

    invite_token = User.get_invite_token(room_id)

    if email:
        send_invite_email(invite_token, room_id, email, message, lang)

    return jsonify({'inviteLink': '{site_url}/room/{room_id}/{token}'.format(
        site_url=get_settings('NAGELS_APP')['SITE_URL'][env],
        room_id=room_id,
        token=invite_token
    )}), 200


@user.route('{base_path}/user/temp'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['POST'])
@cross_origin()
def create_temp_account():

    lang = request.headers.get('Accept-Language')
    room_id = request.json.get('roomId')
    token = request.json.get('token')
    username = request.json.get('username')
    preferred_lang = langs['DEFAULT'][env]
    password = request.json.get('password')
    admin_secret = request.headers.get('ADMIN_SECRET')
    last_seen = datetime.utcnow()
    registered = datetime.utcnow()
    if app.debug:
        print(room_id)
        print(token)
        print(username)
        print(password)
    errors = []
    if auth['REGISTRATION_RESTRICTED'][env] and admin_secret != auth['ADMIN_SECRET'][env]:
        return jsonify({
            'errors': [
                {'field': 'username',
                 'message': get_phrase('registration_restricted_error', lang)},
                {'field': 'password', 'message': ' '}
            ]
        }), 400

    if User.verify_invite_token(token, room_id) != room_id:
        return jsonify({
            'errors': [
                {'field': 'username',
                 'message': get_phrase('invite_token_outdated_error', lang)},
                {'field': 'password', 'message': ' '}
            ]
        }), 400
    if username is None:
        errors.append({'field': 'username', 'message': get_phrase('required_error', lang)})
    if password is None:
        errors.append({'field': 'password', 'message': get_phrase('required_error', lang)})
    if password is not None and not re.match(regexps['PASSWORD'][env], password):
        errors.append({'field': 'password', 'message': requirements['PASSWORD'][env]})
    if User.query.filter(func.lower(User.username) == func.lower(username)).count() > 0:
        errors.append(
            {'field': 'username', 'message': get_phrase('username_not_available_error', lang).format(username=username)})
    if errors:
        return jsonify({
            'errors': errors
        }), 400
    temp_user = User(
        username=username,
        email=None,
        preferred_language=preferred_lang,
        last_seen=last_seen,
        registered=registered
    )
    temp_user.set_password(password)
    saved_token = Token.query.filter_by(token=token).first()
    saved_token.status = 'used'
    db.session.add(temp_user)
    db.session.commit()
    return jsonify({
        'username': temp_user.username,
        'preferredLang': temp_user.preferred_language,
        'registered': temp_user.registered,
        'lastSeen': temp_user.last_seen,
        'aboutMe': temp_user.about_me
    }), 200


@user.route('{base_path}/user/password/reset'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['POST'])
@cross_origin()
def reset_password():

    lang = request.headers.get('Accept-Language')
    new_password = request.json.get('newPassword')
    password_repeat = request.json.get('repeatPassword')
    token = request.json.get('token')
    requesting_user = User.verify_reset_password_token(token)
    if not requesting_user:
        return jsonify({
            'errors': [
                {
                    'field': 'newPassword',
                    'message': get_phrase('invalid_reset_token_error', lang)
                },
                {
                    'field': 'repeatPassword',
                    'message': get_phrase('invalid_reset_token_error', lang)
                }
            ]
        }), 401
    errors = []
    if requesting_user is None:
        return jsonify({
            'errors': [
                {
                    'field': 'newPassword',
                    'message': get_phrase('invalid_reset_token_error', lang)
                },
                {
                    'field': 'repeatPassword',
                    'message': get_phrase('invalid_reset_token_error', lang)
                }
            ]
        }), 401
    if not new_password:
        errors.append({
            'field': 'newPassword',
            'message': get_phrase('new_password_missing_error', lang)
        })
    if not password_repeat:
        errors.append({
            'field': 'repeatPassword',
            'message': get_phrase('password_confirmation_missing_error', lang)
        })
    if new_password != password_repeat:
        errors.append({
            'field': 'repeatPassword',
            'message': get_phrase('password_confirmation_error', lang)
        })
    if not re.match(regexps['PASSWORD'][env], new_password):
        errors.append({
            'field': 'newPassword',
            'message': requirements['PASSWORD'][env]
        })

    if errors:
        return jsonify({
            'errors': errors
        }), 400

    saved_token = Token.query.filter_by(token=token).first()
    requesting_user.set_password(new_password)
    saved_token.status = 'used'
    db.session.commit()

    return jsonify({
        'username': requesting_user.username
    }), 200


@user.route('/user/reset_password/<token>', methods=['GET'])
@cross_origin()
def reset_password_form(token):

    lang = request.headers.get('Accept-Language')
    user = User.verify_reset_password_token(token)
    if not user:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('invalid_reset_token_error', lang)
                }
            ]
        })

    return 'Here comes reset password form (under construction)!'


@user.route('{base_path}/user/password/new'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['POST'])
@cross_origin()
def new_password():
    lang = request.headers.get('Accept-Language')
    current_password = request.json.get('currentPassword')
    token = request.json.get('token')
    new_password = request.json.get('newPassword')
    password_repeat = request.json.get('passwordRepeat')
    requesting_user = User.verify_api_auth_token(token)
    errors = []
    if requesting_user is None:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('invalid_username_token_error', lang)
                }
            ]
        }), 401
    if not current_password:
        errors.append({
            'field': 'newPassword',
            'message': get_phrase('incorrect_current_password_error', lang)
        })
    if not new_password:
        errors.append({
            'field': 'newPassword',
            'message': get_phrase('new_password_missing_error', lang)
        })
    if not password_repeat:
        errors.append({
            'field': 'passwordRepeat',
            'message': get_phrase('password_confirmation_missing_error', lang)
        })
    if new_password != password_repeat:
        errors.append({
            'field': 'passwordRepeat',
            'message': get_phrase('password_confirmation_error', lang)
        })
    if not requesting_user.check_password(current_password):
        errors.append({
            'field': 'currentPassword',
            'message': get_phrase('incorrect_current_password_error', lang)
        })
    if not re.match(regexps['PASSWORD'][env], new_password):
        errors.append({
            'field': 'newPassword',
            'message': requirements['PASSWORD'][env]
        })

    if errors:
        return jsonify({
            'errors': errors
        }), 400
    else:
        if app.debug:
            print('setting new password')
            print(new_password)
        requesting_user.set_password(new_password)
        db.session.commit()

        return jsonify(get_phrase('new_password_saved', lang)), 200


@user.route('{base_path}/user/profilepic/<username>'.format(base_path=get_settings('API_BASE_PATH')[env]), methods=['POST'])
@cross_origin()
def upload_profile_pic(username):
    lang = request.headers.get('Accept-Language')
    token = request.headers.get('Token')
    requesting_user = User.verify_api_auth_token(token)
    if requesting_user is None:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('invalid_username_token_error', lang)
                }
            ]
        }), 401

    modified_user = User.query.filter(func.lower(User.username) == func.lower(username)).first()
    if modified_user is None:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('user_not_found_error', lang).format(username=username)
                }
            ]
        }), 404
    if modified_user != requesting_user:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('own_profile_pic_update_error', lang).format(
                        username=str(requesting_user.username))
                }
            ]
        }), 401
    '''if 'avatar' not in request.files:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('no_request_file_error', lang)
                }
            ]
        }), 403'''
    file = request.files['avatar']
    if app.debug:
        print(file.filename)
    if file.filename == '':
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('no_upload_file_error', lang)
                }
            ]
        }), 403
    file_extension = file.filename.rsplit('.', 1)[1].lower()
    if file_extension not in content['ALLOWED_FORMATS'][env].split(','):
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('allowed_format_error', lang).format(allowed_formats = content['ALLOWED_FORMATS'][env])
                }
            ]
        }), 403
    '''if 'content_length' not in file:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('no_file_size_error', lang)
                }
            ]
        }), 403
    if file.content_length > content['MAX_SIZE'][env]:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('file_size_error', lang).format(limit = app.config('MAX_CONTENT_SIZE'))
                }
            ]
        }), 403'''
    filename = str(modified_user.username) + '.' + file_extension
    try:
        if app.debug:
            print(os.path.join(content['UPLOAD_FOLDER'][env], filename))
        file.save(os.path.join(content['UPLOAD_FOLDER'][env], filename))
    except Exception as e:
        return jsonify({
            'errors': [
                {
                    'message': get_phrase('file_upload_error', lang) + str(e)
                }
            ]
        }), 403
    return jsonify(200)


