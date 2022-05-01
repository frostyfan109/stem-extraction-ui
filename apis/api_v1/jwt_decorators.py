from functools import wraps
from flask import current_app
from flask_jwt_extended import jwt_required as _jwt_required
from .exceptions import LoginDisabled
def jwt_required(*args, **kwargs):
    def wrapper(fn):
        @wraps(fn)
        def inner(*inner_args, **inner_kwargs):
            if not current_app.config["ENABLE_LOGIN"]:
                raise LoginDisabled()
            return _jwt_required(*args, **kwargs)(fn)(*inner_args, **inner_kwargs)
        return inner
    return wrapper