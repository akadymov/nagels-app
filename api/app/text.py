import json
from app import get_settings

with open('./user-text.json') as f:
    data = json.load(f)

env = get_settings('ENVIRONMENT')
default_lang = get_settings('LANGS')['DEFAULT'][env]


def get_phrase(phrase_id, lang=default_lang):
    if not lang:
        lang = get_settings('LANGS')['DEFAULT'][env]
    for obj in data['phrases']:
        if obj['id'] == phrase_id:
            if lang in obj:
                return obj[lang]
            else:
                return None
    return None
