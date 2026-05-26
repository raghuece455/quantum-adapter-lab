import { Github, Atom, AlertTriangle } from 'lucide-react'

export default function Header() {
  return (
    <header className="border-b border-gray-800 bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 py-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-900/60 border border-purple-600/40 flex items-center justify-center">
              <Atom className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Quantum Adapter Lab</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                How quantum circuit blocks fine-tune LLMs with{' '}
                <span className="text-amber-400 font-semibold">2,730×</span> fewer parameters than LoRA
              </p>
            </div>
          </div>
          <a
            href="https://github.com/raghuece455"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm text-gray-300 transition-colors"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
        </div>

        {/* Paper badge */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-900/30 border border-amber-600/40 text-xs text-amber-300">
            📄 Based on IBM Research · arXiv:2605.05914 · May 2026
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-900/30 border border-purple-600/40 text-xs text-purple-300">
            Multiverse Computing &amp; University of Navarra
          </span>
        </div>

        {/* Disclaimer */}
        <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-950/40 border border-amber-800/40">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200/80">
            <span className="font-semibold text-amber-300">Educational simulation:</span>{' '}
            This demo simulates 2-qubit quantum circuits using classical NumPy math.
            The actual IBM experiment ran on a{' '}
            <span className="font-semibold">156-qubit IBM Quantum System Two</span> processor.
            No quantum computer is required to run this demo.
          </p>
        </div>
      </div>
    </header>
  )
}
