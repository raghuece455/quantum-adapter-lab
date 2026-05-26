"""API endpoint tests (app/main.py)."""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_returns_ok():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_examples_returns_three():
    r = client.get("/api/examples")
    assert r.status_code == 200
    data = r.json()
    assert "examples" in data
    assert len(data["examples"]) == 3


def test_analyze_llama_8b_returns_all_keys():
    r = client.post("/api/analyze", json={"model_size": "llama_8b"})
    assert r.status_code == 200
    body = r.json()
    assert "model_info" in body
    assert "adapters" in body
    assert "perplexity" in body
    assert "noise" in body


def test_analyze_adapters_ordering():
    r = client.post("/api/analyze", json={"model_size": "llama_8b", "lora_rank": 8})
    assert r.status_code == 200
    a = r.json()["adapters"]
    assert a["full_ft"]["params"] > a["lora"]["params"] > a["quantum"]["params"]


def test_analyze_rejects_hidden_dim_too_large():
    r = client.post("/api/analyze", json={"model_size": "custom", "hidden_dim": 99999})
    assert r.status_code == 422


def test_analyze_rejects_invalid_model_size():
    r = client.post("/api/analyze", json={"model_size": "gpt4"})
    assert r.status_code == 422


def test_circuit_returns_is_unitary():
    r = client.post("/api/circuit", json={"qubit_count": 2, "input_vector": [1.0, 0.0, 0.0, 0.0]})
    assert r.status_code == 200
    assert r.json()["is_unitary"] is True


def test_circuit_rejects_empty_vector():
    r = client.post("/api/circuit", json={"qubit_count": 2, "input_vector": []})
    assert r.status_code == 422


def test_benchmark_returns_rows():
    r = client.post("/api/benchmark", json={})
    assert r.status_code == 200
    assert "rows" in r.json()
    assert len(r.json()["rows"]) > 0


def test_benchmark_rejects_too_many_dims():
    r = client.post("/api/benchmark", json={"hidden_dims": list(range(100, 2000, 100))})
    assert r.status_code == 422
