import type { PCalcGameResult } from '../../types'
import GoldBtn from '../../components/GoldBtn'
import Panel from '../../components/Panel'

interface PReviewScreenProps {
  results: PCalcGameResult[]
  onHome: () => void
}

export default function PReviewScreen({ results, onHome }: PReviewScreenProps) {
  const correctCount = results.filter((r) => r.allCorrect).length
  const totalCount = results.length
  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0

  const incorrectResults = results.filter((r) => !r.allCorrect)

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl mb-6 text-center" style={{ color: 'var(--gold)' }}>
        結果
      </h1>

      <Panel className="mb-6">
        <div className="text-center">
          <div className="text-5xl font-bold mb-2" style={{ color: 'var(--gold)' }}>
            {percentage}%
          </div>
          <div className="text-lg" style={{ color: 'var(--text-dim)' }}>
            {correctCount} / {totalCount} 問正解
          </div>
        </div>
      </Panel>

      {incorrectResults.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl mb-4" style={{ color: 'var(--gold)' }}>
            間違えた問題
          </h2>
          <div className="space-y-4">
            {incorrectResults.map((result, idx) => (
              <Panel key={idx}>
                <div className="text-sm mb-3" style={{ color: 'var(--text-dim)' }}>
                  問題 {idx + 1}
                </div>

                <div className="text-xs mb-3 space-y-1" style={{ color: 'var(--text-dim)' }}>
                  <div>ブラインド: {result.question.blind[0]}/{result.question.blind[1]}</div>
                  {result.question.bbAnte > 0 && <div>BBAnte: {result.question.bbAnte}</div>}
                  <div>
                    Street: {result.question.street === 'preflop' ? 'プリフロ' : 'フロップ以降'}
                  </div>
                  {result.question.street === 'postflop' && (
                    <div>Pot: {result.question.potSize}</div>
                  )}
                </div>

                <div className="space-y-2">
                  {result.steps.map((step, stepIdx) => (
                    <div
                      key={stepIdx}
                      className="p-2 rounded text-sm"
                      style={{
                        background:
                          step.userAnswer === step.correctAmount
                            ? 'rgba(76, 175, 118, 0.1)'
                            : 'rgba(204, 68, 68, 0.1)',
                        border: `1px solid ${
                          step.userAnswer === step.correctAmount
                            ? 'var(--correct)'
                            : 'var(--incorrect)'
                        }`,
                      }}
                    >
                      <div className="mb-1">{step.description}</div>
                      <div className="text-xs">
                        <span style={{ color: 'var(--correct)' }}>
                          正解: {step.correctAmount}
                        </span>
                        {step.userAnswer !== step.correctAmount && (
                          <span style={{ color: 'var(--incorrect)' }}>
                            {' '}
                            / あなた: {step.userAnswer}
                          </span>
                        )}
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
                        <div>2倍: {step.hint2x}</div>
                        <div>3倍: {step.hint3x}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            ))}
          </div>
        </div>
      )}

      <GoldBtn fullWidth onClick={onHome}>
        ホームに戻る
      </GoldBtn>
    </div>
  )
}
