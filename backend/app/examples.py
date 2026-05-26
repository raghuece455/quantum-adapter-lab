"""Pre-built examples — cached as module-level constant."""

from __future__ import annotations


def _build_examples() -> list[dict]:
    return [
        {
            "label": "Llama 3.1 8B (paper config)",
            "model_size": "llama_8b",
            "hidden_dim": 4096,
            "num_layers": 32,
            "lora_rank": 8,
            "qubit_count": 2,
            "compression_ratio": 0.6,
            "description": (
                "The exact model from the IBM paper. Watch the quantum adapter "
                "use 2,730× fewer parameters than LoRA while improving perplexity by 1.43%."
            ),
        },
        {
            "label": "SmolLM2 135M (paper config)",
            "model_size": "smollm2_135m",
            "hidden_dim": 576,
            "num_layers": 30,
            "lora_rank": 8,
            "qubit_count": 2,
            "compression_ratio": 0.5,
            "description": (
                "Smaller model used for systematic study. "
                "Quantum adapter recovers 83% of compression-induced quality loss."
            ),
        },
        {
            "label": "High-rank LoRA comparison",
            "model_size": "llama_8b",
            "hidden_dim": 4096,
            "num_layers": 32,
            "lora_rank": 64,
            "qubit_count": 2,
            "compression_ratio": 0.5,
            "description": (
                "See what happens when LoRA rank increases — "
                "and how the quantum adapter still wins on parameter count."
            ),
        },
    ]


_EXAMPLES: list[dict] = _build_examples()


def get_examples() -> list[dict]:
    return _EXAMPLES
