from .separator import ExampleStems, MultipleModels, MultitracksFeature, QualitySpec, Separator, Spec, SpecConfig, SpeedSpec, Stem

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
    examples = [
      ExampleStems(
        name="juice dy2 mix01.mp3",
        stems=[
          Stem(
            name="Source",
            path="/demucs-examples/juice dy2 mix01/og_full.mp3",
            source=True
          ),
          Stem(
            name="Vocals",
            path="/demucs-examples/juice dy2 mix01/vocals.wav",
            original="/demucs-examples/juice dy2 mix01/og_vocals.wav"
          ),
          Stem(
            name="Bass",
            path="/demucs-examples/juice dy2 mix01/bass.wav",
          ),
          Stem(
            name="Drums",
            path="/demucs-examples/juice dy2 mix01/drums.wav",
          ),
          Stem(
            name="Other",
            path="/demucs-examples/juice dy2 mix01/other.wav",
          )
        ]
      )
    ]