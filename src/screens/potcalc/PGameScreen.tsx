import { useState, useEffect } from 'react'
import type { GameMode, Difficulty, Street, PotQuestion, PCalcGameResult, ActionStep } from '../../types'
import { generatePotQuestion } from '../../logic/potCalculator'
import PokerTable from '../../components/PokerTable'
import GoldBtn from '../../components/GoldBtn'
import Panel from '../../components/Panel'

interface PGameScreenProps {
  mode: GameMode
  timeLimit?: number
  settings: {
    playerCount: number
    blinds: [number, number][]
    bbAnte: boolean
    streets: Street[]
    difficulty: Difficulty
  }
  onFinish: (results: PCalcGameResult[]) => void
}

type Phase = 'answering' | 'feedback'
type FeedbackTab = 'calculation' | 'memorization' | 'speed'

export default function PGameScreen({ mode, timeLimit, settings, onFinish }: PGameScreenProps) {
  const [question, setQuestion] = useState<PotQuestion | null>(null)
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([])
  const [phase, setPhase] = useState<Phase>('answering')
  const [feedbackTab, setFeedbackTab] = useState<FeedbackTab>('calculation')
  const [results, setResults] = useState<PCalcGameResult[]>([])
  const [questionNum, setQuestionNum] = useState(1)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit || 0)
  const [gameOver, setGameOver] = useState(false)

  const generateQuestion = () => {
    const q = generatePotQuestion(
      settings.playerCount,
      settings.blinds,
      settings.bbAnte,
      settings.streets,
      settings.difficulty
    )
    setQuestion(q)
    setUserAnswers(new Array(q.sequence.length).fill(null))
    setPhase('answering')
    setFeedbackTab('calculation')
  }

  useEffect(() => {
    generateQuestion()
  }, [])

  // タイマー
  useEffect(() => {
    if (mode === 'time' && timeRemaining > 0 && !gameOver) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (mode === 'time' && timeRemaining === 0 && !gameOver) {
      setGameOver(true)
      onFinish(results)
    }
  }, [timeRemaining, mode, gameOver])

  const handleAnswerChange = (idx: number, value: string) => {
    const num = value === '' ? null : parseInt(value, 10)
    const newAnswers = [...userAnswers]
    newAnswers[idx] = num
    setUserAnswers(newAnswers)
  }

  const handleSubmit = () => {
    if (!question) return
    if (userAnswers.some((a) => a === null)) return

    const steps: ActionStep[] = question.sequence.map((step, idx) => ({
      ...step,
      userAnswer: userAnswers[idx],
    }))

    const allCorrect = steps.every((step) => step.userAnswer === step.correctAmount)

    const result: PCalcGameResult = {
      question,
      steps,
      allCorrect,
    }

    setResults([...results, result])
    setPhase('feedback')

    // サバイバルモードで不正解なら終了
    if (mode === 'survive' && !allCorrect) {
      setTimeout(() => {
        setGameOver(true)
        onFinish([...results, result])
      }, 2000)
    }
  }

  const handleNext = () => {
    setQuestionNum(questionNum + 1)
    generateQuestion()
  }

  const handleQuit = () => {
    setGameOver(true)
    onFinish(results)
  }

  if (gameOver) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Panel>
          <h2 className="text-2xl mb-4 text-center" style={{ color: 'var(--gold)' }}>
            終了
          </h2>
          <p className="text-center">結果を表示します...</p>
        </Panel>
      </div>
    )
  }

  if (!question) {
    return <div className="min-h-screen p-6">読み込み中...</div>
  }

  return (
    <div className="min-h-screen p-6 pb-20">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm" style={{ color: 'var(--text-dim)' }}>
          問題 {questionNum}
        </div>
        {mode === 'time' && (
          <div
            className="text-xl font-bold"
            style={{ color: timeRemaining < 10 ? 'var(--red)' : 'var(--gold)' }}
          >
            {timeRemaining}秒
          </div>
        )}
        {mode === 'endless' && (
          <button onClick={handleQuit} className="text-sm" style={{ color: 'var(--gold)' }}>
            やめる
          </button>
        )}
      </div>

      {/* 状況表示 */}
      <Panel className="mb-4">
        <div className="text-sm space-y-1">
          <div>
            <span style={{ color: 'var(--text-dim)' }}>ブラインド: </span>
            {question.blind[0]}/{question.blind[1]}
          </div>
          {question.bbAnte > 0 && (
            <div>
              <span style={{ color: 'var(--text-dim)' }}>BBAnte: </span>
              {question.bbAnte}
            </div>
          )}
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Street: </span>
            {question.street === 'preflop' ? 'プリフロ' : 'フロップ以降'}
          </div>
          {question.street === 'postflop' && (
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Pot: </span>
              {question.potSize}
            </div>
          )}
        </div>
      </Panel>

      {/* テーブル */}
      <div className="mb-4">
        <PokerTable playerCount={settings.playerCount} />
      </div>

      {/* 問題 */}
      {phase === 'answering' && (
        <div className="space-y-4 mb-4">
          {question.sequence.map((step, idx) => (
            <Panel key={idx}>
              <div className="text-sm mb-2" style={{ color: 'var(--text-dim)' }}>
                ステップ {step.stepNum}
              </div>
              <div className="mb-3">{step.description}</div>
              <input
                type="number"
                value={userAnswers[idx] === null ? '' : userAnswers[idx]!}
                onChange={(e) => handleAnswerChange(idx, e.target.value)}
                placeholder="回答を入力"
                className="w-full py-2 px-3 rounded"
                style={{
                  background: 'var(--bg-light)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  minHeight: '44px',
                  fontSize: '16px',
                }}
              />
            </Panel>
          ))}
        </div>
      )}

      {phase === 'answering' && (
        <GoldBtn
          fullWidth
          onClick={handleSubmit}
          disabled={userAnswers.some((a) => a === null)}
        >
          回答する
        </GoldBtn>
      )}

      {/* フィードバック */}
      {phase === 'feedback' && (
        <div className="space-y-4">
          <Panel>
            <div className="text-center mb-4">
              <div className="text-2xl mb-2" style={{ color: 'var(--gold)' }}>
                {results[results.length - 1].allCorrect ? '正解！' : '不正解'}
              </div>
            </div>

            {/* タブ */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setFeedbackTab('calculation')}
                className="flex-1 py-2 rounded text-sm transition-all active:scale-95"
                style={{
                  background:
                    feedbackTab === 'calculation' ? 'var(--gold)' : 'var(--surface)',
                  color: feedbackTab === 'calculation' ? '#111' : 'var(--text)',
                  minHeight: '40px',
                }}
              >
                計算方法
              </button>
              <button
                onClick={() => setFeedbackTab('memorization')}
                className="flex-1 py-2 rounded text-sm transition-all active:scale-95"
                style={{
                  background:
                    feedbackTab === 'memorization' ? 'var(--gold)' : 'var(--surface)',
                  color: feedbackTab === 'memorization' ? '#111' : 'var(--text)',
                  minHeight: '40px',
                }}
              >
                暗記のコツ
              </button>
              <button
                onClick={() => setFeedbackTab('speed')}
                className="flex-1 py-2 rounded text-sm transition-all active:scale-95"
                style={{
                  background: feedbackTab === 'speed' ? 'var(--gold)' : 'var(--surface)',
                  color: feedbackTab === 'speed' ? '#111' : 'var(--text)',
                  minHeight: '40px',
                }}
              >
                速算
              </button>
            </div>

            {/* タブコンテンツ */}
            <div className="space-y-3">
              {results[results.length - 1].steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded"
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
                  <div className="text-sm mb-2" style={{ color: 'var(--text-dim)' }}>
                    ステップ {step.stepNum}: {step.description}
                  </div>
                  <div className="text-sm mb-2">
                    <span style={{ color: 'var(--correct)' }}>正解: {step.correctAmount}</span>
                    {step.userAnswer !== step.correctAmount && (
                      <span style={{ color: 'var(--incorrect)' }}>
                        {' '}
                        / あなた: {step.userAnswer}
                      </span>
                    )}
                  </div>

                  {feedbackTab === 'calculation' && (
                    <div className="text-xs space-y-1" style={{ color: 'var(--text-dim)' }}>
                      <div>2倍その他: {step.hint2x}</div>
                      <div>3倍その他: {step.hint3x}</div>
                    </div>
                  )}

                  {feedbackTab === 'memorization' && step.tips.length > 0 && (
                    <div className="text-xs space-y-1" style={{ color: 'var(--text-dim)' }}>
                      {step.tips.map((tip, tipIdx) => (
                        <div key={tipIdx}>• {tip}</div>
                      ))}
                    </div>
                  )}

                  {feedbackTab === 'speed' && (
                    <div className="text-xs space-y-1" style={{ color: 'var(--text-dim)' }}>
                      <div>• 位ごとに分解して計算</div>
                      <div>• X×3 = X×2 + X で計算</div>
                      <div>• キリのいい数で丸めて引く</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Panel>

          {(mode !== 'survive' || results[results.length - 1].allCorrect) && (
            <GoldBtn fullWidth onClick={handleNext}>
              次の問題
            </GoldBtn>
          )}
        </div>
      )}
    </div>
  )
}
