import logging
import traceback
import json
from flask import Flask, Response, request, send_file
from werkzeug.exceptions import HTTPException
from flask_restx import Api, Resource, inputs, abort
from flask_cors import CORS
from flask_caching import Cache
from werkzeug import datastructures
from http import HTTPStatus
from subprocess import Popen, PIPE
from config import config

logger = logging.getLogger(__file__)

app = Flask(__name__)
CORS(app)
api = Api(app)
cache = Cache(app)

@api.errorhandler(HTTPException)
def http_error_handler(error):
    code = getattr(error, "code", 500)
    return {
        "message": error.description,
        "error": True
    }, code
@api.errorhandler(Exception)
def other_error_handler(error):
    code = HTTPStatus.INTERNAL_SERVER_ERROR
    return {
        "message": code.phrase,
        "error": True,
        "error_info": {
            "traceback": traceback.format_exc()
        }
    }, code.value

@app.after_request
def response_processor(response):
    if response.json is not None:
        data = response.json
        # If the application errored, then the error handlers have already processed it,
        # returning a dict, so a non-dict JSON response can't be an error.
        if not isinstance(data, dict) or not data.get("error"):
            data = {
                "data": data
            }
        data["status_code"] = response.status_code
        response.data = json.dumps(data)
    return response

@api.route("/app_config")
class AppConfig(Resource):
    def get(self):
        return config

@api.route("/split_audio")
class SplitAudio(Resource):
    def post(self):
        return None

@api.route("/user/history")
class UserHistory(Resource):
    def get(self):
        return [{"title": "Post 1"}, {"title": "Post 3"}, {"title": "Post 3"}]

@api.route("/user/login")
class UserLogin(Resource):
    def post(self):
        print(request.data)
        return {}, 401

@api.route("/user/register")
class UserRegister(Resource):
    def post(self):
        pass

@api.route("/user/logout")
class UserLogout(Resource):
    def post(self):
        pass


if __name__ == "__main__":
    import argparse
    import os
    parser = argparse.ArgumentParser(description="Specify API arguments")
    parser.add_argument("-r", "--reloader", help="Automatically restart API upon modification", action="store_true", default=True)
    args = parser.parse_args()

    port = os.environ["API_PORT"]

    app.run(
        host="0.0.0.0",
        port=port,
        use_reloader=args.reloader,
        threaded=True
    )