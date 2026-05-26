import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronRight, X } from 'lucide-react'

const steps = [
  {
    color: 'text-gray-300',
    accent: 'text-gray-400',
    bg: 'bg-gray-800/60 border-gray-700',
    icon: '💸',
    label: 'Full Fine-Tuning',
    number: '~$1,000,000+',
    subtitle: 'training cost for a 7B model',
    desc: 'Updating every weight in the model produces the best results — but costs billions of parameters and enormous compute.',
  },
  {
    color: 'text-blue-300',
    accent: 'text-blue-400',
    bg: 'bg-blue-950/40 border-blue-800/50',
    icon: '⚡',
    label: 'LoRA (2021)',
    number: '~10M params',
    subtitle: 'low-rank matrix adapters',
    desc: 'Freeze the whole model. Insert two tiny matrices (A × B) beside each layer. Only train those. Revolutionary — but still classical.',
  },
  {
    color: 'text-purple-300',
    accent: 'text-amber-400',
    bg: 'bg-purple-950/40 border-purple-800/50',
    icon: '⚛️',
    label: 'Quantum Adapter (2026)',
    number: '6,144 params',
    subtitle: 'on a real IBM quantum processor',
    desc: 'Replace the classical matrices with 2-qubit quantum circuit blocks. The Cayley parameterisation guarantees perfect mathematical structure — with a fraction of the parameters.',
  },
  {
    color: 'text-amber-300',
    accent: 'text-amber-400',
    bg: 'bg-amber-950/40 border-amber-800/50',
    icon: '🏆',
    label: 'The result',
    number: '2,730×',
    subtitle: 'fewer parameters than LoRA',
    desc: 'Llama 3.1 8B perplexity improved by 1.43%. Questions the base model got wrong — answered correctly. Validated on real quantum hardware.',
  },
]

export default function AdapterStory() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="relative bg-gray-950 border-b border-gray-800 py-8 px-6"
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-colors"
          aria-label="Dismiss story"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-5 font-medium">The story so far</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`relative rounded-xl border p-5 ${s.bg}`}
              >
                {i < steps.length - 1 && (
                  <ChevronRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 z-10" />
                )}
                <div className="text-2xl mb-3">{s.icon}</div>
                <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${s.accent}`}>{s.label}</div>
                <div className={`text-3xl font-bold tabular-nums mb-0.5 ${s.color}`}>{s.number}</div>
                <div className="text-xs text-gray-500 mb-3">{s.subtitle}</div>
                <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </AnimatePresence>
  )
}
