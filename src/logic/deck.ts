import type { Card, Rank, Suit } from '../types'

const RANKS: Rank[] = ['2','3','4','5','6','7','8','9','T','J','Q','K','A']
const SUITS: Suit[] = ['♠','♥','♦','♣']

export function createDeck(): Card[] {
  return SUITS.flatMap(suit => RANKS.map(rank => ({ rank, suit })))
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function rankToNum(rank: Rank): number {
  const map: Record<Rank, number> = {
    '2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,
    '9':9,'T':10,'J':11,'Q':12,'K':13,'A':14
  }
  return map[rank]
}

export function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]]
  if (arr.length < k) return []
  const [first, ...rest] = arr
  const withFirst = combinations(rest, k - 1).map(c => [first, ...c])
  const withoutFirst = combinations(rest, k)
  return [...withFirst, ...withoutFirst]
}
