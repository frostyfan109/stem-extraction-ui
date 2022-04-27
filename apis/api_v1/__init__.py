from http import HTTPStatus
import json
import re
import traceback
from flask import Blueprint, request
from flask_cors import CORS
from flask_caching import Cache
from flask_restx import Api
from werkzeug.exceptions import HTTPException
from apis.api_v1.config_namespace import api as config_ns
from apis.api_v1.separator_namespace import api as separator_ns
from apis.api_v1.user_namespace import api as user_ns

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
@blueprint.after_request
def response_processor(response):
    relative_url = re.sub(api.base_url, "", request.url, count=1)
    if "/" + relative_url == "/swagger.json":
        # Serving swagger spec, don't transform the response.
        return response
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