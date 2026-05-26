from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    model_size: str = Field("llama_8b", pattern="^(smollm2_135m|llama_8b|custom)$")
    hidden_dim: int = Field(4096, ge=64, le=16384)
    num_layers: int = Field(32, ge=1, le=128)
    lora_rank: int = Field(8, ge=1, le=256)
    qubit_count: int = Field(2, ge=2, le=4)
    compression_ratio: float = Field(0.5, ge=0.0, le=1.0)


class CircuitRequest(BaseModel):
    qubit_count: int = Field(2, ge=2, le=4)
    input_vector: list[float] = Field(..., min_length=2, max_length=16)


class BenchmarkRequest(BaseModel):
    hidden_dims: list[int] = Field(
        default_factory=lambda: [256, 512, 1024, 2048, 4096],
        max_length=8,
    )
    lora_ranks: list[int] = Field(
        default_factory=lambda: [4, 8, 16, 32, 64],
        max_length=6,
    )
