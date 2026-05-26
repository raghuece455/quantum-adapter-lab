# Contributing

## Prerequisites
- Python 3.12+
- Node.js 20+
- Docker (optional)

## Dev Setup

```bash
# Backend
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

## Running Tests

```bash
cd backend && pytest          # should show 28 passed
cd frontend && npm run build  # must produce zero TypeScript errors
```

## PR Checklist

- [ ] `pytest` passes (28 tests, zero warnings)
- [ ] `npm run build` passes with zero TypeScript errors
- [ ] Real paper numbers unchanged (8.877, 8.752, 6144, 2730, 83%)
- [ ] New backend functions have corresponding tests
- [ ] No component in `ui/` is defined but never imported
- [ ] Disclaimer about "educational simulation" remains visible

## Code Style

- Python: follow existing module structure; use type hints everywhere
- TypeScript: strict mode — no `any`, no unused variables
- No external quantum libraries (no Qiskit, no PennyLane) — NumPy only
