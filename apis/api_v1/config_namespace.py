import logging
import os
import yaml
from flask import current_app
from flask_restx import Namespace, Resource
from separators import Demucs, Spleeter

logger = logging.getLogger(__file__)

api = Namespace("config", path="/config", description="Config")

@api.route("/app")
class AppConfig(Resource):
    def get(self):
        with open(os.path.join(os.path.dirname(__file__), "../../separator-config.yaml"), "r") as f:
            separator_config = yaml.safe_load(f)
        return {
            # "login_features": {
            #     "login_enabled": current_app.config["ENABLE_LOGIN"],
            #     "login_required": current_app.config["REQUIRE_LOGIN"],
            #     "google_login": current_app.config["GOOGLE_OAUTH_TOKEN"] is not None,
            #     "apple_login": current_app.config["APPLE_TOKEN"] is not None
            # },
            "separator_config": [
                Demucs(separator_config).serialize(),
                Spleeter(separator_config).serialize()
            ],
            "default_separator": "demucs"
        }