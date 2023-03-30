import yaml
import os


def get_settings(section=None):
    with open("config.yml", "r") as configfile:
        cfg = yaml.load(configfile, Loader=yaml.FullLoader)
        if section:
            return cfg[section]
        return cfg['FLASK']


def get_environment():
    if os.environ.get('ENVIRONMENT'):
        return os.environ.get('ENVIRONMENT')
    with open("config.yml", "r") as configfile:
        return yaml.load(configfile, Loader=yaml.FullLoader)['ENVIRONMENT']
