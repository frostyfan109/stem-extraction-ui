from .separator import MultipleModels, MultitracksFeature, QualitySpec, Separator, Spec, SpecConfig, SpeedSpec

class Demucs(Separator):
    key = "demucs"
    name = "Demucs"
    url = "https://github.com/facebookresearch/demucs"
    logo_url = "/meta_research.png"
    schema_path = "demucs-schema.yaml"
    exe = "demucs"
    description = """\
Highly accurate source separation algorithm developed by researchers at Facebook in 2019."""
    specs = SpecConfig(
      speed=SpeedSpec(score=2, description="May take upwards of 10 minutes"),
      quality=QualitySpec(score=4)
    )
    features = [
      MultitracksFeature(),
      MultipleModels()
    ]

import yaml
x = Demucs(yaml.safe_load("""---
separators:
  demucs:
    enabled: true
    exe: null # specify executable location if not in path
    disabled_args: ["jobs"]
  spleeter:
    enabled: true
    exe: null
    disabled_args: []"""))