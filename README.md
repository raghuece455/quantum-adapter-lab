# Quantum Adapter Lab

![Python](https://img.shields.io/badge/python-3.12-blue)
![Node](https://img.shields.io/badge/node-20-green)
![CI](https://github.com/raghuece455/quantum-adapter-lab/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue)

An interactive full-stack educational demo that visualises how **quantum circuit blocks** can fine-tune a large language model with **2,730× fewer parameters than LoRA** — based on the real 2026 IBM Research paper.

> **No quantum computer required.** All quantum circuits are simulated with NumPy on your laptop.

---

## What It Demonstrates

Three fine-tuning strategies, live computed and compared:

| Strategy | Parameters | How |
|---|---|---|
| Full Fine-Tuning | ~7 billion | Update every weight |
| Classical LoRA (rank 8) | ~4 million | Add low-rank A×B matrices |
| **Quantum Cayley Adapter** | **6,144** | Add 2-qubit quantum circuit blocks |

Based on: **[arXiv:2605.05914](https://arxiv.org/abs/2605.05914)** — *Quantum-enhanced Large Language Models on Quantum Hardware via Cayley Unitary Adapters* — Aizpurua et al., Multiverse Computing & University of Navarra, May 2026.

Real paper results used throughout:
- Llama 3.1 8B perplexity improved **1.43%** (8.877 → 8.752)
- SmolLM2 compression recovery: **83%**
- Hardware: **156-qubit IBM Quantum System Two**

---

## Screenshots

*(Add screenshots to `docs/images/` after first run)*

---

## Quick Start

### Docker (one command)
```bash
docker-compose up --build
```
Open http://localhost:5173

### Two terminals
**Terminal 1 — Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

---

## What You'll See

| Panel | What it shows |
|---|---|
| **Adapter Story** | Animated 4-step journey from $1M fine-tuning to 6,144 quantum params |
| **Adapter Comparison** | Live param counts, memory, compression ratios for all 3 strategies |
| **Quantum Circuit Visualiser** | Canvas-rendered gate diagram (SX/RZ/CZ) with animation |
| **Perplexity Panel** | Real paper numbers + interactive recovery simulation |
| **Noise Phase Chart** | Why 2 qubits works and 3 qubits doesn't on IBM hardware |
| **Question Showcase** | Real MMLU questions the quantum model got right, base model got wrong |
| **Parameter Efficiency Chart** | Log-scale bar chart spanning 7 orders of magnitude |
| **Benchmark Panel** | Quantum advantage grows with model size |

---

## Project Structure

```
quantum-adapter-lab/
├── backend/
│   ├── app/
│   │   ├── main.py        FastAPI app, lifespan handler, all endpoints
│   │   ├── schemas.py     Pydantic v2 request models with field constraints
│   │   ├── quantum.py     Cayley unitary simulation (NumPy only)
│   │   ├── adapters.py    Parameter counts + perplexity recovery simulation
│   │   ├── benchmark.py   Scaling analysis across model sizes
│   │   └── examples.py    Pre-built examples (module-level cache)
│   └── tests/             28 tests — pytest
├── frontend/
│   └── src/
│       ├── App.tsx
│       ├── components/
│       │   ├── Header.tsx
│       │   ├── AdapterStory.tsx
│       │   ├── AdapterComparison.tsx
│       │   ├── QuantumCircuitViz.tsx   Canvas-based, not SVG
│       │   ├── PerplexityPanel.tsx
│       │   ├── NoisePhaseChart.tsx
│       │   ├── QuestionShowcase.tsx
│       │   ├── ParameterEfficiencyChart.tsx
│       │   └── BenchmarkPanel.tsx
│       └── lib/
│           ├── api.ts, types.ts, format.ts
├── docker-compose.yml
└── .github/workflows/ci.yml
```

---

## Running Tests

```bash
cd backend
pytest
# Expected: 51 tests passed
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.12, FastAPI, Pydantic v2, NumPy |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 3 |
| Charts | Recharts |
| Animation | Framer Motion |
| Quantum sim | NumPy matrix math (no Qiskit) |
| CI/CD | GitHub Actions |

---

## Paper Citation

```bibtex
@article{aizpurua2026quantum,
  title   = {Quantum-enhanced Large Language Models on Quantum Hardware
             via Cayley Unitary Adapters},
  author  = {Aizpurua, Borja and Singh, Sukhbinder and Kshetrimayum, Augustine
             and Jahromi, Saeed S. and Orus, Roman},
  journal = {arXiv preprint arXiv:2605.05914},
  year    = {2026}
}
```

---

## Known Limitations

- This is an educational simulation, not real quantum hardware execution.
- Quantum circuits are simulated with classical NumPy (2-qubit = 4×4 matrices).
- Perplexity recovery numbers are deterministic simulations, not measured experiments.
- The real paper used 1 layer v_proj only for the 6,144-param result; the demo shows all-layer configs too.

## License

MIT
