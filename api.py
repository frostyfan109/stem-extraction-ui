import os
from flask import Flask
from datetime import timedelta
from models import db, bcrypt
from cache import cache
from _jwt import jwt

def create_app():
    app = Flask(__name__)   
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.environ["JWT_SECRET_KEY"]
    app.config["JWT_TOKEN_LOCATION"] = ["headers", "cookies"]
    app.config["JWT_ACCESS_COOKIE_NAME"] = "access_token"
    app.config["JWT_REFRESH_COOKIE_NAME"] = "refresh_token"
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(seconds=600)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(weeks=4)

    app.config["ENABLE_LOGIN"] = os.environ.get("ENABLE_LOGIN", "true") == "true"
    app.config["GOOGLE_OAUTH_TOKEN"] = os.environ.get("GOOGLE_OAUTH_TOKEN", None)
    app.config["APPLE_TOKEN"] = os.environ.get("APPLE_TOKEN", None)
    
    bcrypt.init_app(app)
    jwt.init_app(app)
    db.init_app(app)
    with app.app_context():
        db.create_all()
    cache.init_app(app)

    from apis.api_v1 import blueprint as api_v1
    app.register_blueprint(api_v1)

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