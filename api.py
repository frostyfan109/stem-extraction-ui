if __name__ == "__main__":
    import argparse
    import os
    from flask import Flask
    from cache import cache
    from apis.api_v1 import blueprint as api_v1
    parser = argparse.ArgumentParser(description="Specify API arguments")
    parser.add_argument("-r", "--reloader", help="Automatically restart API upon modification", action="store_true", default=True)
    args = parser.parse_args()

    port = os.environ["API_PORT"]

    app = Flask(__name__)
    cache.init_app(app)
    app.register_blueprint(api_v1)
    app.run(
        host="0.0.0.0",
        port=port,
        use_reloader=args.reloader,
        threaded=True
    )