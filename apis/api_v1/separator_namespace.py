import logging
from flask_restx import Namespace, Resource

logger = logging.getLogger(__file__)

api = Namespace("separation", path="/separate", description="Separation-related endpoints")

@api.route("/audio")
class SeparateAudio(Resource):
    def post(self):
        return None