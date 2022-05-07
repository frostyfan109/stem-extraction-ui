import os
import yaml
from .demucs import Demucs
from .spleeter import Spleeter

with open(os.path.join(os.path.dirname(__file__), "../separator-config.yaml"), "r") as f:
    separator_config = yaml.safe_load(f)

separators = [
    Demucs(separator_config),
    Spleeter(separator_config)
]