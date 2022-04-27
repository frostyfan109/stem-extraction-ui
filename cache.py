from flask_caching import Cache
# Flask-Caching does not support blueprints, there's no workaround and no good alternative extension.
cache = Cache()