import logging
import json
import jsonschema
import time
import config
from flask import request, make_response, current_app, g
from flask.json import jsonify
from flask_restx import Namespace, Resource, inputs
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    get_jwt_identity, set_access_cookies, set_refresh_cookies
)
from werkzeug import datastructures
from mimetypes import guess_type
from celery.result import AsyncResult
from tasks import celery
from models import db
from models.separation import DbFile, Separation, StemType
from models.user import User
from storage_manager import StorageManagerFactory
from tasks import separate
from .jwt_decorators import jwt_required
from .exceptions import APIException, LoginDisabled
from separators import separators

logger = logging.getLogger(__file__)

api = Namespace("users", path="/user", description="Login and user-related endpoints")

@api.route("/history")
class UserHistory(Resource):
    @jwt_required()
    def get(self):
        return [{"title": "Post 1"}, {"title": "Post 3"}, {"title": "Post 3"}]

separate_parser = api.parser()
separate_parser.add_argument("file", type=datastructures.FileStorage, location="files", required=True)
separate_parser.add_argument("separator_id", type=str, location="form", required=True)
separate_parser.add_argument("args", type=str, location="form", required=True)
@api.route("/separate")
class Separate(Resource):
    @jwt_required(optional=True)
    @api.expect(separate_parser)
    def post(self):
        request_args = separate_parser.parse_args()
        file = request_args["file"]
        separator_id = request_args["separator_id"]
        separator_args = json.loads(request_args["args"])
        
        mimetype = guess_type(file.filename)[0]
        file_name_no_ext = ".".join(file.filename.split(".")[0:-1])
        file_extension = file.filename.split(".")[-1]
        if mimetype is None or not mimetype.split("/")[0] == "audio":
            return {
                "message": f'Invalid file name or type: "{file.filename}".'
            }, 400
        try:
            separator = [separator for separator in separators if separator.key == separator_id][0]
        except Exception as e:
            return {
                "message": f'Separator with id "{separator_id}" is not supported by the API.'
            }, 400

        file_bytes = file.read()
        
        # These will be validated again but want to validate
        # before uploading files/db operations/etc.
        try:
            separator.create_cli_args([], separator_args)
        except jsonschema.ValidationError as e:
            return {
                "message": "Arguments violate the separator's schema",
                "data": str(e)
            }, 400

        storage_manager = StorageManagerFactory.get()

        username = get_jwt_identity()
        user = User.query.filter_by(username=username).first()
        separation = Separation(separator=separator.key)
        if username is not None:
            user.separations.append(separation)
        uploaded_file = storage_manager.upload_file_bytes(
            file_bytes,
            file_extension,
            # Multiple files can be uploaded under the same file name,
            # but the generated key is ensured to be different.
            f"/{username if username is not None else '<anonymous>'}/{file_name_no_ext}"
        )
        source_file = DbFile(
            file_name=file.filename,
            stem_type=StemType.SOURCE,
            storage_id=uploaded_file.identifier,
            storage_container=uploaded_file.container
        )
        separation.files.append(source_file)
        task = separate.apply_async([separator.key, uploaded_file.identifier, uploaded_file.container.value, separator_args])
        separation.task_id = task.id

        db.session.add(separation)
        db.session.commit()
        
        return {
            "id": separation.url_id
        }

separator_monitor_parser = api.parser()
separator_monitor_parser.add_argument("client_state", type=dict, location="json", required=False, default=None)
@api.route("/separate/<string:separation_id>")
class SeparateMonitor(Resource):
    @jwt_required()
    @api.expect(separator_monitor_parser)
    def post(self, separation_id):
        args = separator_monitor_parser.parse_args()
        client_state = args["client_state"]
        username = get_jwt_identity()
        user = User.query.filter_by(username=username).first()
        separation = Separation.query.filter_by(url_id=separation_id).first()
        if separation is None or user.id != separation.user_id:
            return {
                "message": "Separation does not exist."
            }, 404
        POLLING_CUTOFF = 10 # seconds
        START_TIME = time.time()
        while True:
            res = AsyncResult(separation.task_id)
            server_state = {
                "state": res.state,
                "data": res.info,
                "separation": separation.serialize(),
                "queue_position": None
            }
            if json.dumps(client_state) != json.dumps(server_state):
                return server_state
            if time.time() - START_TIME > POLLING_CUTOFF:
                return server_state
            if res.status == "SUCCESS" or res.status == "FAILURE":
                return server_state
            time.sleep(config.POLL_DELAY)

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
        if not config.ENABLE_LOGIN:
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
        if not config.ENABLE_LOGIN:
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