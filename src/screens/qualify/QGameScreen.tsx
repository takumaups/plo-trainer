import { useState, useEffect } from 'react'
import type { Card as CardType, GameMode, Difficulty, QGameResult, HandResult } from '../../types'
import { createDeck, shuffle } from '../../logic/deck'
import { determineWinners, handScoreDiff } from '../../logic/ploEvaluator'
import Card from '../../components/Card'
import GoldBtn from '../../components/GoldBtn'
import Panel from '../../components/Panel'

interface QGameScreenProps {
  mode: GameMode
  timeLimit?: number
  playerCount: number
  difficulty: Difficulty
  onFinish: (results: QGameResult[]) => void
}

type Phase = 'selectWinner' | 'selectHand' | 'feedback'

const HAND_NAMES = [
  'ハイカード',
  'ワンペア',
  'ツーペア',
  'スリーカード',
  'ストレート',
  'フラッシュ',
  'フルハウス',
  'フォーカード',
  'ストレートフラッシュ',
  'ロイヤルストレートフラッシュ'
]

export default function QGameScreen({
  mode,
  timeLimit,
  playerCount,
  difficulty,
  onFinish
}: QGameScreenProps) {
  const [board, setBoard] = useState<CardType[]>([])
  const [hands, setHands] = useState<CardType[][]>([])
  const [correctWinners, setCorrectWinners] = useState<number[]>([])
  const [bestResults, setBestResults] = useState<HandResult[]>([])
  const [selectedWinners, setSelectedWinners] = useState<number[]>([])
  const [selectedHand, setSelectedHand] = useState<string>('')
  const [phase, setPhase] = useState<Phase>('selectWinner')
  const [results, setResults] = useState<QGameResult[]>([])
  const [questionNum, setQuestionNum] = useState(1)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit || 0)
  const [gameOver, setGameOver] = useState(false)

  // 問題生成
  const generateQuestion = () => {
    let attempts = 0
    const maxAttempts = 100

    while (attempts < maxAttempts) {
      const deck = shuffle(createDeck())
      const newBoard = deck.slice(0, 5)
      const newHands: CardType[][] = []
      let idx = 5

      for (let i = 0; i < playerCount; i++) {
        newHands.push(deck.slice(idx, idx + 4))
        idx += 4
      }

      const { winners, bestResults: bResults } = determineWinners(newHands, newBoard)
      const diff = handScoreDiff(bResults)

      // 難易度フィルタ
      const threshold =
        difficulty === 'beginner' ? 200 :
        difficulty === 'intermediate' ? 50 : 0

      if (diff >= threshold) {
        setBoard(newBoard)
        setHands(newHands)
        setCorrectWinners(winners)
        setBestResults(bResults)
        setSelectedWinners([])
        setSelectedHand('')
        setPhase('selectWinner')
        return
      }

      attempts++
    }

    // フォールバック（フィルタなし）
    const deck = shuffle(createDeck())
    const newBoard = deck.slice(0, 5)
    const newHands: CardType[][] = []
    let idx = 5

    for (let i = 0; i < playerCount; i++) {
      newHands.push(deck.slice(idx, idx + 4))
      idx += 4
    }

    const { winners, bestResults: bResults } = determineWinners(newHands, newBoard)
    setBoard(newBoard)
    setHands(newHands)
    setCorrectWinners(winners)
    setBestResults(bResults)
    setSelectedWinners([])
    setSelectedHand('')
    setPhase('selectWinner')
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

  const handleWinnerSelect = (idx: number) => {
    if (phase !== 'selectWinner') return
    if (selectedWinners.includes(idx)) {
      setSelectedWinners(selectedWinners.filter((i) => i !== idx))
    } else {
      setSelectedWinners([...selectedWinners, idx])
    }
  }

  const handleSubmitWinner = () => {
    if (selectedWinners.length === 0) return
    setPhase('selectHand')
  }

  const handleHandSelect = (handName: string) => {
    setSelectedHand(handName)
  }

  const handleSubmitHand = () => {
    if (!selectedHand) return

    const correctHand = bestResults[correctWinners[0]].description
    const isWinnerCorrect =
      selectedWinners.length === correctWinners.length &&
      selectedWinners.every((w) => correctWinners.includes(w))
    const isHandCorrect = selectedHand === correctHand
    const isChop = correctWinners.length > 1

    const result: QGameResult = {
      questionNum,
      board,
      hands,
      correctWinners,
      selectedWinners,
      correctHand,
      selectedHand,
      isWinnerCorrect,
      isHandCorrect,
      isChop,
    }

    setResults([...results, result])
    setPhase('feedback')

    // サバイバルモードで不正解なら終了
    if (mode === 'survive' && (!isWinnerCorrect || !isHandCorrect)) {
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

  return (
    <div className="min-h-screen p-6 pb-20">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm" style={{ color: 'var(--text-dim)' }}>
          問題 {questionNum}
        </div>
        {mode === 'time' && (
          <div className="text-xl font-bold" style={{ color: timeRemaining < 10 ? 'var(--red)' : 'var(--gold)' }}>
            {timeRemaining}秒
          </div>
        )}
        {mode === 'endless' && (
          <button onClick={handleQuit} className="text-sm" style={{ color: 'var(--gold)' }}>
            やめる
          </button>
        )}
      </div>

      {/* ボード */}
      <Panel className="mb-4">
        <div className="text-sm mb-2" style={{ color: 'var(--text-dim)' }}>
          ボード
        </div>
        <div className="flex gap-2 justify-center">
          {board.map((card, idx) => (
            <Card key={idx} card={card} size="md" />
          ))}
        </div>
      </Panel>

      {/* プレイヤーハンド */}
      <div className="space-y-2 mb-4">
        {hands.map((hand, idx) => (
          <button
            key={idx}
            onClick={() => handleWinnerSelect(idx)}
            className="w-full p-3 rounded transition-all active:scale-98"
            style={{
              background: selectedWinners.includes(idx) ? 'var(--gold)' : 'var(--surface)',
              border: phase === 'feedback' && correctWinners.includes(idx) ? '2px solid var(--correct)' : '1px solid var(--border)',
              opacity: phase === 'selectWinner' ? 1 : 0.6,
              minHeight: '60px',
            }}
            disabled={phase !== 'selectWinner'}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold" style={{ color: selectedWinners.includes(idx) ? '#111' : 'var(--text)' }}>
                Player {idx + 1}
              </div>
              <div className="flex gap-1.5">
                {hand.map((card, cardIdx) => (
                  <Card key={cardIdx} card={card} size="sm" />
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* フェーズ別UI */}
      {phase === 'selectWinner' && (
        <GoldBtn fullWidth onClick={handleSubmitWinner} disabled={selectedWinners.length === 0}>
          回答する
        </GoldBtn>
      )}

      {phase === 'selectHand' && (
        <Panel>
          <h3 className="text-lg mb-3 text-center" style={{ color: 'var(--gold)' }}>
            役を選択してください
          </h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {HAND_NAMES.map((name) => (
              <button
                key={name}
                onClick={() => handleHandSelect(name)}
                className="py-2 px-3 rounded text-sm transition-all active:scale-95"
                style={{
                  background: selectedHand === name ? 'var(--gold)' : 'var(--surface)',
                  color: selectedHand === name ? '#111' : 'var(--text)',
                  border: '1px solid var(--border)',
                  minHeight: '44px',
                }}
              >
                {name}
              </button>
            ))}
          </div>
          <GoldBtn fullWidth onClick={handleSubmitHand} disabled={!selectedHand}>
            決定
          </GoldBtn>
        </Panel>
      )}

      {phase === 'feedback' && (
        <Panel>
          <div className="text-center mb-4">
            <div className="text-2xl mb-2" style={{ color: 'var(--gold)' }}>
              {results[results.length - 1].isWinnerCorrect && results[results.length - 1].isHandCorrect
                ? '正解！'
                : results[results.length - 1].isChop && selectedWinners.length > 0 && selectedWinners.some(w => correctWinners.includes(w))
                ? '惜しい！'
                : '不正解'}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-dim)' }}>
              勝者: Player {correctWinners.map((w) => w + 1).join(', ')}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-dim)' }}>
              役: {bestResults[correctWinners[0]].description}
            </div>
          </div>
          <div className="mb-4 p-3 rounded" style={{ background: 'var(--bg-light)' }}>
            <div className="text-xs mb-2" style={{ color: 'var(--text-dim)' }}>
              使用したカード
            </div>
            <div className="flex gap-1.5 justify-center mb-2">
              {bestResults[correctWinners[0]].usedHole.map((card, idx) => (
                <Card key={idx} card={card} size="sm" />
              ))}
            </div>
            <div className="flex gap-1.5 justify-center">
              {bestResults[correctWinners[0]].usedBoard.map((card, idx) => (
                <Card key={idx} card={card} size="sm" />
              ))}
            </div>
          </div>
          {mode !== 'survive' || (results[results.length - 1].isWinnerCorrect && results[results.length - 1].isHandCorrect) ? (
            <GoldBtn fullWidth onClick={handleNext}>
              次の問題
            </GoldBtn>
          ) : null}
        </Panel>
      )}
    </div>
  )
}
