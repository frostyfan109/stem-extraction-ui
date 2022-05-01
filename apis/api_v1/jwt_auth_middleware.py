import re
import os
from werkzeug.wrappers import Request
from flask_jwt_extended import decode_token, create_access_token

class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app
        self.wsgi_app = app.wsgi_app

    def __call__(self, environ, start_response):
        request = Request(environ, shallow=True)
        
        new_token = None
        access_token = request.cookies.get(self.app.config["JWT_REFRESH_COOKIE_NAME"])
        if not access_token:
            try: access_token = re.sub("Bearer ", "", request.headers.get("Authorization"))
            except: pass
        refresh_token = request.cookies.get(self.app.config["JWT_REFRESH_COOKIE_NAME"], None)
        if access_token and refresh_token and self.app.config["ENABLE_LOGIN"]:
            try:
                with self.app.app_context():
                    access_jwt = decode_token(access_token, allow_expired=True)
                    refresh_jwt = decode_token(refresh_token, allow_expired=False)
                    identity = access_jwt.get("sub")
                    new_token = create_access_token(identity=identity)
                    environ["HTTP_AUTHORIZATION"] = "Bearer " + new_token
            except Exception as e:
                print(e)

        def new_start_response(status, response_headers, exc_info=None):
            if new_token is not None:
                response_headers.append(("X-Set-Access-Token", new_token))
            return start_response(status, response_headers, exc_info)

        return self.wsgi_app(environ, new_start_response)