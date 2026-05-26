import { useEffect, useRef, useState } from 'react'
import type { CircuitResult } from '../lib/types'
import Card from './ui/Card'
import Button from './ui/Button'
import { Play } from 'lucide-react'

interface Props {
  result: CircuitResult | null
}

const GATE_COLORS: Record<string, string> = {
  SX: '#3b82f6',
  RZ: '#22c55e',
  CZ: '#f59e0b',
}

export default function QuantumCircuitViz({ result }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [animStep, setAnimStep] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const drawCircuit = (highlight: number | null = null) => {
    const canvas = canvasRef.current
    if (!canvas || !result) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)

    const numQubits = result.n_qubits
    const gates = result.gate_sequence
    const margin = { left: 60, right: 20, top: 30, bottom: 20 }
    const qubitSpacing = (H - margin.top - margin.bottom) / (numQubits + 1)
    const gateWidth = 28
    const gateSpacing = Math.min(38, (W - margin.left - margin.right) / (gates.length + 1))

    // Qubit labels & lines
    for (let q = 0; q < numQubits; q++) {
      const y = margin.top + (q + 1) * qubitSpacing
      ctx.strokeStyle = '#374151'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(margin.left, y)
      ctx.lineTo(W - margin.right, y)
      ctx.stroke()
      ctx.fillStyle = '#9ca3af'
      ctx.font = '12px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(`q${q}`, margin.left - 8, y + 4)
    }

    // Draw gates
    gates.forEach((gate, idx) => {
      const x = margin.left + (idx + 1) * gateSpacing
      const isHighlighted = highlight === idx
      const alpha = highlight === null ? 1 : isHighlighted ? 1 : 0.25

      ctx.globalAlpha = alpha

      if (gate.gate === 'CZ') {
        // Two-qubit gate: draw vertical line connecting qubits
        const qubits = Array.isArray(gate.qubit) ? gate.qubit : [0, 1]
        const y1 = margin.top + (qubits[0] + 1) * qubitSpacing
        const y2 = margin.top + (qubits[1] + 1) * qubitSpacing
        ctx.strokeStyle = GATE_COLORS.CZ
        ctx.lineWidth = isHighlighted ? 3 : 2
        ctx.beginPath()
        ctx.moveTo(x, y1)
        ctx.lineTo(x, y2)
        ctx.stroke()
        // Dots at each qubit
        for (const q of qubits) {
          const y = margin.top + (q + 1) * qubitSpacing
          ctx.fillStyle = GATE_COLORS.CZ
          ctx.beginPath()
          ctx.arc(x, y, 5, 0, Math.PI * 2)
          ctx.fill()
        }
        // Label
        ctx.fillStyle = GATE_COLORS.CZ
        ctx.font = isHighlighted ? 'bold 9px monospace' : '9px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('CZ', x, y2 + 14)
      } else {
        const q = typeof gate.qubit === 'number' ? gate.qubit : 0
        const y = margin.top + (q + 1) * qubitSpacing
        const color = GATE_COLORS[gate.gate] ?? '#6b7280'

        // Gate box
        ctx.fillStyle = isHighlighted ? color : color + '99'
        ctx.strokeStyle = color
        ctx.lineWidth = isHighlighted ? 2 : 1
        const hw = gateWidth / 2
        ctx.beginPath()
        ctx.roundRect(x - hw, y - 11, gateWidth, 22, 4)
        ctx.fill()
        ctx.stroke()

        // Gate label
        ctx.fillStyle = '#fff'
        ctx.font = isHighlighted ? 'bold 10px monospace' : '10px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(gate.gate, x, y + 4)
      }

      ctx.globalAlpha = 1
    })

    // Legend
    const legendX = W - 130
    const legendY = 12
    ctx.font = '10px system-ui'
    ctx.textAlign = 'left'
    Object.entries(GATE_COLORS).forEach(([name, color], i) => {
      ctx.fillStyle = color
      ctx.fillRect(legendX + i * 38, legendY, 10, 10)
      ctx.fillStyle = '#9ca3af'
      ctx.fillText(name, legendX + i * 38 + 13, legendY + 9)
    })
  }

  useEffect(() => {
    drawCircuit(animStep)
  }, [result, animStep])

  const runAnimation = async () => {
    if (!result || isAnimating) return
    setIsAnimating(true)
    for (let i = 0; i < result.gate_sequence.length; i++) {
      setAnimStep(i)
      await new Promise(r => setTimeout(r, 80))
    }
    setAnimStep(null)
    setIsAnimating(false)
  }

  if (!result) {
    return (
      <Card>
        <div className="h-56 flex items-center justify-center text-gray-600 text-sm">
          Loading circuit…
        </div>
      </Card>
    )
  }

  const { gate_summary, is_unitary, fidelity, n_qubits, state_dim, num_params } = result

  return (
    <Card quantumBorder>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-100">Quantum Circuit Visualiser</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            One 2-qubit Cayley block · {gate_summary.total} gates · The real IBM model used 1,024 blocks in parallel
          </p>
        </div>
        <Button variant="quantum" size="sm" onClick={runAnimation} disabled={isAnimating}>
          <Play className="w-3.5 h-3.5" />
          Animate
        </Button>
      </div>

      <canvas
        ref={canvasRef}
        width={680}
        height={140}
        className="w-full rounded-lg bg-gray-950 border border-gray-800"
      />

      {/* Gate summary */}
      <div className="mt-3 flex gap-3 flex-wrap">
        {Object.entries(gate_summary).filter(([k]) => k !== 'total').map(([gate, count]) => (
          <div key={gate} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-800 border border-gray-700">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: GATE_COLORS[gate] ?? '#6b7280' }} />
            <span className="text-xs font-mono text-gray-300">{gate}: {String(count)}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-800 border border-gray-700">
          <span className="text-xs text-gray-400">Total: {gate_summary.total}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Unitary', value: is_unitary ? '✓ Yes' : '✗ No', color: is_unitary ? 'text-green-400' : 'text-red-400' },
          { label: 'Fidelity', value: fidelity.toFixed(4), color: 'text-gray-200' },
          { label: 'Qubits', value: String(n_qubits), color: 'text-purple-300' },
          { label: `State dim (2^${n_qubits})`, value: String(state_dim), color: 'text-gray-200' },
        ].map(s => (
          <div key={s.label} className="px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700/50">
            <div className="text-xs text-gray-500">{s.label}</div>
            <div className={`text-sm font-semibold font-mono ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-gray-600 leading-relaxed">
        <span className="font-medium text-gray-500">How it works:</span> Input vector is normalised (amplitude encoding) →
        Cayley unitary Q is built from {num_params} parameters via Q = (I − ½K)(I + ½K)⁻¹ →
        Q is applied to the vector → output has identical norm (unitarity guarantees no information loss).
      </p>
    </Card>
  )
}
