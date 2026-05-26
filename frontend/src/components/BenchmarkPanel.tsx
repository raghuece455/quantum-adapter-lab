import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer } from 'recharts'
import type { BenchmarkRow } from '../lib/types'
import Card from './ui/Card'

interface Props {
  rows: BenchmarkRow[]
}

export default function BenchmarkPanel({ rows }: Props) {
  if (rows.length === 0) return null

  const trendData = rows.map(r => ({
    dim: r.hidden_dim,
    ratio: r.quantum_vs_lora_ratio,
  }))

  return (
    <Card>
      <h3 className="font-semibold text-gray-100 mb-1">Quantum Advantage Grows with Model Size</h3>
      <p className="text-xs text-gray-500 mb-4">
        As the hidden dimension increases, the quantum adapter becomes proportionally
        more efficient relative to LoRA — because quantum block count scales as d/4
        while LoRA params scale as 2×rank×d.
      </p>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="dim" stroke="#4b5563" tick={{ fontSize: 11 }} label={{ value: 'Hidden dim', position: 'insideBottom', offset: -4, fill: '#6b7280', fontSize: 11 }} />
          <YAxis stroke="#4b5563" tick={{ fontSize: 11 }} label={{ value: 'Quantum÷LoRA', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 11 }} />
          <RTooltip
            contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
            formatter={(v: number) => [`${v}×`, 'Compression vs LoRA r8']}
          />
          <Line type="monotone" dataKey="ratio" stroke="#a855f7" strokeWidth={2.5} dot={{ fill: '#a855f7', r: 4 }} name="Q÷LoRA ratio" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
