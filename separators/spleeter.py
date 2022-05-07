from .separator import MultitracksFeature, QualitySpec, Separator, SpecConfig, SpeedSpec

class Spleeter(Separator):
    key = "spleeter"
    name = "Spleeter"
    url = "https://github.com/deezer/spleeter"
    schema_path = "spleeter-schema.yaml"
    exe = "spleeter"
    description = """\
Highly efficient source separation algorithm developed by Deezer in 2019."""
    logo_url = "/spleeter_logo.png"
    specs = SpecConfig(
      speed=SpeedSpec(score=4, description="Usually between 2-4 minutes"),
      quality=QualitySpec(score=2.5)
    )
    features = [
      MultitracksFeature()
    ]
    examples = []

    def create_cli_args(self, pos_args, args):
      pos_args = ["separate", *pos_args]
      return super().create_cli_args(pos_args, args)