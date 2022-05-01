from dataclasses import dataclass, asdict
import os
from typing import List
import yaml
from abc import ABC, abstractmethod

@dataclass
class Spec:
    name: str
    score: float
    description: str = None
@dataclass
class SpeedSpec(Spec):
    def __init__(self, **kwargs):
        super().__init__(name="Speed", **kwargs)
@dataclass
class QualitySpec(Spec):
    def __init__(self, **kwargs):
        super().__init__(name="Quality", **kwargs)

@dataclass
class SpecConfig:
    speed: SpeedSpec
    quality: QualitySpec

@dataclass
class Feature:
    name: str
    description: str = None
@dataclass
class MultitracksFeature(Feature):
    def __init__(self, description="Supports extracting multitracks in addition to 2-track stems", **kwargs):
        super().__init__(name="Multitracks", description=description, **kwargs)
@dataclass
class MultipleModels(Feature):
    def __init__(self, description="Supports multiple pretrained separation models", **kwargs):
        super().__init__(name="Multiple models", description=description, **kwargs)

@dataclass
class SeparatorConfig:
    key: str
    name: str
    url: str
    description: str
    specs: SpecConfig
    features: List[Feature]

    schema_path: str
    exe: str

    logo_url: str = None


class Separator(ABC, SeparatorConfig):
    def __init__(self, separator_config):
        self.config = separator_config["separators"][self.key]
        self._separator_config = separator_config
    def serialize(self):
        return {
            **asdict(self),
            "enabled": self.config.get("enabled", True),
            "schema": self.schema
        }
    def _load_schema(self):
        with open(os.path.join(os.path.dirname(__file__), self.schema_path), "r") as f:
            return yaml.safe_load(f)

    def create_cli_args(self, args):
        # args = {
        #     "track": "",
        #     "name": "mdx",
        #     "device": "cuda",
        #     "shifts": 10,
        #     "overlap": .25,
        #     "jobs": 1,
        #     "two_stems": True,
        #     "mp3": True,
        #     "mp3_bitrate": 192
        # }
        args = {
            "name": "mdx",
            "output_format": "Output as mp3 (256kbps)"
        }
        cli_pos_args = []
        cli_opt_args = {}
        for arg_name in self.schema["properties"]:
            schema = self.schema["properties"][arg_name]
            hook = schema.get("hook", [])
            do_delete = False
            for hook_obj in hook:
                value = hook_obj["value"]
                mapping = hook_obj["mapping"]
                delete_self = hook_obj.get("delete_self", False)
                if value == args[arg_name]:
                    if delete_self: do_delete = True
                    for arg in mapping:
                        args[arg] = mapping[arg]
            if do_delete:
                del args[arg_name]
        print(args)

        for arg_name in args:
            schema = self.schema["properties"][arg_name]
            
            # if not arg_name in args:
            #     args[arg_name] = schema["default"]
            arg_value = args[arg_name]

            if schema["type"] == "boolean":
                arg_value = "true" if arg_value else "false"
            else:
                arg_value = str(arg_value)
            if schema.get("positional") == True:
                cli_pos_args.append(arg_value)
            else:
                cli_opt_args[schema["arg"]] = arg_value
            
        print(cli_pos_args)
        print(cli_opt_args)

        args = [self.target, *cli_pos_args] + [arg + "=" + cli_opt_args[arg] for arg in cli_opt_args]

        print(args)

    @property
    def schema(self):
        schema = self._load_schema()
        for arg_name in schema["properties"]:
            arg = schema["properties"][arg_name]
            if arg_name in self.config["disabled_args"]:
                arg["disabled"] = True
        return schema

    @property
    def target(self):
        if self.config.get("exe"):
            return self.config["exe"]
        else: return self.exe