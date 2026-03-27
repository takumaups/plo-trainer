export type Suit = '♠' | '♥' | '♦' | '♣'
export type Rank = '2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'T'|'J'|'Q'|'K'|'A'

export interface Card {
  rank: Rank
  suit: Suit
}

export type HandRankValue = 0|1|2|3|4|5|6|7|8
// 0=ハイカード 1=ワンペア 2=ツーペア 3=スリーカード
// 4=ストレート 5=フラッシュ 6=フルハウス 7=フォーカード 8=ストレートフラッシュ

export interface HandResult {
  rank: HandRankValue
  tiebreakers: number[]
  description: string   // 例: "ロイヤルストレートフラッシュ"
  usedHole: Card[]      // 使用したホールカード2枚
  usedBoard: Card[]     // 使用したボードカード3枚
}

export type GameMode = 'time' | 'endless' | 'survive'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'oni'
export type Street = 'preflop' | 'postflop'

// Qualify
export interface QGameResult {
  questionNum: number
  board: Card[]
  hands: Card[][]
  correctWinners: number[]   // 勝者プレイヤーのindex配列（チョップ対応）
  selectedWinners: number[]
  correctHand: string
  selectedHand: string
  isWinnerCorrect: boolean
  isHandCorrect: boolean
  isChop: boolean
}

// Pot Calc
export interface PotQuestion {
  blind: [number, number]    // [sb, bb]
  bbAnte: number             // 0ならアンティなし
  street: Street
  potSize: number            // フロップ以降の場合のPot額（プリフロは0）
  sequence: ActionStep[]     // アクションの連鎖
}

export interface ActionStep {
  stepNum: number
  description: string        // 表示用の問題文
  correctAmount: number      // 正解額
  userAnswer: number | null
  hint2x: string             // 2倍その他の解説
  hint3x: string             // 3倍その他の解説
  tips: string[]             // コツ
}

export interface PCalcGameResult {
  question: PotQuestion
  steps: ActionStep[]
  allCorrect: boolean
}

export interface SessionStats {
  qualify: { correct: number; total: number; results: QGameResult[] }
  potCalc: { correct: number; total: number; results: PCalcGameResult[] }
}
