import re
import os
import config
from werkzeug.wrappers import Request
from werkzeug.http import parse_cookie
from flask_jwt_extended import decode_token, create_access_token

class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app
        self.wsgi_app = app.wsgi_app

    def __call__(self, environ, start_response):
        request = Request(environ, shallow=True)
        
        access_cookie_name = config.JWT_ACCESS_COOKIE_NAME
        refresh_cookie_name = config.JWT_REFRESH_COOKIE_NAME
        login_enabled = config.ENABLE_LOGIN
        
        new_token = None
        access_token = request.cookies.get(refresh_cookie_name)
        if not access_token:
            try: access_token = re.sub("Bearer ", "", request.headers.get("Authorization"))
            except: pass
        refresh_token = request.cookies.get(refresh_cookie_name, None)
        if access_token and refresh_token and login_enabled:
            try:
                with self.app.app_context():
                    access_jwt = decode_token(access_token, allow_expired=True)
                    refresh_jwt = decode_token(refresh_token, allow_expired=False)
                    identity = access_jwt.get("sub")
                    new_token = create_access_token(identity=identity)
                    environ["HTTP_AUTHORIZATION"] = "Bearer " + new_token
            except Exception as e:
                print(e)

        if not login_enabled:
            # If login isn't enabled, sterilize the request of JWT authentication data
            # so that a request with jwt optional doesn't raise an error about login being disabled.
            if "HTTP_AUTHORIZATION" in environ:
                del environ["HTTP_AUTHORIZATION"]
            if "HTTP_COOKIE" in environ:
                cookie = parse_cookie(environ)
                if access_cookie_name in cookie:    
                    del cookie[access_cookie_name]
                if refresh_cookie_name in cookie:
                    del cookie[refresh_cookie_name]
                cookie_str = "; ".join([f"{cookie_name}={cookie[cookie_name]}" for cookie_name in cookie])
                environ["HTTP_COOKIE"] = cookie_str

        def new_start_response(status, response_headers, exc_info=None):
            if new_token is not None:
                response_headers.append(("X-Set-Access-Token", new_token))
            return start_response(status, response_headers, exc_info)

        return self.wsgi_app(environ, new_start_response)