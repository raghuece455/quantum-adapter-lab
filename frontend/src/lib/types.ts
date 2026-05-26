export interface ModelInfo {
  name: string
  total_base_params: number
  hidden_dim: number
  num_layers: number
}

export interface AdapterInfo {
  params: number
  memory_mb_fp16: number
  memory_mb_fp32?: number
  description: string
  compression_vs_full?: number
  rank?: number
  blocks?: number
  blocks_per_layer?: number
  qubits_per_block?: number
  compression_vs_lora?: number
  paper_params?: number
  paper_compression_vs_lora?: number
}

export interface RecoverySimulation {
  baseline_ppl: number
  degraded_ppl: number
  lora_r8: number
  lora_r32: number
  lora_r64: number
  quantum: number
  quantum_recovery_pct: number
  lora_r8_recovery_pct: number
  lora_r32_recovery_pct: number
  lora_r64_recovery_pct: number
}

export interface PaperResults {
  baseline: number
  after_quantum: number
  improvement_pct: number
  hardware: string
  model: string
}

export interface AnalyzeResult {
  model_info: ModelInfo
  adapters: {
    full_ft: AdapterInfo
    lora: AdapterInfo
    quantum: AdapterInfo
  }
  perplexity: {
    paper: PaperResults
    recovery_simulation: RecoverySimulation
  }
  noise: {
    '2q_degradation_pct': number
    '3q_degradation_pct': number
    '4q_degradation_pct': number
    ibm_error_rate: number
    synthesis_frontier: number
  }
}

export interface GateStep {
  gate: 'SX' | 'RZ' | 'CZ'
  qubit: number | number[]
  step: number
  angle?: number
}

export interface CircuitResult {
  input_normalized: number[]
  unitary_matrix: number[][]
  output_vector: number[]
  is_unitary: boolean
  fidelity: number
  n_qubits: number
  state_dim: number
  num_params: number
  gate_sequence: GateStep[]
  gate_summary: { SX: number; RZ: number; CZ: number; total: number }
}

export interface BenchmarkRow {
  hidden_dim: number
  full_ft: number
  quantum: number
  quantum_memory_mb: number
  quantum_vs_lora_ratio: number
  [key: string]: number
}

export interface Example {
  label: string
  model_size: string
  hidden_dim: number
  num_layers: number
  lora_rank: number
  qubit_count: number
  compression_ratio: number
  description: string
}
