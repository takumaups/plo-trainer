import type { PotQuestion, ActionStep, Difficulty, Street } from '../types'

export function potRaise(
  callAmount: number,
  lastBetAmount: number,
  tableTotal: number,
  alreadyIn: number = 0
): number {
  const callNeeded = callAmount - alreadyIn
  const potRaiseAmount = lastBetAmount + tableTotal
  return callNeeded + potRaiseAmount
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 重複なしに n 個ランダム選択
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

const STREETS_POST = ['フロップ', 'ターン', 'リバー']
const OPEN_POSITIONS = ['UTG', 'HJ', 'CO', 'BTN']
const ALL_POSITIONS = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB']

// ------- 初級 -------

function beginnerPreflop(sb: number, bb: number): ActionStep[] {
  const raiser = pick(OPEN_POSITIONS)
  const pot = sb + bb
  const amount = potRaise(bb, bb, pot, 0)
  return [{
    stepNum: 1,
    description: `${raiser}がポットベット（オープンレイズ）します。レイズ額は？`,
    correctAmount: amount,
    userAnswer: null,
    hint2x: `コール額(${bb}) × 2 + 自分を除いたPot(${sb}) = ${amount}`,
    hint3x: `BB(${bb}) × 3 + SB(${sb}) = ${amount}`,
    tips: [
      sb === bb / 2
        ? `SB=0.5BBの場合: Make = BB × 3.5 = ${bb * 3.5}`
        : `SB≠0.5BBの場合: Make = BB × 3 + SB = ${bb * 3 + sb}`,
    ],
  }]
}

function beginnerPostflop(bb: number, bbAnteAmount: number): { steps: ActionStep[]; potSize: number } {
  const street = pick(STREETS_POST)
  const potSize = bb * randInt(3, 8) + bbAnteAmount
  const bettor = pick(ALL_POSITIONS)
  return {
    potSize,
    steps: [{
      stepNum: 1,
      description: `${street}（Pot: ${potSize}）。${bettor}がポットベットします。ベット額は？`,
      correctAmount: potSize,
      userAnswer: null,
      hint2x: `Pot(${potSize}) = ${potSize}`,
      hint3x: `Pot(${potSize}) = ${potSize}`,
      tips: ['ポストフロップのポットベット = Pot', 'ポットレイズ = ベット × 3 + Pot'],
    }],
  }
}

// ------- 中級 -------

function intermediatePreflop(sb: number, bb: number): ActionStep[] {
  const pot = sb + bb
  const raiser = pick(OPEN_POSITIONS)
  const open = potRaise(bb, bb, pot, 0)

  // コーラーはraiser以外のEP/MPポジションからランダムに1〜2人
  const callerPool = OPEN_POSITIONS.filter(p => p !== raiser)
  const callerCount = randInt(1, 2)
  const callers = pickN(callerPool, Math.min(callerCount, callerPool.length))

  // 3ベッターはSBかBB（ブラインドが3ベットするシチュエーション）
  const threeBetter = pick(['SB', 'BB'])
  const alreadyIn = threeBetter === 'BB' ? bb : sb

  const tableAfterCall = pot + open * (callers.length + 1)
  const threeBet = potRaise(open, open, tableAfterCall, alreadyIn)

  return [
    {
      stepNum: 1,
      description: `${raiser}がポットベット（オープン）。レイズ額は？`,
      correctAmount: open,
      userAnswer: null,
      hint2x: `BB(${bb}) × 2 + SB(${sb}) = ${open}`,
      hint3x: `BB(${bb}) × 3 + SB(${sb}) = ${open}`,
      tips: [
        sb === bb / 2
          ? `Make = BB × 3.5 = ${bb * 3.5}`
          : `Make = BB × 3 + SB = ${bb * 3 + sb}`,
      ],
    },
    {
      stepNum: 2,
      description: `${callers.join('と')}がコール。${threeBetter}が3ベット（ポットレイズ）。レイズ額は？`,
      correctAmount: threeBet,
      userAnswer: null,
      hint2x: `コール(${open}) × 2 + 自分を除いたPot(${tableAfterCall - alreadyIn}) = ${threeBet}`,
      hint3x: `ベット(${open}) × ${3 + callers.length} + 元のPot(${pot}) = ${threeBet}`,
      tips: [
        `コール${callers.length}人後のRe-Pot = ベット × ${3 + callers.length} + 元のPot`,
        `= ${open} × ${3 + callers.length} + ${pot} = ${threeBet}`,
      ],
    },
  ]
}

function intermediatePostflop(bb: number, bbAnteAmount: number): { steps: ActionStep[]; potSize: number } {
  const street = pick(STREETS_POST)
  const potSize = bb * randInt(4, 10) + bbAnteAmount

  // 重複なしにポジションを3つ選ぶ
  const [bettor, caller, raiser] = pickN(ALL_POSITIONS, 3)
  const bet = potSize
  const rePot = bet * 3 + potSize

  return {
    potSize,
    steps: [
      {
        stepNum: 1,
        description: `${street}（Pot: ${potSize}）。${bettor}がポットベット。ベット額は？`,
        correctAmount: bet,
        userAnswer: null,
        hint2x: `Pot(${potSize}) = ${bet}`,
        hint3x: `Pot(${potSize}) = ${bet}`,
        tips: ['ポストフロップのポットベット = Pot'],
      },
      {
        stepNum: 2,
        description: `${caller}がコール。${raiser}がポットレイズ。レイズ額は？`,
        correctAmount: rePot,
        userAnswer: null,
        hint2x: `コール(${bet}) × 2 + Pot+ベット(${potSize + bet}) = ${rePot}`,
        hint3x: `ベット(${bet}) × 3 + Pot(${potSize}) = ${rePot}`,
        tips: ['ベットに対するRe-Pot = ベット × 3 + Pot'],
      },
    ],
  }
}

// ------- 上級 -------

function advancedPreflop(sb: number, bb: number): ActionStep[] {
  const pot = sb + bb
  const raiser = pick(OPEN_POSITIONS)
  const open = potRaise(bb, bb, pot, 0)

  // コーラーはraiser以外から1〜2人
  const callerPool = OPEN_POSITIONS.filter(p => p !== raiser)
  const callerCount = randInt(1, 2)
  const callers = pickN(callerPool, Math.min(callerCount, callerPool.length))

  // 3ベッターはSB or BB
  const threeBetter = pick(['SB', 'BB'])
  const alreadyIn3 = threeBetter === 'BB' ? bb : sb
  const tableAfterCall = pot + open * (callers.length + 1)
  const threeBet = potRaise(open, open, tableAfterCall, alreadyIn3)

  // 4ベッターはオリジナルレイザー
  const tableAfter3b = tableAfterCall - alreadyIn3 + threeBet
  const fourBet = potRaise(threeBet, threeBet, tableAfter3b, open)

  return [
    {
      stepNum: 1,
      description: `${raiser}がポットベット（オープン）。レイズ額は？`,
      correctAmount: open,
      userAnswer: null,
      hint2x: `BB(${bb}) × 2 + SB(${sb}) = ${open}`,
      hint3x: `BB(${bb}) × 3 + SB(${sb}) = ${open}`,
      tips: [],
    },
    {
      stepNum: 2,
      description: `${callers.join('と')}がコール。${threeBetter}が3ベット。レイズ額は？`,
      correctAmount: threeBet,
      userAnswer: null,
      hint2x: `コール(${open}) × 2 + 自分を除いたPot(${tableAfterCall - alreadyIn3}) = ${threeBet}`,
      hint3x: `ベット(${open}) × ${3 + callers.length} + 元のPot(${pot}) = ${threeBet}`,
      tips: [`コール${callers.length}人後: ベット × ${3 + callers.length} + 元のPot`],
    },
    {
      stepNum: 3,
      description: `${raiser}が4ベット。レイズ額は？`,
      correctAmount: fourBet,
      userAnswer: null,
      hint2x: `コール(${threeBet}) × 2 + 自分を除いたPot(${tableAfter3b - open}) = ${fourBet}`,
      hint3x: `ベット(${threeBet}) × 3 + 自分とベット除いたPot = ${fourBet}`,
      tips: ['4ベットも同じ計算式'],
    },
  ]
}

function advancedPostflop(bb: number, bbAnteAmount: number): { steps: ActionStep[]; potSize: number } {
  const street = pick(STREETS_POST)
  const potSize = bb * randInt(6, 14) + bbAnteAmount

  // bettor / raiser / reraiser すべて重複なし
  const [bettor, raiser, reraiser] = pickN(ALL_POSITIONS, 3)
  const bet = potSize
  const raise = bet * 3 + potSize
  const reraise = raise * 3 + (potSize + bet)

  return {
    potSize,
    steps: [
      {
        stepNum: 1,
        description: `${street}（Pot: ${potSize}）。${bettor}がポットベット。ベット額は？`,
        correctAmount: bet,
        userAnswer: null,
        hint2x: `Pot(${potSize}) = ${bet}`,
        hint3x: `Pot(${potSize}) = ${bet}`,
        tips: [],
      },
      {
        stepNum: 2,
        description: `${raiser}がポットレイズ。レイズ額は？`,
        correctAmount: raise,
        userAnswer: null,
        hint2x: `コール(${bet}) × 2 + Pot+ベット(${potSize + bet}) = ${raise}`,
        hint3x: `ベット(${bet}) × 3 + Pot(${potSize}) = ${raise}`,
        tips: ['ポットレイズ = ベット × 3 + Pot'],
      },
      {
        stepNum: 3,
        description: `${reraiser}がポットレイズ（Re-Re-Pot）。レイズ額は？`,
        correctAmount: reraise,
        userAnswer: null,
        hint2x: `コール(${raise}) × 2 + Pot(${potSize + bet + raise}) = ${reraise}`,
        hint3x: `ベット(${raise}) × 3 + Pot(${potSize + bet}) = ${reraise}`,
        tips: ['ポットベットに対するポットレイズ = Pot × 4'],
      },
    ],
  }
}

// ------- 鬼 -------

function oniPreflop(sb: number, bb: number): ActionStep[] {
  const pot = sb + bb
  const raiser = pick(OPEN_POSITIONS)
  const open = potRaise(bb, bb, pot, 0)

  // コーラーはraiser以外から2〜3人
  const callerPool = OPEN_POSITIONS.filter(p => p !== raiser)
  const callerCount = randInt(2, Math.min(3, callerPool.length))
  const callers = pickN(callerPool, callerCount)

  // 3ベッターはSB or BB
  const threeBetter = pick(['SB', 'BB'])
  const alreadyIn3 = threeBetter === 'BB' ? bb : sb
  const tableAfterCall = pot + open * (callers.length + 1)
  const threeBet = potRaise(open, open, tableAfterCall, alreadyIn3)

  // 4ベットコーラー（コーラーの中から1人）
  const fourBetCaller = pick(callers)
  const tableAfter3b = tableAfterCall - alreadyIn3 + threeBet
  const tableAfter3bCall = tableAfter3b + threeBet

  // 4ベッターはオリジナルレイザー
  const fourBet = potRaise(threeBet, threeBet, tableAfter3bCall, open)

  return [
    {
      stepNum: 1,
      description: `${raiser}がポットベット（オープン）。レイズ額は？`,
      correctAmount: open,
      userAnswer: null,
      hint2x: `BB(${bb}) × 2 + SB(${sb}) = ${open}`,
      hint3x: `BB(${bb}) × 3 + SB(${sb}) = ${open}`,
      tips: [`Make = ${open}`],
    },
    {
      stepNum: 2,
      description: `${callers.join('・')}がコール。${threeBetter}が3ベット。額は？`,
      correctAmount: threeBet,
      userAnswer: null,
      hint2x: `コール(${open}) × 2 + 自分を除いたPot(${tableAfterCall - alreadyIn3}) = ${threeBet}`,
      hint3x: `ベット(${open}) × ${3 + callers.length} + 元のPot(${pot}) = ${threeBet}`,
      tips: [`コール${callers.length}人後: ベット × ${3 + callers.length} + 元のPot = ${threeBet}`],
    },
    {
      stepNum: 3,
      description: `${fourBetCaller}がコール。${raiser}が4ベット。額は？`,
      correctAmount: fourBet,
      userAnswer: null,
      hint2x: `コール(${threeBet}) × 2 + 自分を除いたPot(${tableAfter3bCall - open}) = ${fourBet}`,
      hint3x: `ベット(${threeBet}) × 3 + 自分とベット除いたPot = ${fourBet}`,
      tips: ['コール1人後の4ベット = ベット × 4 + 元のPot相当'],
    },
  ]
}

function oniPostflop(bb: number, bbAnteAmount: number): { steps: ActionStep[]; potSize: number } {
  const street = pick(STREETS_POST)
  const potSize = bb * randInt(8, 18) + bbAnteAmount

  // bettor / caller1 / caller2 / raiser / reraiser すべて重複なし
  const [bettor, caller1, caller2, raiser, reraiser] = pickN(ALL_POSITIONS, 5)
  const bet = potSize
  const raise = bet * 5 + potSize   // コール2人後のRe-Pot
  const reraise = raise * 3 + (potSize + bet * 3)

  return {
    potSize,
    steps: [
      {
        stepNum: 1,
        description: `${street}（Pot: ${potSize}）。${bettor}がポットベット。ベット額は？`,
        correctAmount: bet,
        userAnswer: null,
        hint2x: `Pot(${potSize}) = ${bet}`,
        hint3x: `Pot(${potSize}) = ${bet}`,
        tips: [bbAnteAmount > 0 ? `BBAnte(${bbAnteAmount})はフロップ以降のPotに含まれる` : ''],
      },
      {
        stepNum: 2,
        description: `${caller1}と${caller2}がコール。${raiser}がポットレイズ。額は？`,
        correctAmount: raise,
        userAnswer: null,
        hint2x: `コール(${bet}) × 4 + Pot+ベット×2 = ${raise}`,
        hint3x: `ベット(${bet}) × 5 + Pot(${potSize}) = ${raise}`,
        tips: [
          `コール2人後のRe-Pot = ベット × 5 + Pot`,
          `= ${bet} × 5 + ${potSize} = ${raise}`,
        ],
      },
      {
        stepNum: 3,
        description: `${reraiser}がポットレイズ（Re-Re-Pot）。額は？`,
        correctAmount: reraise,
        userAnswer: null,
        hint2x: `コール(${raise}) × 2 + Pot全体(${potSize + bet * 3 + raise}) = ${reraise}`,
        hint3x: `ベット(${raise}) × 3 + Pot(${potSize + bet * 3}) = ${reraise}`,
        tips: [
          `キリのいい数で計算: ${raise}×3 ≈ ${Math.ceil(raise / 1000) * 1000}×3 から引く`,
        ],
      },
    ],
  }
}

// ------- メイン生成関数 -------

export function generatePotQuestion(
  _playerCount: number,
  blinds: [number, number][],
  bbAnte: boolean,
  streets: Street[],
  difficulty: Difficulty
): PotQuestion {
  const blind = pick(blinds)
  const [sb, bb] = blind
  const bbAnteAmount = bbAnte ? bb : 0
  const street = pick(streets)

  if (difficulty === 'beginner') {
    if (street === 'preflop') {
      return { blind, bbAnte: bbAnteAmount, street, potSize: 0, sequence: beginnerPreflop(sb, bb) }
    } else {
      const { steps, potSize } = beginnerPostflop(bb, bbAnteAmount)
      return { blind, bbAnte: bbAnteAmount, street, potSize, sequence: steps }
    }
  }

  if (difficulty === 'intermediate') {
    if (street === 'preflop') {
      return { blind, bbAnte: bbAnteAmount, street, potSize: 0, sequence: intermediatePreflop(sb, bb) }
    } else {
      const { steps, potSize } = intermediatePostflop(bb, bbAnteAmount)
      return { blind, bbAnte: bbAnteAmount, street, potSize, sequence: steps }
    }
  }

  if (difficulty === 'advanced') {
    if (street === 'preflop') {
      return { blind, bbAnte: bbAnteAmount, street, potSize: 0, sequence: advancedPreflop(sb, bb) }
    } else {
      const { steps, potSize } = advancedPostflop(bb, bbAnteAmount)
      return { blind, bbAnte: bbAnteAmount, street, potSize, sequence: steps }
    }
  }

  // 鬼
  if (street === 'preflop') {
    return { blind, bbAnte: bbAnteAmount, street, potSize: 0, sequence: oniPreflop(sb, bb) }
  } else {
    const { steps, potSize } = oniPostflop(bb, bbAnteAmount)
    return { blind, bbAnte: bbAnteAmount, street, potSize, sequence: steps }
  }
}
