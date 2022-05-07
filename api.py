import os
import config
from flask import Flask
from apis.api_v1.jwt_auth_middleware import JWTAuthMiddleware
from models import db, bcrypt
from cache import cache
from _jwt import jwt

def create_app():
    app = Flask(__name__)   
    
    app.config.from_object(config)

    bcrypt.init_app(app)
    jwt.init_app(app)
    db.init_app(app)
    cache.init_app(app)

    with app.app_context():
        db.create_all()

    from apis.api_v1 import blueprint as api_v1
    app.register_blueprint(api_v1)

    # Middleware cannot be applied selectively to blueprints due to
    # the nature of their implementation. It also cannot be attached
    # in @blueprint.before_first_request since middleware runs before
    # a request (so it won't run on the first request).
    app.wsgi_app = JWTAuthMiddleware(app)

    return app

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Specify API arguments")
    parser.add_argument("-r", "--reloader", help="Automatically restart API upon modification", action="store_true", default=True)
    args = parser.parse_args()

    port = 8000

    app = create_app()
    app.run(
        host="0.0.0.0",
        port=port,
        use_reloader=args.reloader,
        threaded=True
    )