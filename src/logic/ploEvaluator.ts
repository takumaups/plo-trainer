import type { Card, HandResult } from '../types'
import { combinations } from './deck'
import { evaluate5, compareHands } from './handEvaluator'

export function bestPLOHand(holeCards: Card[], board: Card[]): HandResult {
  const holePairs = combinations(holeCards, 2)
  const boardTriples = combinations(board, 3)
  let best: HandResult | null = null

  for (const pair of holePairs) {
    for (const triple of boardTriples) {
      const result = evaluate5([...pair, ...triple])
      result.usedHole = pair
      result.usedBoard = triple
      if (!best || compareHands(result, best) > 0) {
        best = result
      }
    }
  }
  return best!
}

export function determineWinners(
  hands: Card[][],
  board: Card[]
): { winners: number[]; bestResults: HandResult[] } {
  const bestResults = hands.map(h => bestPLOHand(h, board))
  let best = bestResults[0]

  // 最強のHandResultを探す
  for (const r of bestResults) {
    if (compareHands(r, best) > 0) best = r
  }

  // 同点プレイヤーを全て勝者とする
  const winners = bestResults
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => compareHands(r, best) === 0)
    .map(({ i }) => i)

  return { winners, bestResults }
}

// 難易度フィルタ用：スコア差を計算
export function handScoreDiff(results: HandResult[]): number {
  if (results.length < 2) return 999
  const sorted = [...results].sort((a,b) => compareHands(b,a))
  // rank差 * 100 + tiebreaker[0]差
  const rankDiff = (sorted[0].rank - sorted[1].rank) * 100
  const tbDiff = (sorted[0].tiebreakers[0] ?? 0) - (sorted[1].tiebreakers[0] ?? 0)
  return rankDiff + tbDiff
}
