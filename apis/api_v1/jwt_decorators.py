import config
from functools import wraps
from flask import current_app
from flask_jwt_extended import jwt_required as _jwt_required
from .exceptions import LoginDisabled
def jwt_required(optional=False, fresh=False, refresh=False, locations=None):
    def wrapper(fn):
        @wraps(fn)
        def inner(*inner_args, **inner_kwargs):
            if not config.ENABLE_LOGIN and not optional:
                # If the request has an optional jwt, the JWT middleware
                # will have removed any jwt authentication, so it will be
                # treated as an unauthenticated request to the route.
                raise LoginDisabled()
            return _jwt_required(optional, fresh, refresh, locations)(fn)(*inner_args, **inner_kwargs)
        return inner
    return wrapper