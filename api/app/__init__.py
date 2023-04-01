from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from config import get_settings, get_environment
from flask_mail import Mail
from flask_socketio import SocketIO

flask_configs = get_settings()
env = get_environment()

app = Flask(__name__)
app.config.update(
    SQLALCHEMY_DATABASE_URI=flask_configs['SQLALCHEMY_DATABASE_URI'][env],
    SQLALCHEMY_TRACK_MODIFICATIONS=flask_configs['SQLALCHEMY_TRACK_MODIFICATIONS'][env]
)
cors = CORS(app)

db = SQLAlchemy(app)
migrate = Migrate(app, db)
login = LoginManager(app)
login.login_view = 'login'


mail_settings = get_settings('MAIL')
for key in mail_settings.keys():
    app.config['MAIL_' + str(key)] = mail_settings[key][env]
mail = Mail(app)

socketio = SocketIO(app, cors_allowed_origins="*")


from app import routes, models, socket
