import { useEffect, useState, useCallback } from 'react'
import type { AnalyzeResult, CircuitResult, BenchmarkRow, Example } from './lib/types'
import { fetchAnalyze, fetchCircuit, fetchBenchmark, fetchExamples } from './lib/api'

import Header from './components/Header'
import AdapterStory from './components/AdapterStory'
import AdapterComparison from './components/AdapterComparison'
import QuantumCircuitViz from './components/QuantumCircuitViz'
import PerplexityPanel from './components/PerplexityPanel'
import NoisePhaseChart from './components/NoisePhaseChart'
import QuestionShowcase from './components/QuestionShowcase'
import ParameterEfficiencyChart from './components/ParameterEfficiencyChart'
import BenchmarkPanel from './components/BenchmarkPanel'
import Button from './components/ui/Button'

const LORA_RANKS = [4, 8, 16, 32, 64, 128]

export default function App() {
  const [examples, setExamples] = useState<Example[]>([])
  const [selectedIdx, setSelectedIdx] = useState(0)

  // Controls
  const [loraRank, setLoraRank] = useState(8)
  const [qubitCount, setQubitCount] = useState(2)
  const [compressionRatio, setCompressionRatio] = useState(0.5)

  // Results
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null)
  const [circuitResult, setCircuitResult] = useState<CircuitResult | null>(null)
  const [benchmarkRows, setBenchmarkRows] = useState<BenchmarkRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch examples + benchmark on mount
  useEffect(() => {
    fetchExamples()
      .then(d => setExamples(d.examples))
      .catch(() => {/* backend may not be running in static preview */})

    fetchBenchmark()
      .then(d => setBenchmarkRows(d.rows))
      .catch(() => {})
  }, [])

  const runAnalyze = useCallback(
    async (exIdx: number, rank: number, qubits: number, compression: number) => {
      const ex = examples[exIdx]
      if (!ex) return
      setLoading(true)
      setError(null)
      try {
        const [ar, cr] = await Promise.all([
          fetchAnalyze({
            model_size: ex.model_size,
            hidden_dim: ex.hidden_dim,
            num_layers: ex.num_layers,
            lora_rank: rank,
            qubit_count: qubits,
            compression_ratio: compression,
          }),
          fetchCircuit(qubits, [1, 0.5, 0.3, 0.2, 0.1, 0.0, -0.1, -0.2].slice(0, 2 ** qubits)),
        ])
        setAnalyzeResult(ar)
        setCircuitResult(cr)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to connect to backend')
      } finally {
        setLoading(false)
      }
    },
    [examples],
  )

  // Re-run whenever controls or example changes
  useEffect(() => {
    if (examples.length > 0) {
      runAnalyze(selectedIdx, loraRank, qubitCount, compressionRatio)
    }
  }, [examples, selectedIdx, loraRank, qubitCount, compressionRatio])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      <Header />
      <AdapterStory />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">

        {/* ── Controls ── */}
        <section className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Configure</h2>

          {/* Example selector */}
          {examples.length > 0 && (
            <div className="mb-5">
              <label className="text-sm text-gray-400 block mb-2">Model preset</label>
              <div className="flex flex-wrap gap-2">
                {examples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedIdx(i)}
                    className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                      selectedIdx === i
                        ? 'bg-purple-800 border-purple-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
              {examples[selectedIdx] && (
                <p className="mt-2 text-xs text-gray-500">{examples[selectedIdx].description}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* LoRA rank */}
            <div>
              <label className="text-sm text-gray-400 block mb-2">LoRA rank</label>
              <div className="flex flex-wrap gap-2">
                {LORA_RANKS.map(r => (
                  <button
                    key={r}
                    onClick={() => setLoraRank(r)}
                    className={`px-3 py-1.5 rounded text-xs font-mono border transition-colors ${
                      loraRank === r
                        ? 'bg-blue-800 border-blue-600 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    r={r}
                  </button>
                ))}
              </div>
            </div>

            {/* Qubit count */}
            <div>
              <label className="text-sm text-gray-400 block mb-2">Qubits per block</label>
              <div className="flex gap-2">
                {[2, 3, 4].map(q => (
                  <button
                    key={q}
                    onClick={() => setQubitCount(q)}
                    className={`px-4 py-1.5 rounded text-xs font-mono border transition-colors ${
                      qubitCount === q
                        ? 'bg-purple-800 border-purple-600 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {q}q
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-gray-600">2 qubits = feasible on IBM hardware today</p>
            </div>

            {/* Run button */}
            <div className="flex items-end">
              <Button
                variant="quantum"
                size="md"
                disabled={loading || examples.length === 0}
                onClick={() => runAnalyze(selectedIdx, loraRank, qubitCount, compressionRatio)}
                className="w-full justify-center"
              >
                {loading ? 'Computing…' : '⚛ Run Analysis'}
              </Button>
            </div>
          </div>
        </section>

        {/* ── Error ── */}
        {error && (
          <div className="rounded-xl border border-red-800/50 bg-red-950/30 px-5 py-4 text-sm text-red-300">
            <span className="font-medium">Backend error:</span> {error}
            <span className="block mt-1 text-xs text-red-400/70">
              Make sure the backend is running: <code className="font-mono">uvicorn app.main:app --reload --port 8000</code>
            </span>
          </div>
        )}

        {/* ── Adapter Comparison ── */}
        {analyzeResult && (
          <AdapterComparison result={analyzeResult} loraRank={loraRank} />
        )}

        {/* ── Circuit + Perplexity ── */}
        {analyzeResult && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuantumCircuitViz result={circuitResult} />
            <PerplexityPanel
              result={analyzeResult}
              compressionRatio={compressionRatio}
              onCompressionChange={setCompressionRatio}
            />
          </div>
        )}

        {/* ── Noise Phase Chart ── */}
        <NoisePhaseChart />

        {/* ── Question Showcase ── */}
        <QuestionShowcase />

        {/* ── Parameter Efficiency ── */}
        {benchmarkRows.length > 0 && (
          <ParameterEfficiencyChart rows={benchmarkRows} />
        )}

        {/* ── Benchmark Trend ── */}
        {benchmarkRows.length > 0 && (
          <BenchmarkPanel rows={benchmarkRows} />
        )}

        {/* ── Footer ── */}
        <footer className="border-t border-gray-800 pt-8 pb-4 text-center space-y-2">
          <p className="text-xs text-gray-500 leading-relaxed max-w-2xl mx-auto">
            Based on:{' '}
            <a href="https://arxiv.org/abs/2605.05914" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">
              Aizpurua et al. (2026) — Quantum-enhanced Large Language Models on Quantum Hardware via Cayley Unitary Adapters.
              arXiv:2605.05914
            </a>
            . Multiverse Computing &amp; University of Navarra.
          </p>
          <p className="text-xs text-gray-600">
            This demo is an educational simulation — not affiliated with the paper authors.
            No quantum computer required to run this demo.
          </p>
        </footer>

      </main>
    </div>
  )
}
