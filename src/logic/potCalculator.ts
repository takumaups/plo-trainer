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

const STREETS_POST = ['フロップ', 'ターン', 'リバー']

// ------- 初級シナリオ -------

function beginnerPreflop(sb: number, bb: number): ActionStep[] {
  const raiser = pick(['UTG', 'HJ', 'CO', 'BTN'])
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
  const bettor = pick(['SB', 'BB', 'UTG', 'CO', 'BTN'])
  const amount = potSize
  return {
    potSize,
    steps: [{
      stepNum: 1,
      description: `${street}。${bettor}がポットベットします。ベット額は？`,
      correctAmount: amount,
      userAnswer: null,
      hint2x: `Pot(${potSize}) = ${amount}`,
      hint3x: `Pot(${potSize}) = ${amount}`,
      tips: ['ポストフロップのポットベット = Pot', 'ポットレイズ = ベット × 3 + Pot'],
    }],
  }
}

// ------- 中級シナリオ -------

function intermediatePreflop_openAndCall(sb: number, bb: number): ActionStep[] {
  const raiser = pick(['UTG', 'HJ', 'CO', 'BTN'])
  const callerPositions = [['CO'], ['BTN'], ['CO', 'BTN'], ['HJ', 'CO']]
  const callers = pick(callerPositions)
  const pot = sb + bb
  const open = potRaise(bb, bb, pot, 0)
  const callersText = callers.join('と')
  const tableAfterCall = pot + open * (callers.length + 1)
  const rePotter = pick(['SB', 'BB'].filter(p => !callers.includes(p) && p !== raiser))
  const alreadyIn = rePotter === 'BB' ? bb : rePotter === 'SB' ? sb : 0
  const rePot = potRaise(open, open, tableAfterCall, alreadyIn)
  return [
    {
      stepNum: 1,
      description: `${raiser}がポットベット（オープン）。レイズ額は？`,
      correctAmount: open,
      userAnswer: null,
      hint2x: `BB(${bb}) × 2 + SB(${sb}) = ${open}`,
      hint3x: `BB(${bb}) × 3 + SB(${sb}) = ${open}`,
      tips: [`Make = ${open}（覚えておこう）`],
    },
    {
      stepNum: 2,
      description: `${callersText}がコール。${rePotter}がポットレイズ（3ベット）。レイズ額は？`,
      correctAmount: rePot,
      userAnswer: null,
      hint2x: `コール額(${open}) × 2 + 自分を除いたPot(${tableAfterCall - alreadyIn}) = ${rePot}`,
      hint3x: `ベット(${open}) × ${3 + callers.length} + 元のPot(${sb + bb}) = ${rePot}`,
      tips: [
        `コール${callers.length}人後のRe-Pot = ベット × ${3 + callers.length} + 元のPot`,
        `= ${open} × ${3 + callers.length} + ${sb + bb} = ${rePot}`,
      ],
    },
  ]
}

function intermediatePostflop(bb: number, bbAnteAmount: number): { steps: ActionStep[]; potSize: number } {
  const street = pick(STREETS_POST)
  const potSize = bb * randInt(4, 10) + bbAnteAmount
  const bettor = pick(['UTG', 'CO', 'BTN', 'SB', 'BB'])
  const callerPos = pick(['BB', 'UTG', 'CO'].filter(p => p !== bettor))
  const rePotter = pick(['UTG', 'CO', 'BTN', 'SB'].filter(p => p !== bettor && p !== callerPos))

  const bet = potSize
  const tableAfterCall = potSize + bet * 2
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
        description: `${callerPos}がコール。${rePotter}がポットレイズ（レイズ）。レイズ額は？`,
        correctAmount: rePot,
        userAnswer: null,
        hint2x: `コール額(${bet}) × 2 + 自分を除いたPot(${tableAfterCall}) = ${rePot}`,
        hint3x: `ベット(${bet}) × 3 + Pot(${potSize}) = ${rePot}`,
        tips: ['ベットに対するRe-Pot = ベット × 3 + Pot'],
      },
    ],
  }
}

// ------- 上級シナリオ -------

function advancedPreflop_3bet4bet(sb: number, bb: number): ActionStep[] {
  const pot = sb + bb
  const raiser = pick(['UTG', 'HJ', 'CO', 'BTN'])
  const open = potRaise(bb, bb, pot, 0)

  const callerCount = randInt(1, 2)
  const callerLabels = [['CO'], ['BTN'], ['CO', 'BTN'], ['HJ', 'CO']][callerCount - 1] ?? ['CO']
  const tableAfter3 = pot + open * (callerCount + 1)
  const rePotter = pick(['SB', 'BB'])
  const alreadyIn3 = rePotter === 'BB' ? bb : sb
  const threeBet = potRaise(open, open, tableAfter3, alreadyIn3)

  // 4ベット：オリジナルレイザーが4ベット
  const tableAfter4 = tableAfter3 - alreadyIn3 + threeBet
  const fourBet = potRaise(threeBet, threeBet, tableAfter4, open)

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
      description: `${callerLabels.join('と')}がコール。${rePotter}が3ベット。レイズ額は？`,
      correctAmount: threeBet,
      userAnswer: null,
      hint2x: `コール(${open}) × 2 + 自分を除いたPot(${tableAfter3 - alreadyIn3}) = ${threeBet}`,
      hint3x: `ベット(${open}) × ${3 + callerCount} + 元のPot(${pot}) = ${threeBet}`,
      tips: [`コール${callerCount}人後: ベット × ${3 + callerCount} + 元のPot`],
    },
    {
      stepNum: 3,
      description: `${raiser}が4ベット（Re-Re-Pot）。レイズ額は？`,
      correctAmount: fourBet,
      userAnswer: null,
      hint2x: `コール(${threeBet}) × 2 + 自分を除いたPot(${tableAfter4 - open}) = ${fourBet}`,
      hint3x: `ベット(${threeBet}) × 3 + 自分とベットを除いたPot = ${fourBet}`,
      tips: ['4ベットも同じ計算式: コール × 2 + 自分を除いたPot'],
    },
  ]
}

function advancedPostflop_betReraise(bb: number, bbAnteAmount: number): { steps: ActionStep[]; potSize: number } {
  const street = pick(STREETS_POST)
  const potSize = bb * randInt(6, 14) + bbAnteAmount
  const bettor = pick(['UTG', 'CO', 'BTN', 'SB'])
  const raiser = pick(['BB', 'UTG', 'CO', 'BTN'].filter(p => p !== bettor))
  const reraiser = pick(['SB', 'HJ'].filter(p => p !== bettor && p !== raiser))

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

// ------- 鬼シナリオ -------

function oniPreflop_multiway(sb: number, bb: number): ActionStep[] {
  const pot = sb + bb
  const open = potRaise(bb, bb, pot, 0)
  const callerCount = randInt(2, 3)
  const callerNames = [['HJ', 'CO'], ['CO', 'BTN'], ['HJ', 'CO', 'BTN']][callerCount - 2] ?? ['HJ', 'CO']
  const tableAfterCallers = pot + open * (callerCount + 1)
  const threeBetter = pick(['SB', 'BB'])
  const alreadyIn = threeBetter === 'BB' ? bb : sb
  const threeBet = potRaise(open, open, tableAfterCallers, alreadyIn)

  // 1人コール後に4ベット
  const callerOf3bet = pick(['UTG', 'HJ'].filter(n => !callerNames.includes(n)))
  const tableAfter3b = tableAfterCallers - alreadyIn + threeBet
  const tableAfter3bCall = tableAfter3b + threeBet
  const fourBet = potRaise(threeBet, threeBet, tableAfter3bCall, open)

  return [
    {
      stepNum: 1,
      description: `UTGがポットベット（オープン）。レイズ額は？`,
      correctAmount: open,
      userAnswer: null,
      hint2x: `BB(${bb}) × 2 + SB(${sb}) = ${open}`,
      hint3x: `BB(${bb}) × 3 + SB(${sb}) = ${open}`,
      tips: [`Make = ${open}`],
    },
    {
      stepNum: 2,
      description: `${callerNames.join('・')}がコール。${threeBetter}が3ベット。額は？`,
      correctAmount: threeBet,
      userAnswer: null,
      hint2x: `コール(${open}) × 2 + 自分を除いたPot(${tableAfterCallers - alreadyIn}) = ${threeBet}`,
      hint3x: `ベット(${open}) × ${3 + callerCount} + 元のPot(${pot}) = ${threeBet}`,
      tips: [`コール${callerCount}人後: ベット × ${3 + callerCount} + 元のPot = ${threeBet}`],
    },
    {
      stepNum: 3,
      description: `${callerOf3bet}がコール。UTGが4ベット。額は？`,
      correctAmount: fourBet,
      userAnswer: null,
      hint2x: `コール(${threeBet}) × 2 + 自分を除いたPot(${tableAfter3bCall - open}) = ${fourBet}`,
      hint3x: `ベット(${threeBet}) × 3 + 自分とベットを除いたPot = ${fourBet}`,
      tips: ['コール1人後の4ベット = ベット × 4 + 元のPot相当'],
    },
  ]
}

function oniPostflop_multiCaller(bb: number, bbAnteAmount: number): { steps: ActionStep[]; potSize: number } {
  const street = pick(STREETS_POST)
  const potSize = bb * randInt(8, 18) + bbAnteAmount
  const bettor = pick(['UTG', 'CO', 'BTN'])
  const caller1 = 'BB'
  const caller2 = pick(['SB', 'HJ'].filter(p => p !== bettor))
  const raiser = pick(['UTG', 'CO'].filter(p => p !== bettor))

  const bet = potSize
  const tableAfterCallers = potSize + bet * 3  // ベット + 2コール
  const raise = bet * (3 + 2) + potSize        // コール2人後のRe-Pot

  const reraise = raise * 3 + (potSize + bet * 3)  // betterが3ベット

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
        description: `${bettor}がポットレイズ（Re-Re-Pot）。額は？`,
        correctAmount: reraise,
        userAnswer: null,
        hint2x: `コール(${raise}) × 2 + 自分を除いたPot(${tableAfterCallers + raise}) = ${reraise}`,
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
      return {
        blind, bbAnte: bbAnteAmount, street, potSize: 0,
        sequence: beginnerPreflop(sb, bb),
      }
    } else {
      const { steps, potSize } = beginnerPostflop(bb, bbAnteAmount)
      return { blind, bbAnte: bbAnteAmount, street, potSize, sequence: steps }
    }
  }

  if (difficulty === 'intermediate') {
    if (street === 'preflop') {
      // パターン：オープン+コール+3ベット / オープンのみ（ランダム）
      const pattern = pick(['openCall', 'openOnly', 'openOnly'])
      if (pattern === 'openCall') {
        return {
          blind, bbAnte: bbAnteAmount, street, potSize: 0,
          sequence: intermediatePreflop_openAndCall(sb, bb),
        }
      } else {
        return {
          blind, bbAnte: bbAnteAmount, street, potSize: 0,
          sequence: beginnerPreflop(sb, bb),
        }
      }
    } else {
      const { steps, potSize } = intermediatePostflop(bb, bbAnteAmount)
      return { blind, bbAnte: bbAnteAmount, street, potSize, sequence: steps }
    }
  }

  if (difficulty === 'advanced') {
    if (street === 'preflop') {
      return {
        blind, bbAnte: bbAnteAmount, street, potSize: 0,
        sequence: advancedPreflop_3bet4bet(sb, bb),
      }
    } else {
      const { steps, potSize } = advancedPostflop_betReraise(bb, bbAnteAmount)
      return { blind, bbAnte: bbAnteAmount, street, potSize, sequence: steps }
    }
  }

  // 鬼
  if (street === 'preflop') {
    return {
      blind, bbAnte: bbAnteAmount, street, potSize: 0,
      sequence: oniPreflop_multiway(sb, bb),
    }
  } else {
    const { steps, potSize } = oniPostflop_multiCaller(bb, bbAnteAmount)
    return { blind, bbAnte: bbAnteAmount, street, potSize, sequence: steps }
  }
}
