"""Tests for quantum circuit simulation (app/quantum.py)."""

import numpy as np
import pytest

from app.quantum import make_skew_symmetric, cayley_transform, simulate_circuit, noise_impact


# ---------------------------------------------------------------------------
# make_skew_symmetric
# ---------------------------------------------------------------------------

def test_skew_symmetric_is_antisymmetric():
    params = np.array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0])
    K = make_skew_symmetric(params, 4)
    assert np.allclose(K, -K.T), "K must satisfy K = -Kᵀ"


def test_skew_symmetric_zero_diagonal():
    params = np.zeros(6)
    K = make_skew_symmetric(params, 4)
    assert np.allclose(np.diag(K), 0), "Diagonal of skew-symmetric matrix must be zero"


def test_skew_symmetric_param_count_4x4():
    """4×4 skew-symmetric matrix needs exactly 6 upper-triangle params."""
    params = np.arange(6, dtype=float)
    K = make_skew_symmetric(params, 4)
    assert K.shape == (4, 4)


# ---------------------------------------------------------------------------
# cayley_transform
# ---------------------------------------------------------------------------

def test_cayley_output_is_unitary():
    rng = np.random.default_rng(0)
    params = rng.standard_normal(6) * 0.3
    K = make_skew_symmetric(params, 4)
    Q = cayley_transform(K)
    residual = Q.T @ Q - np.eye(4)
    assert np.max(np.abs(residual)) < 1e-8, "Cayley output must satisfy QᵀQ ≈ I"


def test_cayley_zero_params_gives_identity():
    K = make_skew_symmetric(np.zeros(6), 4)
    Q = cayley_transform(K)
    assert np.allclose(Q, np.eye(4), atol=1e-10)


# ---------------------------------------------------------------------------
# simulate_circuit
# ---------------------------------------------------------------------------

def test_simulate_circuit_output_unit_norm():
    result = simulate_circuit([1.0, 0.0, 0.0, 0.0])
    output = np.array(result["output_vector"])
    assert abs(np.dot(output, output) - 1.0) < 1e-6, "Output must have unit norm"


def test_simulate_circuit_is_unitary_flag():
    result = simulate_circuit([1.0, 2.0, -1.0, 0.5])
    assert result["is_unitary"] is True


def test_simulate_circuit_fidelity_near_one():
    result = simulate_circuit([0.5, 0.5, 0.5, 0.5])
    assert 0.99 <= result["fidelity"] <= 1.01


def test_simulate_circuit_has_gate_sequence():
    result = simulate_circuit([1.0, 0.0, 0.0, 0.0])
    assert len(result["gate_sequence"]) > 0


def test_simulate_circuit_gate_types():
    result = simulate_circuit([1.0, 0.0, 0.0, 0.0])
    gate_names = {g["gate"] for g in result["gate_sequence"]}
    assert "SX" in gate_names
    assert "RZ" in gate_names
    assert "CZ" in gate_names


def test_simulate_circuit_different_params_different_output():
    r1 = simulate_circuit([1.0, 0.5, 0.3, 0.2], params=[0.1, 0.2, 0.3, 0.4, 0.5, 0.6])
    r2 = simulate_circuit([1.0, 0.5, 0.3, 0.2], params=[0.9, 0.8, 0.7, 0.6, 0.5, 0.4])
    assert not np.allclose(r1["output_vector"], r2["output_vector"]), \
        "Different params should yield different outputs"


def test_simulate_circuit_state_dim_matches_qubits():
    result = simulate_circuit([1.0, 0.0, 0.0, 0.0], n_qubits=2)
    assert result["state_dim"] == 4
    assert result["n_qubits"] == 2


# ---------------------------------------------------------------------------
# noise_impact
# ---------------------------------------------------------------------------

def test_noise_impact_2q_benign():
    result = noise_impact(2)
    assert result["ppl_degradation_pct"] == 0.08
    assert result["feasible"] is True


def test_noise_impact_3q_worse_than_2q():
    r2 = noise_impact(2)
    r3 = noise_impact(3)
    assert r3["ppl_degradation_pct"] > r2["ppl_degradation_pct"]


def test_noise_impact_4q_worse_than_3q():
    r3 = noise_impact(3)
    r4 = noise_impact(4)
    assert r4["ppl_degradation_pct"] > r3["ppl_degradation_pct"]


def test_noise_impact_synthesis_frontier_is_2():
    for q in [2, 3, 4]:
        assert noise_impact(q)["synthesis_frontier"] == 2


def test_noise_impact_ibm_error_rate():
    result = noise_impact(2)
    assert abs(result["ibm_error_rate"] - 0.119) < 1e-6
