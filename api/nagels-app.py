from app import app, db
from app.models import User, Room, Game, Hand, Turn, Player, TurnCard, DealtCards, HandScore
from config import get_settings, get_environment
import logging
from logging.handlers import RotatingFileHandler

env = get_environment()
flask_configs = get_settings('FLASK')


@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'Room': Room, 'Game': Game, 'Hand': Hand, 'Turn': Turn, 'Player': Player, 'TurnCard': TurnCard, 'DealtCards': DealtCards, 'HandScore': HandScore}


if __name__ == '__main__':
    app.run(port=flask_configs['PORT'][env], debug=flask_configs['DEBUG'][env])

if flask_configs['DEBUG'][env]:
    # настройка обработчика логов Flask
    formatter = logging.Formatter('%(asctime)s %(levelname)s: %(message)s '
                                  '[in %(pathname)s:%(lineno)d]')
    file_handler = RotatingFileHandler('logs/nagels-app.log', maxBytes=10240,
                                       backupCount=10)
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.INFO)

    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info('nagels-app startup')
