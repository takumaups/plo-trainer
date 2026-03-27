import type { Card, HandResult } from '../types'
import { rankToNum } from './deck'

export function evaluate5(cards: Card[]): HandResult {
  const nums = cards.map(c => rankToNum(c.rank)).sort((a,b) => b-a)
  const suits = cards.map(c => c.suit)
  const isFlush = suits.every(s => s === suits[0])

  // ストレート判定（ホイール対応）
  function getStraightHigh(ns: number[]): number | null {
    const uniq = [...new Set(ns)].sort((a,b) => b-a)
    if (uniq.length < 5) return null
    if (uniq[0] - uniq[4] === 4) return uniq[0]
    // ホイール: A2345
    if (uniq[0]===14 && uniq[1]===5 && uniq[2]===4 && uniq[3]===3 && uniq[4]===2) return 5
    return null
  }

  const straightHigh = getStraightHigh(nums)
  const isStraight = straightHigh !== null

  // 同ランクのグループ
  const rankCount: Record<number, number> = {}
  nums.forEach(n => { rankCount[n] = (rankCount[n] || 0) + 1 })
  const groups = Object.entries(rankCount)
    .map(([r, c]) => ({ rank: Number(r), count: c }))
    .sort((a,b) => b.count - a.count || b.rank - a.rank)

  const counts = groups.map(g => g.count)

  // ストレートフラッシュ
  if (isFlush && isStraight) {
    const isRoyal = straightHigh === 14
    return {
      rank: 8,
      tiebreakers: [straightHigh!],
      description: isRoyal ? 'ロイヤルストレートフラッシュ' : 'ストレートフラッシュ',
      usedHole: [], usedBoard: [],
    }
  }
  // フォーカード
  if (counts[0] === 4) {
    return { rank: 7, tiebreakers: [groups[0].rank, groups[1].rank], description: 'フォーカード', usedHole: [], usedBoard: [] }
  }
  // フルハウス
  if (counts[0] === 3 && counts[1] === 2) {
    return { rank: 6, tiebreakers: [groups[0].rank, groups[1].rank], description: 'フルハウス', usedHole: [], usedBoard: [] }
  }
  // フラッシュ
  if (isFlush) {
    return { rank: 5, tiebreakers: nums, description: 'フラッシュ', usedHole: [], usedBoard: [] }
  }
  // ストレート
  if (isStraight) {
    return { rank: 4, tiebreakers: [straightHigh!], description: 'ストレート', usedHole: [], usedBoard: [] }
  }
  // スリーカード
  if (counts[0] === 3) {
    return { rank: 3, tiebreakers: [groups[0].rank, ...groups.slice(1).map(g=>g.rank)], description: 'スリーカード', usedHole: [], usedBoard: [] }
  }
  // ツーペア
  if (counts[0] === 2 && counts[1] === 2) {
    return { rank: 2, tiebreakers: [groups[0].rank, groups[1].rank, groups[2].rank], description: 'ツーペア', usedHole: [], usedBoard: [] }
  }
  // ワンペア
  if (counts[0] === 2) {
    return { rank: 1, tiebreakers: groups.map(g=>g.rank), description: 'ワンペア', usedHole: [], usedBoard: [] }
  }
  // ハイカード
  return { rank: 0, tiebreakers: nums, description: 'ハイカード', usedHole: [], usedBoard: [] }
}

export function compareHands(a: HandResult, b: HandResult): number {
  if (a.rank !== b.rank) return a.rank - b.rank
  for (let i = 0; i < Math.max(a.tiebreakers.length, b.tiebreakers.length); i++) {
    const diff = (a.tiebreakers[i] ?? 0) - (b.tiebreakers[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}
