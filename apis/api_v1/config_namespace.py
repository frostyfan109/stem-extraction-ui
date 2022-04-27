import logging
from flask_restx import Namespace, Resource
from config import config

logger = logging.getLogger(__file__)

api = Namespace("config", path="/config", description="Config")

@api.route("/app")
class AppConfig(Resource):
    def get(self):
        return config