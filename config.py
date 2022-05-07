from datetime import timedelta
import os

SQLALCHEMY_DATABASE_URI = "sqlite:///app.db"
SQLALCHEMY_TRACK_MODIFICATIONS = False

JWT_SECRET_KEY = os.environ["JWT_SECRET_KEY"]
POLL_DELAY = int(os.environ.get("POLL_DELAY", "1000")) / 1000
ENABLE_LOGIN = os.environ.get("ENABLE_LOGIN", "true") == "true"
GOOGLE_OAUTH_TOKEN = os.environ.get("GOOGLE_OAUTH_TOKEN", None)
APPLE_TOKEN = os.environ.get("APPLE_TOKEN", None)
STORAGE = os.environ["STORAGE"]
AWS_BUCKET_NAME = os.environ.get("AWS_BUCKET_NAME", None)
AWS_ACCESS_KEY = os.environ.get("AWS_ACCESS_KEY", None)
AWS_SECRET_KEY = os.environ.get("AWS_SECRET_KEY", None)

JWT_ACCESS_COOKIE_NAME = "access_token"
JWT_REFRESH_COOKIE_NAME = "refresh_token"
JWT_ACCESS_TOKEN_EXPIRES = timedelta(seconds=600)
JWT_REFRESH_TOKEN_EXPIRES = timedelta(weeks=4)
JWT_TOKEN_LOCATION = ["headers", "cookies"]