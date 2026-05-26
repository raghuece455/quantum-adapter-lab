"""
Adapter parameter counts and perplexity recovery simulation.

Real paper numbers (arXiv:2605.05914, Multiverse Computing / Univ. Navarra):
  - Llama 3.1 8B baseline PPL:  8.877
  - After quantum adapter PPL:   8.752  (1.43% improvement)
  - Quantum params (paper):      6,144  (1 layer, v_proj only, 1024 blocks × 6)
  - Compression vs LoRA:         2,730× fewer parameters
  - SmolLM2 recovery:            83% of compression-induced degradation recovered
"""

from __future__ import annotations

PRESET_MODELS: dict[str, dict] = {
    "smollm2_135m": {
        "hidden_dim": 576,
        "num_layers": 30,
        "name": "SmolLM2 135M",
        "base_params": 135_000_000,
    },
    "llama_8b": {
        "hidden_dim": 4096,
        "num_layers": 32,
        "name": "Llama 3.1 8B",
        "base_params": 8_000_000_000,
    },
    "custom": {
        "hidden_dim": None,
        "num_layers": None,
        "name": "Custom Model",
        "base_params": None,
    },
}

# Exact numbers from arXiv:2605.05914
PAPER_NUMBERS: dict[str, float | int] = {
    "baseline_ppl": 8.877,
    "quantum_ppl": 8.752,
    "improvement_pct": 1.43,
    "quantum_params_paper": 6_144,
    "compression_vs_lora": 2_730,
    "smollm2_recovery_pct": 83,
}


# ---------------------------------------------------------------------------
# Parameter count formulas
# ---------------------------------------------------------------------------

def count_full_ft_params(hidden_dim: int, num_layers: int) -> int:
    """
    Full fine-tuning: all projection layers.
    Attention: Q, K, V, O projections = 4 × hidden_dim²
    MLP: gate, up, down projections = 3 × hidden_dim × (4 × hidden_dim)
    """
    attention = 4 * hidden_dim ** 2
    mlp = 3 * hidden_dim * (4 * hidden_dim)
    return num_layers * (attention + mlp)


def count_lora_params(hidden_dim: int, num_layers: int, rank: int) -> int:
    """
    LoRA: two low-rank matrices (A: rank×d, B: d×rank) per projection.
    Applied to Q, K, V, O (4 projections per layer).
    """
    per_projection = 2 * rank * hidden_dim
    per_layer = 4 * per_projection
    return num_layers * per_layer


def count_quantum_params(hidden_dim: int, num_layers: int) -> dict:
    """
    Quantum Cayley adapter: 2-qubit blocks (4×4 unitary) inserted into
    frozen projection layers.
    Parameters per block = 4*(4-1)/2 = 6  (upper-triangle of 4×4 skew-symmetric)
    Blocks per layer    = hidden_dim // 4
    """
    block_dim = 4            # 2 qubits → 4×4 unitary
    cayley_params_per_block = 6
    blocks_per_layer = max(1, hidden_dim // block_dim)
    total_blocks = num_layers * blocks_per_layer
    total_params = total_blocks * cayley_params_per_block
    return {
        "total_params": total_params,
        "blocks_per_layer": blocks_per_layer,
        "total_blocks": total_blocks,
        "params_per_block": cayley_params_per_block,
        "paper_params": PAPER_NUMBERS["quantum_params_paper"],
    }


def memory_mb_fp16(param_count: int) -> float:
    return round(param_count * 2 / (1024 ** 2), 3)


def memory_mb_fp32(param_count: int) -> float:
    return round(param_count * 4 / (1024 ** 2), 3)


# ---------------------------------------------------------------------------
# Perplexity recovery simulation
# ---------------------------------------------------------------------------

def simulate_perplexity_recovery(
    compression_ratio: float,
    base_ppl: float = 8.877,
) -> dict:
    """
    Simulate perplexity recovery at a given compression level.

    compression_ratio: 0.0 = original quality preserved,  1.0 = maximum
    compression (most degraded).  The 83% quantum recovery figure is the
    exact SmolLM2 result from the paper.
    """
    degraded_ppl = base_ppl * (1.0 + (1.0 - compression_ratio) * 0.4)
    gap = degraded_ppl - base_ppl

    rates = {"lora_r8": 0.62, "lora_r32": 0.78, "lora_r64": 0.85, "quantum": 0.83}

    return {
        "baseline_ppl": base_ppl,
        "degraded_ppl": round(degraded_ppl, 3),
        "lora_r8": round(degraded_ppl - gap * rates["lora_r8"], 3),
        "lora_r32": round(degraded_ppl - gap * rates["lora_r32"], 3),
        "lora_r64": round(degraded_ppl - gap * rates["lora_r64"], 3),
        "quantum": round(degraded_ppl - gap * rates["quantum"], 3),
        "quantum_recovery_pct": 83,
        "lora_r8_recovery_pct": 62,
        "lora_r32_recovery_pct": 78,
        "lora_r64_recovery_pct": 85,
    }


# ---------------------------------------------------------------------------
# Main analysis
# ---------------------------------------------------------------------------

def analyze_adapters(
    model_size: str,
    hidden_dim: int,
    num_layers: int,
    lora_rank: int,
    qubit_count: int,
    compression_ratio: float,
) -> dict:
    preset = PRESET_MODELS.get(model_size, PRESET_MODELS["custom"])
    model_name = preset.get("name", "Custom Model")
    base_params = preset.get("base_params") or (hidden_dim * num_layers * 12)

    # Param counts
    full_ft = count_full_ft_params(hidden_dim, num_layers)
    lora = count_lora_params(hidden_dim, num_layers, lora_rank)
    q_info = count_quantum_params(hidden_dim, num_layers)
    quantum = q_info["total_params"]

    # Compression ratios
    compression_lora_vs_full = round(full_ft / max(lora, 1), 1)
    compression_quantum_vs_full = round(full_ft / max(quantum, 1), 1)
    compression_quantum_vs_lora = round(lora / max(quantum, 1), 1)

    recovery = simulate_perplexity_recovery(compression_ratio)

    return {
        "model_info": {
            "name": model_name,
            "total_base_params": base_params,
            "hidden_dim": hidden_dim,
            "num_layers": num_layers,
        },
        "adapters": {
            "full_ft": {
                "params": full_ft,
                "memory_mb_fp16": memory_mb_fp16(full_ft),
                "memory_mb_fp32": memory_mb_fp32(full_ft),
                "description": "Updates every weight in the model. Most powerful but most expensive.",
                "compression_vs_full": 1,
            },
            "lora": {
                "params": lora,
                "rank": lora_rank,
                "memory_mb_fp16": memory_mb_fp16(lora),
                "memory_mb_fp32": memory_mb_fp32(lora),
                "compression_vs_full": compression_lora_vs_full,
                "description": f"Inserts two small matrices (rank {lora_rank}) beside each frozen layer.",
            },
            "quantum": {
                "params": quantum,
                "blocks": q_info["total_blocks"],
                "blocks_per_layer": q_info["blocks_per_layer"],
                "qubits_per_block": qubit_count,
                "memory_mb_fp16": memory_mb_fp16(quantum),
                "memory_mb_fp32": memory_mb_fp32(quantum),
                "compression_vs_full": compression_quantum_vs_full,
                "compression_vs_lora": compression_quantum_vs_lora,
                "paper_params": int(PAPER_NUMBERS["quantum_params_paper"]),
                "paper_compression_vs_lora": int(PAPER_NUMBERS["compression_vs_lora"]),
                "description": "Inserts 2-qubit quantum circuit blocks beside frozen layers.",
            },
        },
        "perplexity": {
            "paper": {
                "baseline": PAPER_NUMBERS["baseline_ppl"],
                "after_quantum": PAPER_NUMBERS["quantum_ppl"],
                "improvement_pct": PAPER_NUMBERS["improvement_pct"],
                "hardware": "156-qubit IBM Quantum System Two",
                "model": "Llama 3.1 8B",
            },
            "recovery_simulation": recovery,
        },
        "noise": {
            "2q_degradation_pct": 0.08,
            "3q_degradation_pct": 2.80,
            "4q_degradation_pct": 12.50,
            "ibm_error_rate": 0.119,
            "synthesis_frontier": 2,
        },
    }
