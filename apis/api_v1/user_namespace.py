import logging
from flask import request
from flask_restx import Namespace, Resource, inputs
from werkzeug.exceptions import Unauthorized
from apis.api_v1.exceptions import APIException

logger = logging.getLogger(__file__)

api = Namespace("users", path="/user", description="Login and user-related endpoints")

class FormError(APIException, Unauthorized):
    code = 401
    description = "Form field rejected"
    def __init__(self, field, message):
        super().__init__(None, {
            "fieldName": field,
            "message": message
        })

@api.route("/history")
class UserHistory(Resource):
    def get(self):
        return [{"title": "Post 1"}, {"title": "Post 3"}, {"title": "Post 3"}]

login_parser = api.parser()
login_parser.add_argument("username", type=str, location="json", required=True)
login_parser.add_argument("password", type=str, location="json", required=True)
login_parser.add_argument("remember_me", type=inputs.boolean, location="json", default=True, required=False)
@api.route("/login")
class UserLogin(Resource):
    @api.expect(login_parser)
    @api.response(401, FormError.description)
    def post(self):
        args = login_parser.parse_args()
        username = args["username"]
        password = args["password"]
        remember_me = args["remember_me"]
        if username == "a" and password == "a":
            return {}, 200
        raise FormError("login_username", "Incorrect username or password")
        # return {}, 200
        # return [{
        #     "fieldName": "login_username",
        #     "message": "Incorrect username or password"
        # }], 401

@api.route("/register")
class UserRegister(Resource):
    def post(self):
        pass

@api.route("/logout")
class UserLogout(Resource):
    def post(self):
        pass