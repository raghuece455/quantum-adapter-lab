"""Parameter efficiency benchmarks across model sizes."""

from __future__ import annotations

from app.adapters import (
    count_full_ft_params,
    count_lora_params,
    count_quantum_params,
    memory_mb_fp16,
)


def validate_hidden_dims(dims: list[int]) -> list[int]:
    """Deduplicate, sort, cap each at 16,384, cap list at 8 items, drop ≤ 0."""
    MAX_SINGLE = 16_384
    clean = sorted({min(int(d), MAX_SINGLE) for d in dims if int(d) > 0})
    if not clean:
        return [256, 512, 1024, 2048, 4096]
    return clean[:8]


def parameter_efficiency_table(
    hidden_dims: list[int],
    lora_ranks: list[int],
    num_layers: int = 32,
) -> list[dict]:
    """
    For each hidden_dim, compute parameter counts for all three adapter types
    and return a list of rows suitable for Recharts.
    """
    rows = []
    for hdim in hidden_dims:
        full_ft = count_full_ft_params(hdim, num_layers)
        q_info = count_quantum_params(hdim, num_layers)
        quantum = q_info["total_params"]

        lora_cols: dict[str, int] = {}
        for rank in lora_ranks:
            lora_cols[f"lora_r{rank}"] = count_lora_params(hdim, num_layers, rank)

        # Compression ratio vs first rank for the trend chart
        first_rank = lora_ranks[0] if lora_ranks else 8
        first_lora = count_lora_params(hdim, num_layers, first_rank)
        quantum_vs_lora = round(first_lora / max(quantum, 1), 1)

        rows.append({
            "hidden_dim": hdim,
            "full_ft": full_ft,
            "quantum": quantum,
            "quantum_memory_mb": memory_mb_fp16(quantum),
            "quantum_vs_lora_ratio": quantum_vs_lora,
            **lora_cols,
        })
    return rows
