from http import HTTPStatus
import json
import re
import traceback
from venv import create
from flask import Blueprint, request, make_response, current_app
from flask.json import jsonify
from flask_cors import CORS
from flask_caching import Cache
from flask_restx import Api
from flask_jwt_extended import create_access_token, decode_token
from flask_jwt_extended.exceptions import JWTExtendedException
from jwt import decode, ExpiredSignatureError, PyJWTError
from werkzeug.exceptions import HTTPException

from .jwt_auth_middleware import JWTAuthMiddleware
from .config_namespace import api as config_ns
from .separator_namespace import api as separator_ns
from .user_namespace import api as user_ns

blueprint = Blueprint("Stem Extraction API (v1)", __name__, url_prefix="/api/v1")
cors = CORS(blueprint)
api = Api(blueprint, version="1.0")

api.add_namespace(config_ns)
api.add_namespace(separator_ns)
api.add_namespace(user_ns)

@api.errorhandler(HTTPException)
def http_error_handler(error):
    code = getattr(error, "code", 500)
    return {
        "message": error.description,
        "data": getattr(error, "_data", None),
        "error": True
    }, code
@api.errorhandler(PyJWTError)
@api.errorhandler(JWTExtendedException)
def expired_signature_handler(error):
    message = "JWT exception: " + str(error)
    code = 401
    error_info = None
    if isinstance(error, ExpiredSignatureError):
        message = "Your JWT credentials have expired."
        code = 401
    return {
        "message": message,
        "error": True,
        "_clear_jwt": True,
        **({"error_info": error_info} if error_info else {})
    }, code
@api.errorhandler(Exception)
def other_error_handler(error):
    print(type(error))
    code = HTTPStatus.INTERNAL_SERVER_ERROR
    return {
        "message": code.phrase,
        "error": True,
        "error_info": {
            "traceback": traceback.format_exc()
        }
    }, code.value
@blueprint.before_app_first_request
def before_app_first_request():
    app = current_app._get_current_object()
    app.wsgi_app = JWTAuthMiddleware(app)
@blueprint.after_request
def response_processor(response):
    relative_url = re.sub(api.base_url, "", request.url, count=1)
    if "/" + relative_url == "/swagger.json":
        # Serving swagger spec, don't transform the response.
        return response
    response.headers.add(
        "Access-Control-Expose-Headers", 
        "X-Set-Access-Token, X-Set-Refresh-Token, X-Clear-Access-Token, X-Clear-Refresh-Token"
    )
    response.headers.add(
        "Access-Control-Allow-Credentials", "true"
    )
    if response.json is not None:
        data = response.json
        if isinstance(data, dict) and data.get("error") and data.get("_clear_jwt"):
            # There is no apparent way to set headers within an errorhandler,
            # so need to manually post-process them here.
            response.headers.add("X-Clear-Access-Token", "true")
            response.headers.add("X-Clear-Refresh-Token", "true")
            del data["_clear_jwt"]
        # If the application errored, then the error handlers have already processed it,
        # returning a dict, so a non-dict JSON response can't be an error.
        if not isinstance(data, dict) or not data.get("error"):
            data = {
                "data": data
            }
        data["status_code"] = response.status_code
        response.data = json.dumps(data)
    return response