import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer } from 'recharts'
import type { BenchmarkRow } from '../lib/types'
import Card from './ui/Card'
import { fmtParams } from '../lib/format'

interface Props {
  rows: BenchmarkRow[]
}

export default function ParameterEfficiencyChart({ rows }: Props) {
  if (rows.length === 0) return null

  const chartData = rows.map(r => ({
    dim: `d=${r.hidden_dim}`,
    'Full FT': r.full_ft,
    'LoRA r8': r.lora_r8 ?? 0,
    Quantum: r.quantum,
  }))

  return (
    <Card>
      <h3 className="font-semibold text-gray-100 mb-1">Parameter Count by Adapter Type</h3>
      <p className="text-xs text-gray-500 mb-4">
        Log scale — the numbers span 7 orders of magnitude.
        Quantum adapters use <span className="text-amber-400 font-semibold">orders of magnitude</span> fewer parameters than full fine-tuning.
      </p>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="dim" stroke="#4b5563" tick={{ fontSize: 11 }} />
          <YAxis
            stroke="#4b5563"
            tick={{ fontSize: 10 }}
            scale="log"
            domain={['auto', 'auto']}
            tickFormatter={(v: number) => fmtParams(v)}
          />
          <RTooltip
            contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
            formatter={(value: number) => [fmtParams(value)]}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Full FT" fill="#6b7280" radius={[3, 3, 0, 0]} />
          <Bar dataKey="LoRA r8" fill="#3b82f6" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Quantum" fill="#a855f7" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Compression table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="text-left py-2 pr-4">Hidden dim</th>
              <th className="text-right py-2 pr-4">Full FT</th>
              <th className="text-right py-2 pr-4">LoRA r8</th>
              <th className="text-right py-2 pr-4 text-purple-400">Quantum</th>
              <th className="text-right py-2 text-amber-400">Q ÷ LoRA</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.hidden_dim} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                <td className="py-2 pr-4 font-mono text-gray-300">{r.hidden_dim}</td>
                <td className="py-2 pr-4 text-right text-gray-400">{fmtParams(r.full_ft)}</td>
                <td className="py-2 pr-4 text-right text-blue-400">{fmtParams(r.lora_r8 ?? 0)}</td>
                <td className="py-2 pr-4 text-right text-purple-400">{fmtParams(r.quantum)}</td>
                <td className="py-2 text-right text-amber-400 font-semibold">{r.quantum_vs_lora_ratio}×</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-gray-600">
        Quantum advantage (Q ÷ LoRA ratio) grows with model size — larger models benefit more from quantum adapters.
      </p>
    </Card>
  )
}
