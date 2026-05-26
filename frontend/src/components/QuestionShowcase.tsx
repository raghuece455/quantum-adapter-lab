import { CheckCircle, XCircle } from 'lucide-react'
import Card from './ui/Card'
import Badge from './ui/Badge'

const QUESTIONS = [
  {
    category: 'Astronomy · MMLU benchmark',
    question: 'Which planets in our solar system have rings?',
    base_answer: 'Saturn',
    quantum_answer: 'Saturn, Jupiter, Uranus, and Neptune',
    explanation: 'The base model only recalled Saturn — the most famous ringed planet. The quantum-enhanced model correctly identified all four ring systems.',
  },
  {
    category: 'College Biology · MMLU benchmark',
    question: 'What is the primary effect of gene flow between populations?',
    base_answer: 'Maintains Hardy-Weinberg equilibrium',
    quantum_answer: 'Leads to genetic homogeneity between populations',
    explanation: 'The base model confused gene flow with Hardy-Weinberg conditions. The enhanced model correctly identified genetic homogenisation as the primary effect.',
  },
]

export default function QuestionShowcase() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Questions the Quantum Model Got Right</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          From Table 1 of arXiv:2605.05914 — validated on a real 156-qubit IBM quantum processor
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {QUESTIONS.map((q, i) => (
          <Card key={i} quantumBorder>
            <div className="flex items-start justify-between gap-2 mb-4">
              <Badge variant="paper">{q.category}</Badge>
            </div>

            <p className="text-sm font-medium text-gray-100 mb-4 leading-relaxed">"{q.question}"</p>

            <div className="space-y-3">
              {/* Base model */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-950/30 border border-red-800/40">
                <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-red-400 font-medium mb-0.5">Base model (Llama 3.1 8B)</div>
                  <div className="text-sm text-red-200">"{q.base_answer}"</div>
                </div>
              </div>

              {/* Quantum model */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-950/30 border border-green-700/40">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-green-400 font-medium mb-0.5">Quantum-enhanced (6,144 params added)</div>
                  <div className="text-sm text-green-200">"{q.quantum_answer}"</div>
                </div>
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-500 leading-relaxed">{q.explanation}</p>
          </Card>
        ))}
      </div>

      <div className="px-4 py-3 rounded-lg bg-gray-900 border border-gray-800">
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="text-gray-400 font-medium">Not cherry-picked.</span>{' '}
          These examples come from structured MMLU benchmark evaluation on the IBM{' '}
          <span className="font-mono text-gray-300">ibm_basquecountry</span> processor.
          The improvement was measured using perplexity (PPL) on WikiText, LAMBADA, BoolQ, HellaSwag, MMLU, and TriviaQA.
        </p>
      </div>
    </section>
  )
}
