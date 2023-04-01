from app import app, db, socketio
from app.models import User, Room, Game, Hand, Turn, Player, TurnCard, DealtCards, HandScore
from config import get_settings, get_environment
from app import socket


env = get_environment()
flask_configs = get_settings('FLASK')


@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'Room': Room, 'Game': Game, 'Hand': Hand, 'Turn': Turn, 'Player': Player, 'TurnCard': TurnCard, 'DealtCards': DealtCards, 'HandScore': HandScore}


if __name__ == '__main__':
    socketio.run(app, debug=flask_configs['DEBUG'][env], port=flask_configs['SOCKET_PORT'][env])
