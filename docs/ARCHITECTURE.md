# Architecture

## Overview

Quantum Adapter Lab is a full-stack educational application with a FastAPI backend and React/TypeScript frontend. The backend performs all mathematical computations using NumPy; the frontend renders live results as interactive charts and visualisations.

```
Browser (React) ──── HTTP/JSON ──── FastAPI (Python)
                                          │
                       ┌──────────────────┼──────────────────┐
                   quantum.py        adapters.py         benchmark.py
                   (Cayley sim)      (param counts)      (scaling data)
                       └──────────────────┴──────────────────┘
                                     examples.py
                                     (cached presets)
```

---

## Backend Module Responsibilities

| Module | Responsibility |
|---|---|
| `main.py` | FastAPI app, CORS, lifespan handler, all route definitions |
| `schemas.py` | Pydantic v2 request models with field constraints |
| `quantum.py` | Cayley unitary simulation (NumPy only, no Qiskit) |
| `adapters.py` | Parameter count formulas, perplexity recovery simulation |
| `benchmark.py` | Scaling tables across hidden dimensions, `validate_hidden_dims` |
| `examples.py` | Pre-built model presets cached as module-level constant `_EXAMPLES` |

---

## API Data Flow — `/api/analyze`

```
POST /api/analyze
        │
        ▼
AnalyzeRequest validated by Pydantic v2
        │
        ▼
analyze_adapters(model_size, hidden_dim, num_layers, lora_rank, qubit_count, compression_ratio)
        │
        ├── count_full_ft_params(hidden_dim, num_layers)
        │       = num_layers × 16 × hidden_dim²
        │
        ├── count_lora_params(hidden_dim, num_layers, lora_rank)
        │       = num_layers × 4 × 2 × rank × hidden_dim
        │
        ├── count_quantum_params(hidden_dim, num_layers)
        │       blocks_per_layer = hidden_dim // 4
        │       total = num_layers × blocks_per_layer × 6
        │
        └── simulate_perplexity_recovery(compression_ratio)
                degraded = base_ppl × (1 + (1 - ratio) × 0.4)
                quantum recovery = 83%  (from arXiv:2605.05914)
```

## API Data Flow — `/api/circuit`

```
POST /api/circuit
        │
        ▼
CircuitRequest validated (qubit_count 2–4, input_vector 2–16 items)
        │
        ▼
simulate_circuit(input_vector, n_qubits=2)
        │
        ├── make_skew_symmetric(params, n=4) → K  [K = -Kᵀ, 6 free params]
        ├── cayley_transform(K) → Q  [Q = (I − 0.5K)(I + 0.5K)⁻¹]
        ├── x_norm = input / ||input||            [amplitude encoding]
        ├── output = Q @ x_norm
        └── gate_sequence (12 SX + 9 RZ + 3 CZ pattern, depth 19)
```

---

## Frontend Component Tree

```
App.tsx
├── Header.tsx              Title, disclaimer banner, GitHub link
├── AdapterStory.tsx        4-step animated journey (Full FT → LoRA → Quantum → Result)
│
├── [Controls]              Model preset buttons, LoRA rank picker, qubit selector
│
├── AdapterComparison.tsx   Three cards (Full FT / LoRA / Quantum) + wow-moment stat
│
├── QuantumCircuitViz.tsx   Canvas circuit diagram + gate summary + unitary stats
├── PerplexityPanel.tsx     Paper numbers + interactive recovery simulation chart
│
├── NoisePhaseChart.tsx     2q/3q/4q degradation with phase-transition annotations
├── QuestionShowcase.tsx    Real MMLU Q&A cards from Table 1 of the paper
│
├── ParameterEfficiencyChart.tsx  Log-scale bar chart + compression table
└── BenchmarkPanel.tsx      Quantum advantage trend line vs hidden dim
```

### Component Details

| Component | Canvas? | API call | Key display |
|---|---|---|---|
| `AdapterComparison` | No | `/api/analyze` | Param counts, compression ratios |
| `QuantumCircuitViz` | **Yes** | `/api/circuit` | Gate diagram, unitary verification |
| `PerplexityPanel` | No | `/api/analyze` | Paper PPL numbers + recovery chart |
| `NoisePhaseChart` | No | Static data | 0.08% / 2.80% / 12.50% phase transition |
| `QuestionShowcase` | No | Static data | MMLU astronomy + biology questions |
| `ParameterEfficiencyChart` | No | `/api/benchmark` | Log-scale bar chart + table |
| `BenchmarkPanel` | No | `/api/benchmark` | Quantum advantage vs model size |

---

## Request Schema Constraints

### `AnalyzeRequest`
| Field | Type | Constraints | Default |
|---|---|---|---|
| `model_size` | str | `^(smollm2_135m\|llama_8b\|custom)$` | `"llama_8b"` |
| `hidden_dim` | int | 64 ≤ x ≤ 16,384 | 4096 |
| `num_layers` | int | 1 ≤ x ≤ 128 | 32 |
| `lora_rank` | int | 1 ≤ x ≤ 256 | 8 |
| `qubit_count` | int | 2 ≤ x ≤ 4 | 2 |
| `compression_ratio` | float | 0.0 ≤ x ≤ 1.0 | 0.5 |

### `CircuitRequest`
| Field | Type | Constraints |
|---|---|---|
| `qubit_count` | int | 2 ≤ x ≤ 4 |
| `input_vector` | list[float] | 2–16 items |

### `BenchmarkRequest`
| Field | Type | Constraints | Default |
|---|---|---|---|
| `hidden_dims` | list[int] | max 8 items | [256, 512, 1024, 2048, 4096] |
| `lora_ranks` | list[int] | max 6 items | [4, 8, 16, 32, 64] |

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Backend language | Python | 3.12 |
| Backend framework | FastAPI | ≥0.115 |
| Data validation | Pydantic | v2 |
| Quantum simulation | NumPy | ≥1.26 |
| Frontend framework | React | 19 |
| Frontend language | TypeScript | 5.4 (strict) |
| Build tool | Vite | 6 |
| Styling | Tailwind CSS | 3 |
| Charts | Recharts | 2.12 |
| Animation | Framer Motion | 11 |
| CI/CD | GitHub Actions | — |
| Container | Docker + nginx | — |
