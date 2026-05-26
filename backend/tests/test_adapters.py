"""Tests for adapter parameter counts and perplexity simulation (app/adapters.py)."""

import pytest

from app.adapters import (
    count_full_ft_params,
    count_lora_params,
    count_quantum_params,
    memory_mb_fp16,
    memory_mb_fp32,
    simulate_perplexity_recovery,
    analyze_adapters,
    PAPER_NUMBERS,
)


# ---------------------------------------------------------------------------
# Parameter counts
# ---------------------------------------------------------------------------

def test_full_ft_greater_than_lora():
    full = count_full_ft_params(4096, 32)
    lora = count_lora_params(4096, 32, 8)
    assert full > lora


def test_lora_greater_than_quantum():
    lora = count_lora_params(4096, 32, 8)
    q = count_quantum_params(4096, 32)["total_params"]
    assert lora > q


def test_full_ft_greater_than_quantum():
    full = count_full_ft_params(4096, 32)
    q = count_quantum_params(4096, 32)["total_params"]
    assert full > q


def test_lora_scales_linearly_with_rank():
    low = count_lora_params(512, 4, 8)
    high = count_lora_params(512, 4, 16)
    assert high == 2 * low


def test_quantum_paper_params_constant():
    """Paper reports 6,144 params for 1-layer v_proj Llama config."""
    assert PAPER_NUMBERS["quantum_params_paper"] == 6_144


def test_quantum_paper_compression_vs_lora():
    assert PAPER_NUMBERS["compression_vs_lora"] == 2_730


def test_memory_fp32_is_double_fp16():
    params = 1_000_000
    assert abs(memory_mb_fp32(params) - 2 * memory_mb_fp16(params)) < 0.001


# ---------------------------------------------------------------------------
# Perplexity recovery simulation
# ---------------------------------------------------------------------------

def test_degraded_ppl_greater_than_baseline():
    r = simulate_perplexity_recovery(0.5)
    assert r["degraded_ppl"] > r["baseline_ppl"]


def test_quantum_recovery_pct_is_83():
    r = simulate_perplexity_recovery(0.5)
    assert r["quantum_recovery_pct"] == 83


def test_quantum_ppl_below_degraded():
    r = simulate_perplexity_recovery(0.5)
    assert r["quantum"] < r["degraded_ppl"]


def test_lora_r64_recovers_more_than_r8():
    r = simulate_perplexity_recovery(0.5)
    # Lower PPL = better quality
    assert r["lora_r64"] < r["lora_r8"]


def test_no_compression_means_no_degradation():
    r = simulate_perplexity_recovery(1.0)  # compression_ratio=1.0 means no degradation
    assert abs(r["degraded_ppl"] - r["baseline_ppl"]) < 0.001


# ---------------------------------------------------------------------------
# analyze_adapters integration
# ---------------------------------------------------------------------------

def test_analyze_returns_all_keys():
    result = analyze_adapters("llama_8b", 4096, 32, 8, 2, 0.5)
    assert "model_info" in result
    assert "adapters" in result
    assert "perplexity" in result
    assert "noise" in result


def test_analyze_adapter_ordering():
    result = analyze_adapters("llama_8b", 4096, 32, 8, 2, 0.5)
    a = result["adapters"]
    assert a["full_ft"]["params"] > a["lora"]["params"] > a["quantum"]["params"]


def test_analyze_paper_numbers_unchanged():
    result = analyze_adapters("llama_8b", 4096, 32, 8, 2, 0.5)
    p = result["perplexity"]["paper"]
    assert p["baseline"] == 8.877
    assert p["after_quantum"] == 8.752
    assert abs(p["improvement_pct"] - 1.43) < 0.01
