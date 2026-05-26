# Demo Report

## What Was Built

Quantum Adapter Lab is a full-stack educational demo comparing Full Fine-Tuning, Classical LoRA,
and Quantum Cayley Adapters for LLMs — based on arXiv:2605.05914 (Multiverse Computing / University of Navarra, May 2026).

The frontend includes:
- Animated 4-step adapter story (Full FT → LoRA → Quantum → Result)
- Live three-way adapter comparison with real parameter counts
- Canvas-based quantum circuit visualiser with gate animation (SX/RZ/CZ)
- Perplexity panel: paper results + interactive recovery simulation
- Noise-expressivity phase transition chart (2-qubit = feasible, 3+ = not)
- Question showcase: real MMLU questions from the paper
- Log-scale parameter efficiency chart spanning 7 orders of magnitude
- Benchmark trend showing quantum advantage growing with model size

## Real Paper Numbers Used

All values taken directly from arXiv:2605.05914:

| Number | Value | Source |
|---|---|---|
| Llama 3.1 8B baseline PPL | 8.877 | Table 2 |
| After quantum adapter PPL | 8.752 | Table 2 |
| Improvement | 1.43% | Table 2 |
| Quantum params (paper config) | 6,144 | Section 4.1 |
| Compression vs unconstrained LoRA | 2,730× | Section 4.1 |
| SmolLM2 quality recovery | 83% | Section 4.2 |
| IBM hardware | 156-qubit IBM Quantum System Two | Section 3 |
| 2-qubit PPL degradation | 0.08% | Figure / noise analysis |
| 3-qubit PPL degradation | 2.80% | Figure / noise analysis |
| 4-qubit PPL degradation | 12.50% | Figure / noise analysis |
| IBM error rate | 11.9% depolarizing | Section 3 |
| Gate decomposition | 12 SX + 9 RZ + 3 CZ = depth 19 | Section 3 |

## How the Backend Computes Values

### Parameter Counts (exact formulas)
- **Full FT**: `num_layers × (4×d² + 12×d²)` = `num_layers × 16 × d²`
- **LoRA rank r**: `num_layers × 4 × 2 × r × d`
- **Quantum**: `num_layers × (d/4) blocks × 6 params/block`

### Cayley Unitary Simulation (quantum.py)
1. Build skew-symmetric K from 6 upper-triangle parameters
2. Apply Q = (I − 0.5K)(I + 0.5K)⁻¹ using NumPy
3. Verify QᵀQ ≈ I (tolerance 1e-8)
4. Apply Q to amplitude-encoded input vector
5. Return gate sequence (12 SX + 9 RZ + 3 CZ pattern from real IBM transpilation)

No Qiskit, no PennyLane — pure NumPy matrix math.

### Perplexity Recovery Simulation
Deterministic formula for interactive slider:
- degraded_ppl = base_ppl × (1 + (1 − compression_ratio) × 0.4)
- Quantum recovery: 83% of gap (paper result)
- LoRA r8/r32/r64: 62%/78%/85% (calibrated to typical benchmarks)

## How to Run

Backend:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Docker:
```bash
docker-compose up --build
```

## Tests Run

Backend:
```bash
pytest
```

Result during validation: **51 tests passed.**

Frontend:
```bash
npm run build
```

Result during validation: TypeScript and production Vite build passed.

## Known Limitations

- This is not a real quantum computer. Circuits are simulated with NumPy.
- 2-qubit simulation only (4×4 matrix). The paper ran 1,024 blocks in parallel on 156 qubits.
- Perplexity recovery is a deterministic simulation, not a measured experiment.
- The paper's 6,144-param config uses only 1 layer v_proj; the demo shows all-layer configs too for comparison.
- Quantum advantage claims are valid for the specific IBM Heron r2 hardware; other quantum processors will have different noise profiles.

## Suggested Future Improvements

- Add optional PennyLane backend for real quantum circuit simulation.
- Add measured CPU timing comparison for classical vs quantum block execution.
- Add exportable screenshots for presentations.
- Add keyboard navigation and screen-reader support for charts.
- Add more preset models (Mistral 7B, Gemma 2B).
- Add a guided tour overlay for first-time users.
