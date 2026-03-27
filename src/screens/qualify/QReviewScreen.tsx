import type { QGameResult } from '../../types'
import Card from '../../components/Card'
import GoldBtn from '../../components/GoldBtn'
import Panel from '../../components/Panel'

interface QReviewScreenProps {
  results: QGameResult[]
  onHome: () => void
}

export default function QReviewScreen({ results, onHome }: QReviewScreenProps) {
  const correctCount = results.filter((r) => r.isWinnerCorrect && r.isHandCorrect).length
  const totalCount = results.length
  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0

  const incorrectResults = results.filter((r) => !r.isWinnerCorrect || !r.isHandCorrect)

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
                <div className="text-sm mb-2" style={{ color: 'var(--text-dim)' }}>
                  問題 {result.questionNum}
                </div>

                {/* ボード */}
                <div className="mb-3">
                  <div className="text-xs mb-1" style={{ color: 'var(--text-dim)' }}>
                    ボード
                  </div>
                  <div className="flex gap-1.5">
                    {result.board.map((card, cardIdx) => (
                      <Card key={cardIdx} card={card} size="sm" />
                    ))}
                  </div>
                </div>

                {/* プレイヤーハンド */}
                <div className="space-y-1 mb-3">
                  {result.hands.map((hand, handIdx) => (
                    <div key={handIdx} className="flex items-center gap-2">
                      <div
                        className="text-xs w-16"
                        style={{
                          color: result.correctWinners.includes(handIdx)
                            ? 'var(--correct)'
                            : 'var(--text-dim)',
                        }}
                      >
                        Player {handIdx + 1}
                        {result.correctWinners.includes(handIdx) && ' ✓'}
                      </div>
                      <div className="flex gap-1.5">
                        {hand.map((card, cardIdx) => (
                          <Card key={cardIdx} card={card} size="sm" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 正解 */}
                <div
                  className="text-sm p-2 rounded"
                  style={{ background: 'var(--bg-light)' }}
                >
                  <div style={{ color: 'var(--correct)' }}>
                    正解: Player {result.correctWinners.map((w) => w + 1).join(', ')}
                  </div>
                  <div style={{ color: 'var(--correct)' }}>
                    役: {result.correctHand}
                  </div>
                  {!result.isWinnerCorrect && (
                    <div style={{ color: 'var(--incorrect)' }}>
                      あなたの回答: Player {result.selectedWinners.map((w) => w + 1).join(', ')}
                    </div>
                  )}
                  {!result.isHandCorrect && (
                    <div style={{ color: 'var(--incorrect)' }}>
                      あなたの回答: {result.selectedHand}
                    </div>
                  )}
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
