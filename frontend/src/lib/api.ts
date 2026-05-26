import type { AnalyzeResult, CircuitResult, BenchmarkRow, Example } from './types'

const BASE = '/api'

async function post<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
  return r.json() as Promise<T>
}

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`)
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
  return r.json() as Promise<T>
}

export interface AnalyzeParams {
  model_size: string
  hidden_dim: number
  num_layers: number
  lora_rank: number
  qubit_count: number
  compression_ratio: number
}

export function fetchAnalyze(params: AnalyzeParams): Promise<AnalyzeResult> {
  return post<AnalyzeResult>('/analyze', params)
}

export function fetchCircuit(qubit_count: number, input_vector: number[]): Promise<CircuitResult> {
  return post<CircuitResult>('/circuit', { qubit_count, input_vector })
}

export function fetchBenchmark(): Promise<{ rows: BenchmarkRow[] }> {
  return post<{ rows: BenchmarkRow[] }>('/benchmark', {})
}

export function fetchExamples(): Promise<{ examples: Example[] }> {
  return get<{ examples: Example[] }>('/examples')
}
