from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from config import get_settings, get_environment
from flask_mail import Mail
from flask_socketio import SocketIO
# from werkzeug.middleware.proxy_fix import ProxyFix
from threading import Lock

flask_configs = get_settings()
env = get_environment()

app = Flask(__name__)
app.config.update(
    SQLALCHEMY_DATABASE_URI=flask_configs['SQLALCHEMY_DATABASE_URI'][env],
    SQLALCHEMY_TRACK_MODIFICATIONS=flask_configs['SQLALCHEMY_TRACK_MODIFICATIONS'][env]
)
CORS(app)
# app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1)

db = SQLAlchemy(app)
migrate = Migrate(app, db)
login = LoginManager(app)
login.login_view = 'login'


mail_settings = get_settings('MAIL')
for key in mail_settings.keys():
    app.config['MAIL_' + str(key)] = mail_settings[key][env]
mail = Mail(app)


# Set this variable to "threading", "eventlet" or "gevent" to test the
# different async modes, or leave it set to None for the application to choose
# the best option based on installed packages.
async_mode = 'gevent'
socketio = SocketIO(
    app,
    async_mode=async_mode,
    cors_allowed_origins=get_settings('NAGELS_APP')['SITE_URL'][env],
    logger=flask_configs['DEBUG'][env],
    engineio_logger=flask_configs['DEBUG'][env]
)
thread = None
thread_lock = Lock()

from app import routes, models, socket
