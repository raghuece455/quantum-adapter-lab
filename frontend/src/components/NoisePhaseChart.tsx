import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import type { DotProps } from 'recharts'
import Card from './ui/Card'

const DATA = [
  { qubits: 2, degradation: 0.08, label: 'Benign noise', feasible: true },
  { qubits: 3, degradation: 2.80, label: '35× worse', feasible: false },
  { qubits: 4, degradation: 12.50, label: 'Unusable today', feasible: false },
]

interface FeasiblePayload {
  feasible: boolean
}

function CustomDot(props: DotProps & { payload?: FeasiblePayload }) {
  const { cx = 0, cy = 0, payload } = props
  const color = payload?.feasible ? '#22c55e' : '#ef4444'
  return <circle cx={cx} cy={cy} r={6} fill={color} stroke="#111827" strokeWidth={2} />
}

export default function NoisePhaseChart() {
  return (
    <Card>
      <h3 className="font-semibold text-gray-100 mb-1">Noise-Expressivity Phase Transition</h3>
      <p className="text-xs text-gray-500 mb-1">
        IBM Heron r2 depolarizing error rate: <span className="text-amber-400 font-mono">λ = 11.9%</span> per operation.
        At 2 qubits, this barely hurts the model. At 3 qubits, quality collapses 35×.
        This defines the "synthesis feasibility frontier" for current quantum hardware.
      </p>
      <p className="text-xs text-gray-600 mb-4 italic">Values from arXiv:2605.05914 — exact paper measurements.</p>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={DATA} margin={{ top: 10, right: 40, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="qubits"
            stroke="#4b5563"
            tick={{ fontSize: 12 }}
            label={{ value: 'Qubit count per block', position: 'insideBottom', offset: -5, fill: '#6b7280', fontSize: 11 }}
          />
          <YAxis
            stroke="#4b5563"
            tick={{ fontSize: 11 }}
            label={{ value: 'PPL degradation %', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 11 }}
          />
          <RTooltip
            contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
            formatter={(value: number) => [`${value}%`, 'PPL degradation']}
          />

          {/* Reference lines */}
          <ReferenceLine
            x={2.5}
            stroke="#ef4444"
            strokeDasharray="6 3"
            label={{ value: '← Synthesis frontier', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }}
          />
          <ReferenceLine
            y={0.08}
            stroke="#22c55e"
            strokeDasharray="4 4"
            label={{ value: '2-qubit operating point', fill: '#22c55e', fontSize: 10, position: 'insideTopLeft' }}
          />

          <Line
            type="monotone"
            dataKey="degradation"
            stroke="#a855f7"
            strokeWidth={2.5}
            dot={(props) => <CustomDot {...props} />}
            name="PPL degradation %"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Annotations */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {DATA.map(d => (
          <div
            key={d.qubits}
            className={`px-3 py-2.5 rounded-lg border ${d.feasible ? 'bg-green-950/30 border-green-700/40' : 'bg-red-950/30 border-red-800/40'}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-lg font-bold tabular-nums ${d.feasible ? 'text-green-300' : 'text-red-400'}`}>
                {d.qubits} qubits
              </span>
              <span className="text-xs">{d.feasible ? '✅' : '❌'}</span>
            </div>
            <div className={`text-xl font-bold tabular-nums ${d.feasible ? 'text-green-400' : 'text-red-300'}`}>
              {d.degradation}%
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{d.label}</div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-gray-600 leading-relaxed">
        The sweet spot is 2 qubits: large enough to express meaningful transformations,
        small enough that current quantum hardware noise stays below 0.1%.
        This is why the paper uses 2-qubit blocks exclusively.
      </p>
    </Card>
  )
}
