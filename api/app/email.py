from threading import Thread
from flask import render_template
from flask_mail import Message
from app import app, mail
from config import get_settings, get_environment

auth = get_settings('AUTH')
env = get_environment()
nagels_app = get_settings('NAGELS_APP')
default_lang = get_settings('LANGS')['DEFAULT'][env]


def send_async_email(app, msg):
    with app.app_context():
        try:
            mail.send(msg)
        except Exception as e:
            print(e)
            if app.debug:
                print('MAIL_SERVER: ' + str(app.config['MAIL_SERVER']))
                print('MAIL_PORT: ' + str(app.config['MAIL_PORT']))
                print('MAIL_USERNAME: ' + str(app.config['MAIL_USERNAME']))
                print('MAIL_PASSWORD: ' + str(app.config['MAIL_PASSWORD']))
                print('MAIL_PASSWORD: ' + str(app.config['MAIL_PASSWORD']))
                print('MAIL_USE_TLS: ' + str(app.config['MAIL_USE_TLS']))
                print('MAIL_USE_SSL: ' + str(app.config['MAIL_USE_SSL']))


def send_email(subject, sender, recipients, text_body, html_body):
    if env != 'PROD':
        recipients = auth['ADMINS'][env].split(',')
    if app.debug:
        print('Sending message with subject "' + str(subject) + '" from sender ' + str(sender) + ' to emails ' + str(
            recipients) + ')...')
    msg = Message(subject, sender=sender, recipients=recipients)
    msg.body = text_body
    msg.html = html_body
    Thread(target=send_async_email, args=(app, msg)).start()


def send_password_reset_email(user, lang=default_lang):
    token = user.get_reset_password_token()
    send_email(
        '[Nägels Online] Reset Your Password',
        sender=auth['ADMINS'][env].split(',')[0],
        recipients=[user.email],
        text_body=render_template(
            'email/reset_password_' + lang + '.txt',
            nagels_url=nagels_app['SITE_URL'][env],
            user=user,
            token=token
        ),
        html_body=render_template(
            'email/reset_password_' + lang + '.html',
            nagels_url=nagels_app['SITE_URL'][env],
            user=user,
            token=token
        )
    )


def send_invite_email(token, room_id, email, message, lang=default_lang):
    send_email(
        '[Nägels Online] Invitation to join game',
        sender=auth['ADMINS'][env].split(',')[0],
        recipients=[email],
        text_body=render_template(
            'email/invite_' + lang + '.txt',
            nagels_url=nagels_app['SITE_URL'][env],
            room_id=room_id,
            message=message,
            token=token
        ),
        html_body=render_template(
            'email/invite_' + lang + '.html',
            nagels_url=nagels_app['SITE_URL'][env],
            room_id=room_id,
            message=message,
            token=token
        )
    )


def send_registration_notification(user, lang=default_lang):
    send_email('[Nägels Online] Welcome letter',
               sender=auth['ADMINS'][env].split(',')[0],
               recipients=[user.email],
               text_body=render_template('email/register_en.txt',
                                         user=user),
               html_body=render_template('email/register_en.html',
                                         user=user))


def send_feedback(message, sender_email=None, sender_name=None, lang=default_lang):
    if not sender_email:
        sender_email = auth['ADMINS'][env].split(',')[0]
    if not sender_name:
        sender_name = 'nagels app anonymous user'
    send_email(
        '[Nägels Online] Feedback from user',
        sender=(sender_name, sender_email),
        recipients=auth['ADMINS'][env].split(','),
        text_body=render_template('email/feedback_' + lang + '.txt', message=message, sender_name=sender_name),
        html_body=render_template('email/feedback_' + lang + '.html', message=message, sender_name=sender_name)
    )
