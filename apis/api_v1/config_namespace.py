import logging
import os
import yaml
from flask import current_app
from flask_restx import Namespace, Resource
from flask_jwt_extended import get_jwt_identity
from .jwt_decorators import jwt_required
from separators import separators

logger = logging.getLogger(__file__)

api = Namespace("config", path="/config", description="Config")

@api.route("/app")
class AppConfig(Resource):
    @jwt_required(optional=True)
    def get(self):
        
        login_state = None
        username = get_jwt_identity()
        if username is not None:
            login_state = {

            }
        return {
            "separator_config": [separator.serialize() for separator in separators],
            "default_separator": "demucs",
            "login_state": login_state
        }