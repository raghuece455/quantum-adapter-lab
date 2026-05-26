import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { AnalyzeResult } from '../lib/types'
import Card from './ui/Card'
import Slider from './ui/Slider'

interface Props {
  result: AnalyzeResult
  compressionRatio: number
  onCompressionChange: (v: number) => void
}

export default function PerplexityPanel({ result, compressionRatio, onCompressionChange }: Props) {
  const { paper } = result.perplexity
  const rec = result.perplexity.recovery_simulation

  // Build recovery chart data across compression range
  const chartData = Array.from({ length: 21 }, (_, i) => {
    const ratio = i / 20
    const degraded = paper.baseline * (1 + (1 - ratio) * 0.4)
    const gap = degraded - paper.baseline
    return {
      compression: Math.round(ratio * 100),
      degraded: parseFloat(degraded.toFixed(3)),
      lora_r8: parseFloat((degraded - gap * 0.62).toFixed(3)),
      lora_r32: parseFloat((degraded - gap * 0.78).toFixed(3)),
      lora_r64: parseFloat((degraded - gap * 0.85).toFixed(3)),
      quantum: parseFloat((degraded - gap * 0.83).toFixed(3)),
    }
  })

  return (
    <div className="space-y-4">
      {/* Paper Results */}
      <Card goldenBorder>
        <h3 className="font-semibold text-gray-100 mb-4">Paper Results — Real IBM Hardware</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Baseline PPL', value: String(paper.baseline), color: 'text-gray-300' },
            { label: 'After Quantum Adapter', value: String(paper.after_quantum), color: 'text-green-300' },
            { label: 'Improvement', value: `${paper.improvement_pct}%`, color: 'text-amber-300' },
          ].map(s => (
            <div key={s.label} className="px-3 py-3 rounded-lg bg-gray-800/60 border border-gray-700/50 text-center">
              <div className="text-xs text-gray-500 mb-1">{s.label}</div>
              <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 rounded bg-green-900/30 border border-green-700/40 text-green-300">
            ✓ Validated on real QPU
          </span>
          <span className="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-gray-400">
            {paper.hardware}
          </span>
          <span className="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-gray-400">
            {paper.model}
          </span>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          PPL = perplexity (lower is better — measures how well the model predicts text).
          A 1.43% improvement means the model is measurably more accurate at predicting language.
        </p>
      </Card>

      {/* Recovery Simulation */}
      <Card>
        <h3 className="font-semibold text-gray-100 mb-1">Quality Recovery Simulation</h3>
        <p className="text-xs text-gray-500 mb-4">
          How much quality does each adapter recover after the model has been compressed?
          The quantum adapter recovers <span className="text-purple-300 font-semibold">83%</span> — a real paper result.
        </p>

        <div className="mb-4">
          <Slider
            label="Compression level (0% = original quality preserved)"
            min={0}
            max={100}
            step={5}
            value={Math.round(compressionRatio * 100)}
            onChange={v => onCompressionChange(v / 100)}
            formatValue={v => `${v}%`}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {[
            { label: 'LoRA rank 8', value: rec.lora_r8, pct: rec.lora_r8_recovery_pct, color: 'text-blue-400' },
            { label: 'LoRA rank 32', value: rec.lora_r32, pct: rec.lora_r32_recovery_pct, color: 'text-blue-300' },
            { label: 'LoRA rank 64', value: rec.lora_r64, pct: rec.lora_r64_recovery_pct, color: 'text-blue-200' },
            { label: 'Quantum', value: rec.quantum, pct: rec.quantum_recovery_pct, color: 'text-purple-300' },
          ].map(s => (
            <div key={s.label} className="px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700/50 text-center">
              <div className="text-xs text-gray-500 mb-1">{s.label}</div>
              <div className={`text-lg font-bold tabular-nums ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-600">{s.pct}% recovery</div>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="compression" stroke="#4b5563" tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
            <YAxis stroke="#4b5563" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
            <RTooltip
              contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
              labelFormatter={v => `Compression: ${v}%`}
            />
            <ReferenceLine y={paper.baseline} stroke="#6b7280" strokeDasharray="4 4" label={{ value: 'baseline', fill: '#6b7280', fontSize: 10 }} />
            <Line type="monotone" dataKey="lora_r8" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="LoRA r8" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="lora_r32" stroke="#60a5fa" strokeWidth={1.5} dot={false} name="LoRA r32" />
            <Line type="monotone" dataKey="lora_r64" stroke="#93c5fd" strokeWidth={2} dot={false} name="LoRA r64" />
            <Line type="monotone" dataKey="quantum" stroke="#a855f7" strokeWidth={2.5} dot={false} name="Quantum ★" />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
