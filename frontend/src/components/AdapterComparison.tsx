import { motion } from 'framer-motion'
import type { AnalyzeResult } from '../lib/types'
import { fmtParams, fmtMb, fmtComma } from '../lib/format'
import Card from './ui/Card'
import Badge from './ui/Badge'

interface Props {
  result: AnalyzeResult
  loraRank: number
}

export default function AdapterComparison({ result, loraRank }: Props) {
  const { full_ft, lora, quantum } = result.adapters

  const cards = [
    {
      key: 'full_ft',
      label: 'Full Fine-Tuning',
      icon: '🏋️',
      badge: <Badge variant="neutral">Classical</Badge>,
      params: full_ft.params,
      memory: full_ft.memory_mb_fp16,
      compression: '1×',
      compressionLabel: 'baseline',
      color: 'text-gray-300',
      borderClass: '',
      desc: full_ft.description,
      extra: null,
    },
    {
      key: 'lora',
      label: `LoRA (rank ${loraRank})`,
      icon: '🔧',
      badge: <Badge variant="classical">Classical</Badge>,
      params: lora.params,
      memory: lora.memory_mb_fp16,
      compression: `${fmtComma(lora.compression_vs_full ?? 0)}×`,
      compressionLabel: 'fewer than full FT',
      color: 'text-blue-300',
      borderClass: '',
      desc: lora.description,
      extra: null,
    },
    {
      key: 'quantum',
      label: 'Quantum Cayley Adapter',
      icon: '⚛️',
      badge: <Badge variant="quantum">⚛ Quantum</Badge>,
      params: quantum.params,
      memory: quantum.memory_mb_fp16,
      compression: `${fmtComma(quantum.compression_vs_lora ?? 0)}×`,
      compressionLabel: 'fewer than LoRA',
      color: 'text-purple-300',
      borderClass: 'quantum',
      desc: quantum.description,
      extra: (
        <div className="mt-3 px-3 py-2 rounded-lg bg-amber-950/40 border border-amber-700/40">
          <div className="text-xs text-amber-400 font-semibold">★ Paper result (1 layer, v_proj)</div>
          <div className="text-lg font-bold text-amber-300 tabular-nums">
            {fmtComma(quantum.paper_params ?? 6144)} params
          </div>
          <div className="text-xs text-amber-200/70">
            {fmtComma(quantum.paper_compression_vs_lora ?? 2730)}× fewer than unconstrained LoRA
          </div>
        </div>
      ),
    },
  ]

  const qVsLora = fmtComma(quantum.compression_vs_lora ?? 0)

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Adapter Comparison</h2>
        <span className="text-xs text-gray-500">Model: {result.model_info.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <motion.div key={c.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card quantumBorder={c.borderClass === 'quantum'} className="h-full flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{c.icon}</span>
                  <span className="font-semibold text-sm text-gray-100">{c.label}</span>
                </div>
                {c.badge}
              </div>

              <div className={`text-4xl font-bold tabular-nums mb-1 ${c.color}`}>
                {fmtParams(c.params)}
              </div>
              <div className="text-xs text-gray-500 mb-4">trainable parameters</div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700/50">
                  <div className="text-xs text-gray-500">Memory (fp16)</div>
                  <div className="text-sm font-semibold text-gray-200">{fmtMb(c.memory)}</div>
                </div>
                <div className="px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700/50">
                  <div className="text-xs text-gray-500">{c.compressionLabel}</div>
                  <div className="text-sm font-semibold text-gray-200">{c.compression}</div>
                </div>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed flex-1">{c.desc}</p>
              {c.extra}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Wow-moment stat */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-amber-600/40 bg-amber-950/20 px-6 py-4 flex items-center justify-between"
      >
        <div>
          <div className="text-xs text-amber-400 uppercase tracking-wider font-medium">Quantum vs LoRA (rank {loraRank})</div>
          <div className="text-xs text-gray-500 mt-0.5">for {result.model_info.name} · {result.model_info.num_layers} layers</div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-amber-300 tabular-nums">{qVsLora}×</div>
          <div className="text-sm text-amber-400/80">fewer parameters</div>
        </div>
      </motion.div>
    </section>
  )
}
