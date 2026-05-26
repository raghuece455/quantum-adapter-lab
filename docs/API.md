# API Reference

Base URL: `http://localhost:8000`

---

## GET /api/health

Health check.

**Response:**
```json
{ "status": "ok", "version": "1.0.0" }
```

---

## GET /api/examples

Returns three pre-built model presets.

**Response:**
```json
{
  "examples": [
    {
      "label": "Llama 3.1 8B (paper config)",
      "model_size": "llama_8b",
      "hidden_dim": 4096,
      "num_layers": 32,
      "lora_rank": 8,
      "qubit_count": 2,
      "compression_ratio": 0.6,
      "description": "..."
    }
  ]
}
```

---

## POST /api/analyze

Compare all three adapter types for a given model configuration.

**Request body:**
```json
{
  "model_size": "llama_8b",
  "hidden_dim": 4096,
  "num_layers": 32,
  "lora_rank": 8,
  "qubit_count": 2,
  "compression_ratio": 0.5
}
```

| Field | Type | Constraints | Default |
|---|---|---|---|
| `model_size` | string | `smollm2_135m`, `llama_8b`, or `custom` | `"llama_8b"` |
| `hidden_dim` | integer | 64–16,384 | 4096 |
| `num_layers` | integer | 1–128 | 32 |
| `lora_rank` | integer | 1–256 | 8 |
| `qubit_count` | integer | 2–4 | 2 |
| `compression_ratio` | float | 0.0–1.0 | 0.5 |

**Response:**
```json
{
  "model_info": {
    "name": "Llama 3.1 8B",
    "total_base_params": 8000000000,
    "hidden_dim": 4096,
    "num_layers": 32
  },
  "adapters": {
    "full_ft": {
      "params": 2147483648,
      "memory_mb_fp16": 4096.0,
      "description": "..."
    },
    "lora": {
      "params": 4194304,
      "rank": 8,
      "memory_mb_fp16": 8.0,
      "compression_vs_full": 512.0,
      "description": "..."
    },
    "quantum": {
      "params": 1572864,
      "blocks": 262144,
      "blocks_per_layer": 1024,
      "qubits_per_block": 2,
      "memory_mb_fp16": 3.0,
      "compression_vs_full": 1365.0,
      "compression_vs_lora": 2.7,
      "paper_params": 6144,
      "paper_compression_vs_lora": 2730,
      "description": "..."
    }
  },
  "perplexity": {
    "paper": {
      "baseline": 8.877,
      "after_quantum": 8.752,
      "improvement_pct": 1.43,
      "hardware": "156-qubit IBM Quantum System Two",
      "model": "Llama 3.1 8B"
    },
    "recovery_simulation": {
      "baseline_ppl": 8.877,
      "degraded_ppl": 9.054,
      "lora_r8": 8.944,
      "lora_r32": 8.915,
      "lora_r64": 8.904,
      "quantum": 8.907,
      "quantum_recovery_pct": 83,
      "lora_r8_recovery_pct": 62,
      "lora_r32_recovery_pct": 78,
      "lora_r64_recovery_pct": 85
    }
  },
  "noise": {
    "2q_degradation_pct": 0.08,
    "3q_degradation_pct": 2.80,
    "4q_degradation_pct": 12.50,
    "ibm_error_rate": 0.119,
    "synthesis_frontier": 2
  }
}
```

**Example curl:**
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"model_size": "llama_8b", "lora_rank": 8}'
```

**422 trigger table:**

| Trigger | Field | Rule |
|---|---|---|
| Unknown model | `model_size` | Not one of `smollm2_135m`, `llama_8b`, `custom` |
| Hidden dim too large | `hidden_dim` | > 16,384 |
| Hidden dim too small | `hidden_dim` | < 64 |
| Too many layers | `num_layers` | > 128 |
| Rank out of range | `lora_rank` | < 1 or > 256 |
| Qubit count invalid | `qubit_count` | < 2 or > 4 |
| Compression out of range | `compression_ratio` | < 0.0 or > 1.0 |

---

## POST /api/circuit

Simulate a Cayley unitary quantum circuit block.

**Request body:**
```json
{
  "qubit_count": 2,
  "input_vector": [1.0, 0.5, 0.3, 0.2]
}
```

| Field | Type | Constraints |
|---|---|---|
| `qubit_count` | integer | 2–4 |
| `input_vector` | array of float | 2–16 items |

**Response:**
```json
{
  "input_normalized": [0.877, 0.438, 0.263, 0.175],
  "unitary_matrix": [[...], [...], [...], [...]],
  "output_vector": [0.612, -0.391, 0.502, 0.481],
  "is_unitary": true,
  "fidelity": 1.0,
  "n_qubits": 2,
  "state_dim": 4,
  "num_params": 6,
  "gate_sequence": [
    {"gate": "SX", "qubit": 0, "step": 0},
    {"gate": "RZ", "qubit": 0, "step": 2, "angle": -0.231},
    {"gate": "CZ", "qubit": [0, 1], "step": 4}
  ],
  "gate_summary": {"SX": 12, "RZ": 9, "CZ": 3, "total": 24}
}
```

**Example curl:**
```bash
curl -X POST http://localhost:8000/api/circuit \
  -H "Content-Type: application/json" \
  -d '{"qubit_count": 2, "input_vector": [1.0, 0.0, 0.0, 0.0]}'
```

**422 trigger table:**

| Trigger | Rule |
|---|---|
| Empty vector | `input_vector` has 0 items |
| Vector too long | `input_vector` has > 16 items |
| Qubit count < 2 | `qubit_count` = 1 |
| Qubit count > 4 | `qubit_count` = 5 |

---

## POST /api/benchmark

Parameter efficiency table across model sizes.

**Request body (all optional):**
```json
{
  "hidden_dims": [256, 512, 1024, 2048, 4096],
  "lora_ranks": [4, 8, 16, 32, 64]
}
```

| Field | Type | Constraints | Default |
|---|---|---|---|
| `hidden_dims` | list[int] | max 8 items | [256, 512, 1024, 2048, 4096] |
| `lora_ranks` | list[int] | max 6 items | [4, 8, 16, 32, 64] |

**Response:**
```json
{
  "rows": [
    {
      "hidden_dim": 256,
      "full_ft": 33554432,
      "quantum": 98304,
      "quantum_memory_mb": 0.188,
      "quantum_vs_lora_ratio": 3.4,
      "lora_r4": 524288,
      "lora_r8": 1048576
    }
  ]
}
```

**Example curl:**
```bash
curl -X POST http://localhost:8000/api/benchmark \
  -H "Content-Type: application/json" \
  -d '{}'
```

**422 trigger table:**

| Trigger | Rule |
|---|---|
| Too many dims | `hidden_dims` has > 8 items |
| Too many ranks | `lora_ranks` has > 6 items |
