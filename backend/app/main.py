import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import AnalyzeRequest, BenchmarkRequest, CircuitRequest
from app.adapters import analyze_adapters
from app.quantum import simulate_circuit, noise_impact
from app.benchmark import parameter_efficiency_table, validate_hidden_dims
from app.examples import get_examples

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def _lifespan(application: FastAPI) -> AsyncIterator[None]:
    logger.info("Quantum Adapter Lab API started.")
    yield
    logger.info("Quantum Adapter Lab API stopped.")


app = FastAPI(
    title="Quantum Adapter Lab API",
    description=(
        "Educational simulator comparing Full Fine-Tuning, LoRA, and "
        "Quantum Cayley Adapters for LLMs. Based on arXiv:2605.05914."
    ),
    version="1.0.0",
    lifespan=_lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://frontend:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok", "version": "1.0.0"}


@app.get("/api/examples")
async def examples() -> dict:
    return {"examples": get_examples()}


@app.post("/api/analyze")
async def analyze(request: AnalyzeRequest) -> dict:
    logger.info(
        "Analyze: model=%s lora_rank=%d qubits=%d compression=%.2f",
        request.model_size,
        request.lora_rank,
        request.qubit_count,
        request.compression_ratio,
    )
    return analyze_adapters(
        model_size=request.model_size,
        hidden_dim=request.hidden_dim,
        num_layers=request.num_layers,
        lora_rank=request.lora_rank,
        qubit_count=request.qubit_count,
        compression_ratio=request.compression_ratio,
    )


@app.post("/api/circuit")
async def circuit(request: CircuitRequest) -> dict:
    logger.info("Circuit: qubits=%d vector_len=%d", request.qubit_count, len(request.input_vector))
    return simulate_circuit(
        input_vector=request.input_vector,
        n_qubits=request.qubit_count,
    )


@app.post("/api/benchmark")
async def benchmark(request: BenchmarkRequest) -> dict:
    logger.info(
        "Benchmark: %d dims, %d ranks",
        len(request.hidden_dims),
        len(request.lora_ranks),
    )
    clean_dims = validate_hidden_dims(request.hidden_dims)
    rows = parameter_efficiency_table(clean_dims, request.lora_ranks)
    return {"rows": rows}
