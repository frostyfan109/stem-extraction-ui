import yaml
import os

separator_config_path = os.path.join(os.path.dirname(__file__), "separator-config.yaml")

with open(separator_config_path, "r") as f:
    separator_config = yaml.safe_load(f)
    separators = separator_config["separators"]
    for separator_name in separators:
        separator = separators[separator_name]
        schema = []

config = {
    **separator_config
}