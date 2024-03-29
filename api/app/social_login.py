from flask import url_for, redirect, request
from rauth import OAuth2Service
import json
from config import get_settings, get_environment


class OAuthSignIn(object):
    providers = None

    def __init__(self, provider_name):
        self.provider_name = provider_name
        credentials = get_settings('AUTH')[get_environment()]['OAUTH_CREDENTIALS'][provider_name]
        self.consumer_id = credentials['ID']
        self.consumer_secret = credentials['SECRET']

    def authorize(self):
        pass

    def callback(self):
        pass

    def get_callback_url(self):
        return url_for('oauth_callback', provider=self.provider_name,
                       _external=True)

    @classmethod
    def get_provider(self, provider_name):
        if self.providers is None:
            self.providers = {}
            for provider_class in self.__subclasses__():
                provider = provider_class()
                self.providers[provider.provider_name] = provider
        return self.providers[provider_name]


class FacebookSignIn(OAuthSignIn):
    def __init__(self):
        super(FacebookSignIn, self).__init__('facebook')
        self.service = OAuth2Service(
            name='facebook',
            client_id=self.consumer_id,
            client_secret=self.consumer_secret,
            authorize_url='https://graph.facebook.com/oauth/authorize',
            access_token_url='https://graph.facebook.com/oauth/access_token',
            base_url='https://graph.facebook.com/'
        )

    def authorize(self):
        return redirect(self.service.get_authorize_url(
            scope='email',
            response_type='code',
            redirect_uri=self.get_callback_url())
        )

    def callback(self):
        def decode_json(payload):
            return json.loads(payload.decode('utf-8'))

        if 'code' not in request.args:
            return None, None, None
        oauth_session = self.service.get_auth_session(
            data={'code': request.args['code'],
                  'grant_type': 'authorization_code',
                  'redirect_uri': self.get_callback_url()},
            decoder=decode_json
        )
        me = oauth_session.get('me?fields=id,name,email').json()
        pic = oauth_session.get('me/picture?fields=url&type=large')
        return (
            'facebook$' + me['id'],
            me.get('email').split('@')[0],
            me.get('email'),
            me.get('gender'),
            me.get('timezone'),
            me.get('locale'),
            pic.url
        )