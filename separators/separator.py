import asyncio
import json
import os
import jsonschema
import yaml
import tempfile
from dataclasses import dataclass, asdict
from abc import ABC, abstractmethod
from typing import List
from subprocess import Popen, PIPE

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
class Stem:
    name: str
    path: str
    original: str = None
    source: bool = False

@dataclass
class ExampleStems:
    name: str
    stems: List[Stem]

@dataclass
class SeparatorConfig:
    key: str
    name: str
    url: str
    description: str
    specs: SpecConfig
    features: List[Feature]
    examples: List[ExampleStems]

    schema_path: str
    exe: str

    logo_url: str = None


@dataclass
class SeparatedFile:
    file_bytes: bytes


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

    # def separate(self, file_path, args) -> List[SeparatedFile]:
    #     popen = Popen(self.create_cli_args([file_path], args), stdout=PIPE)
    #     return popen

    def create_cli_args(self, pos_args, args):
        cli_opt_args = {}

        try:
            jsonschema.validate(instance=args, schema=self.schema)
        except jsonschema.ValidationError as e:
            raise e

        # Remove any arguments that aren't in the schema
        args = {
            arg: arg_value for arg, arg_value in args.items()
            if arg in self.schema["properties"]
        }
        # Set omitted arguments to their default values
        for arg in self.schema["properties"]:
            default_value = self.schema["properties"][arg].get("default")
            if arg not in args and default_value is not None:
                args[arg] = default_value
        # Apply hook transformations of arguments
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

        # Convert argument values into strings
        for arg_name in args:
            schema = self.schema["properties"][arg_name]

            arg_value = args[arg_name]

            if schema["type"] == "boolean":
                arg_value = "true" if arg_value else "false"
            elif schema["type"] == "string":
                pass
            else:
                arg_value = json.dumps(arg_value)
            cli_opt_args[schema["arg"]] = arg_value

        args = [self.target, *pos_args] + [arg + "=" + cli_opt_args[arg] for arg in cli_opt_args]
        return args
        # print(args)

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