"""Tests for benchmark utilities (app/benchmark.py)."""

import pytest

from app.benchmark import validate_hidden_dims, parameter_efficiency_table


def test_validate_deduplicates_and_sorts():
    result = validate_hidden_dims([1024, 256, 1024, 512])
    assert result == [256, 512, 1024]


def test_validate_caps_list_at_8():
    big = list(range(100, 1700, 100))  # 16 items
    result = validate_hidden_dims(big)
    assert len(result) <= 8


def test_validate_drops_nonpositive():
    result = validate_hidden_dims([-1, 0, 256, 512])
    assert all(v > 0 for v in result)
    assert 256 in result


def test_validate_caps_single_at_16384():
    result = validate_hidden_dims([99999, 512])
    assert max(result) <= 16384


def test_validate_empty_returns_defaults():
    result = validate_hidden_dims([])
    assert result == [256, 512, 1024, 2048, 4096]


def test_validate_all_negative_returns_defaults():
    result = validate_hidden_dims([-5, -10])
    assert result == [256, 512, 1024, 2048, 4096]


def test_efficiency_table_length():
    dims = [256, 512, 1024]
    rows = parameter_efficiency_table(dims, [8])
    assert len(rows) == 3


def test_efficiency_table_ordering():
    rows = parameter_efficiency_table([4096], [8])
    row = rows[0]
    assert row["full_ft"] > row["lora_r8"] > row["quantum"]


def test_efficiency_table_quantum_vs_lora_positive():
    rows = parameter_efficiency_table([4096], [8])
    assert rows[0]["quantum_vs_lora_ratio"] > 1
