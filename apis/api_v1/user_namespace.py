import logging
from flask import request, make_response, current_app
from flask.json import jsonify
from flask_restx import Namespace, Resource, inputs
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    get_jwt_identity, set_access_cookies, set_refresh_cookies
)
from models import db
from models.user import User
from .jwt_decorators import jwt_required
from .exceptions import APIException, LoginDisabled

logger = logging.getLogger(__file__)

api = Namespace("users", path="/user", description="Login and user-related endpoints")

@api.route("/")
class Users(Resource):
    def get(self):
        return [user.serialize() for user in User.query.all()]

@api.route("/history")
class UserHistory(Resource):
    @jwt_required()
    def get(self):
        return [{"title": "Post 1"}, {"title": "Post 3"}, {"title": "Post 3"}]

login_parser = api.parser()
login_parser.add_argument("username", type=str, location="json", required=True)
login_parser.add_argument("password", type=str, location="json", required=True)
login_parser.add_argument("remember_me", type=inputs.boolean, location="json", default=True, required=False)
@api.route("/login")
class UserLogin(Resource):
    @api.expect(login_parser)
    def post(self):
        args = login_parser.parse_args()
        username = args["username"]
        password = args["password"]
        remember_me = args["remember_me"]
        if not current_app.config["ENABLE_LOGIN"]:
            raise LoginDisabled()
        user = User.query.filter_by(username=username).first()
        if not user or not user.verify_password(password):
            # Most platforms don't inform you if the user doesn't exist,
            # but will instead just give a general umbrella message like so.
            return {
                "fieldName": "login_username",
                "message": "Incorrect username or password"
            }, 401
        access_token = create_access_token(identity=username)
        refresh_token = create_refresh_token(identity=username)
        response = jsonify({})
        response.headers["X-Set-Access-Token"] = access_token
        response.headers["X-Set-Refresh-Token"] = refresh_token
        return make_response(response, 200)

register_parser = api.parser()
register_parser.add_argument("username", type=str, location="json", required=True)
register_parser.add_argument("email", type=inputs.email(check=True), location="json", required=True)
register_parser.add_argument("password", type=str, location="json", required=True)
register_parser.add_argument("remember_me", type=inputs.boolean, location="json", default=True, required=False)
@api.route("/register")
class UserRegister(Resource):
    @api.expect(register_parser)
    def post(self):
        args = register_parser.parse_args()
        username = args["username"]
        email = args["email"]
        password = args["password"]
        remember_me = args["remember_me"]
        if not current_app.config["ENABLE_LOGIN"]:
            raise LoginDisabled()
        if User.query.filter_by(username=username).first():
            return {
                "fieldName": "signup_username",
                "message": "That username is already taken"
            }, 400
        if User.query.filter_by(email=email).first():
            return {
                "fieldName": "signup_email",
                "message": "That email is already taken"
            }, 400
        user = User(
            username=username,
            email=email,
            password=password
        )
        db.session.add(user)
        db.session.commit()
        access_token = create_access_token(identity=username)
        refresh_token = create_refresh_token(identity=username)
        response = jsonify({})
        response.headers["X-Set-Access-Token"] = access_token
        response.headers["X-Set-Refresh-Token"] = refresh_token
        return make_response(response, 200)

@api.route("/logout")
class UserLogout(Resource):
    @jwt_required()
    def post(self):
        response = jsonify({})
        response.headers["X-Clear-Access-Token"] = "true"
        response.headers["X-Clear-Refresh-Token"] = "true"
        return make_response(response, 200)