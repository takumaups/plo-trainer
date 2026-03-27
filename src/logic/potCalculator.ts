import type { PotQuestion, ActionStep, Difficulty, Street } from '../types'

/**
 * ポットサイズのベット/レイズ額を計算する
 * @param callAmount    コールに必要な全額（0なら最初のベット）
 * @param lastBetAmount 直前のベット/レイズ額（最初のベットの場合は0）
 * @param tableTotal    テーブル上の全チップ合計（自分の投入済み額を含む）
 * @param alreadyIn     自分がすでに投入済みの額
 */
export function potRaise(
  callAmount: number,
  lastBetAmount: number,
  tableTotal: number,
  alreadyIn: number = 0
): number {
  // コールに必要な純額
  const callNeeded = callAmount - alreadyIn
  // ポットレイズ額 = 直前のベット額 + テーブル総額
  const potRaiseAmount = lastBetAmount + tableTotal
  return callNeeded + potRaiseAmount
}

/**
 * 問題を生成する
 */
export function generatePotQuestion(
  _playerCount: number,
  blinds: [number, number][],
  bbAnte: boolean,
  streets: Street[],
  difficulty: Difficulty
): PotQuestion {
  // ランダムにブラインドを選択
  const blind = blinds[Math.floor(Math.random() * blinds.length)]
  const [sb, bb] = blind
  const bbAnteAmount = bbAnte ? bb : 0

  // ランダムにストリートを選択
  const street = streets[Math.floor(Math.random() * streets.length)]

  const sequence: ActionStep[] = []
  let stepNum = 1

  if (difficulty === 'beginner') {
    // 初級: プリフロまたはフロップ以降の単純なPot-Bet
    if (street === 'preflop') {
      const tableTotal = sb + bb
      const callAmount = bb
      const lastBetAmount = bb
      const potBet = potRaise(callAmount, lastBetAmount, tableTotal, 0)

      sequence.push({
        stepNum: stepNum++,
        description: `UTGがポットベットします。ベット額は？`,
        correctAmount: potBet,
        userAnswer: null,
        hint2x: `コール額(${bb}) × 2 + 自分を除いたテーブル総額(${sb}) = ${bb * 2 + sb}`,
        hint3x: `直前のベット額(${bb}) × 3 + 自分と直前を除いたテーブル総額(${sb}) = ${bb * 3 + sb}`,
        tips: [
          sb === bb / 2 ? `SB=0.5BBの場合: BB×3.5倍 = ${bb * 3.5}` : `SB≠0.5BBの場合: BB×3倍+SB = ${bb * 3 + sb}`,
          'ポットベット = 直前のベット額 + テーブル総額'
        ]
      })
    } else {
      // フロップ以降
      const potSize = bb * (2 + Math.floor(Math.random() * 3)) + bbAnteAmount
      const potBet = potSize

      sequence.push({
        stepNum: stepNum++,
        description: `BTNがポットベットします。ベット額は？`,
        correctAmount: potBet,
        userAnswer: null,
        hint2x: `Pot(${potSize}) × 1 = ${potSize}`,
        hint3x: `Pot(${potSize}) × 1 = ${potSize}`,
        tips: [
          'フロップ以降のポットベット = Pot × 1',
          'ポットベットに対するポットレイズ = Pot × 4'
        ]
      })

      return {
        blind,
        bbAnte: bbAnteAmount,
        street,
        potSize,
        sequence
      }
    }
  } else if (difficulty === 'intermediate') {
    // 中級: Pot-Bet + 横コール + Re-Pot
    if (street === 'preflop') {
      const tableTotal = sb + bb
      const callAmount = bb
      const lastBetAmount = bb
      const potBet = potRaise(callAmount, lastBetAmount, tableTotal, 0)

      sequence.push({
        stepNum: stepNum++,
        description: `UTGがポットベットします。ベット額は？`,
        correctAmount: potBet,
        userAnswer: null,
        hint2x: `コール額(${bb}) × 2 + 自分を除いたテーブル総額(${sb}) = ${potBet}`,
        hint3x: `直前のベット額(${bb}) × 3 + 自分と直前を除いたテーブル総額(${sb}) = ${potBet}`,
        tips: [
          sb === bb / 2 ? `SB=0.5BBの場合: BB×3.5倍` : `SB≠0.5BBの場合: BB×3倍+SB`,
        ]
      })

      // 横コール
      const numCallers = 1 + Math.floor(Math.random() * 2)
      const newTableTotal = tableTotal + potBet * (numCallers + 1)
      const callersText = numCallers === 1 ? 'CO' : numCallers === 2 ? 'COとBTN' : 'CO、BTN、SB'

      const rePot = potRaise(potBet, potBet, newTableTotal, bb)

      sequence.push({
        stepNum: stepNum++,
        description: `${callersText}がコール。BBがポットレイズします。レイズ額は？`,
        correctAmount: rePot,
        userAnswer: null,
        hint2x: `コール額(${potBet}) × 2 + 自分を除いたテーブル総額(${newTableTotal - bb}) = ${rePot}`,
        hint3x: `直前のベット額(${potBet}) × 3 + 自分と直前を除いたテーブル総額(${newTableTotal - bb - potBet}) = ${rePot}`,
        tips: [
          `コールあり: Make + コール人数 × BB`,
          `ベットに対するRe-Pot = ベット × 3 + Pot`
        ]
      })
    } else {
      const potSize = bb * (3 + Math.floor(Math.random() * 4)) + bbAnteAmount
      const potBet = potSize

      sequence.push({
        stepNum: stepNum++,
        description: `SBがポットベットします。ベット額は？`,
        correctAmount: potBet,
        userAnswer: null,
        hint2x: `Pot(${potSize}) = ${potBet}`,
        hint3x: `Pot(${potSize}) = ${potBet}`,
        tips: ['フロップ以降のポットベット = Pot']
      })

      const numCallers = 1
      const newPot = potSize + potBet * (numCallers + 1)
      const rePot = potBet * 3 + potSize

      sequence.push({
        stepNum: stepNum++,
        description: `BBがコール。BTNがポットレイズします。レイズ額は？`,
        correctAmount: rePot,
        userAnswer: null,
        hint2x: `コール額(${potBet}) × 2 + 自分を除いたテーブル総額(${newPot}) = ${rePot}`,
        hint3x: `直前のベット額(${potBet}) × 3 + Pot(${potSize}) = ${rePot}`,
        tips: [
          `ベットに対するRe-Pot = ベット × 3 + Pot`,
          `コールn人後のRe-Pot = ベット × (3+n) + Pot`
        ]
      })

      return {
        blind,
        bbAnte: bbAnteAmount,
        street,
        potSize,
        sequence
      }
    }
  } else if (difficulty === 'advanced') {
    // 上級: Re-Re-Pot、複数横コール、BBAnte
    if (street === 'preflop') {
      const tableTotal = sb + bb
      const potBet = potRaise(bb, bb, tableTotal, 0)

      sequence.push({
        stepNum: stepNum++,
        description: `UTGがポットベットします。ベット額は？`,
        correctAmount: potBet,
        userAnswer: null,
        hint2x: `BB(${bb}) × 2 + SB(${sb}) = ${potBet}`,
        hint3x: `BB(${bb}) × 3 + SB(${sb}) = ${potBet}`,
        tips: []
      })

      const numCallers = 2
      let currentTableTotal = tableTotal + potBet * (numCallers + 1)
      const rePot = potRaise(potBet, potBet, currentTableTotal, bb)

      sequence.push({
        stepNum: stepNum++,
        description: `COとBTNがコール。BBがポットレイズ。レイズ額は？`,
        correctAmount: rePot,
        userAnswer: null,
        hint2x: `コール額(${potBet}) × 2 + テーブル総額-自分(${currentTableTotal - bb}) = ${rePot}`,
        hint3x: `ベット(${potBet}) × 3 + Pot-自分-ベット(${currentTableTotal - bb - potBet}) = ${rePot}`,
        tips: [`コール${numCallers}人後のRe-Pot = ベット × ${3 + numCallers} + 元のPot`]
      })

      currentTableTotal = currentTableTotal - bb + rePot
      const reRePot = potRaise(rePot, rePot, currentTableTotal, potBet)

      sequence.push({
        stepNum: stepNum++,
        description: `UTGがポットレイズ（Re-Re-Pot）。レイズ額は？`,
        correctAmount: reRePot,
        userAnswer: null,
        hint2x: `コール額(${rePot}) × 2 + テーブル総額-自分(${currentTableTotal - potBet}) = ${reRePot}`,
        hint3x: `ベット(${rePot}) × 3 + Pot-自分-ベット(${currentTableTotal - potBet - rePot}) = ${reRePot}`,
        tips: ['Re-Re-Potも同じ計算式']
      })
    } else {
      const potSize = bb * (4 + Math.floor(Math.random() * 5)) + bbAnteAmount
      const potBet = potSize

      sequence.push({
        stepNum: stepNum++,
        description: `UTGがポットベット。ベット額は？`,
        correctAmount: potBet,
        userAnswer: null,
        hint2x: `Pot(${potSize}) = ${potBet}`,
        hint3x: `Pot(${potSize}) = ${potBet}`,
        tips: []
      })

      const rePot = potBet * 3 + potSize

      sequence.push({
        stepNum: stepNum++,
        description: `COがポットレイズ。レイズ額は？`,
        correctAmount: rePot,
        userAnswer: null,
        hint2x: `ベット(${potBet}) × 2 + Pot+ベット(${potSize + potBet}) = ${rePot}`,
        hint3x: `ベット(${potBet}) × 3 + Pot(${potSize}) = ${rePot}`,
        tips: []
      })

      const newPot = potSize + potBet + rePot
      const reRePot = rePot * 3 + potSize + potBet

      sequence.push({
        stepNum: stepNum++,
        description: `UTGがポットレイズ（Re-Re-Pot）。レイズ額は？`,
        correctAmount: reRePot,
        userAnswer: null,
        hint2x: `ベット(${rePot}) × 2 + Pot+ベット(${newPot}) = ${reRePot}`,
        hint3x: `ベット(${rePot}) × 3 + Pot(${potSize + potBet}) = ${reRePot}`,
        tips: []
      })

      return {
        blind,
        bbAnte: bbAnteAmount,
        street,
        potSize,
        sequence
      }
    }
  } else {
    // 鬼: 全要素の組み合わせ
    if (street === 'preflop') {
      const tableTotal = sb + bb
      const potBet = potRaise(bb, bb, tableTotal, 0)

      sequence.push({
        stepNum: stepNum++,
        description: `UTGがポットベットします。ベット額は？`,
        correctAmount: potBet,
        userAnswer: null,
        hint2x: `BB(${bb}) × 2 + SB(${sb}) = ${potBet}`,
        hint3x: `BB(${bb}) × 3 + SB(${sb}) = ${potBet}`,
        tips: [`X × 3 = X × 2 + X で計算`]
      })

      const numCallers = 3
      let currentTableTotal = tableTotal + potBet * (numCallers + 1)
      const rePot = potRaise(potBet, potBet, currentTableTotal, sb)

      sequence.push({
        stepNum: stepNum++,
        description: `MP、CO、BTNがコール。SBがポットレイズ。レイズ額は？`,
        correctAmount: rePot,
        userAnswer: null,
        hint2x: `コール(${potBet}) × 2 + テーブル-自分(${currentTableTotal - sb}) = ${rePot}`,
        hint3x: `ベット(${potBet}) × 3 + Pot-自分-ベット = ${rePot}`,
        tips: [`位ごとに分解して計算: ${potBet}×3 = ${Math.floor(potBet / 1000) * 1000}×3 + ${potBet % 1000}×3`]
      })

      currentTableTotal = currentTableTotal - sb + rePot
      const shortAllIn = Math.floor(rePot * 0.6)
      currentTableTotal = currentTableTotal - potBet + shortAllIn

      sequence.push({
        stepNum: stepNum++,
        description: `UTGがショートオールイン(${shortAllIn})。MPがポットレイズ。レイズ額は？`,
        correctAmount: potRaise(rePot, rePot, currentTableTotal, potBet),
        userAnswer: null,
        hint2x: `ショートオールインは無視して、直前のベット額(${rePot})で計算`,
        hint3x: `ベット(${rePot}) × 3 + Pot-自分-ベット`,
        tips: ['ショートオールイン: 直前のベット額はフルレイズ額のまま維持']
      })
    } else {
      const potSize = bb * (5 + Math.floor(Math.random() * 6)) + bbAnteAmount
      const potBet = potSize

      sequence.push({
        stepNum: stepNum++,
        description: `SBがポットベット。ベット額は？`,
        correctAmount: potBet,
        userAnswer: null,
        hint2x: `Pot(${potSize}) = ${potBet}`,
        hint3x: `Pot(${potSize}) = ${potBet}`,
        tips: [bbAnteAmount > 0 ? `BBAnte(${bbAnteAmount})はフロップ以降のPotに含まれる` : '']
      })

      const numCallers = 2
      const rePot = potBet * (3 + numCallers) + potSize

      sequence.push({
        stepNum: stepNum++,
        description: `BBとUTGがコール。MPがポットレイズ。レイズ額は？`,
        correctAmount: rePot,
        userAnswer: null,
        hint2x: `ベット(${potBet}) × ${2 + numCallers} + Pot+ベット×${numCallers}`,
        hint3x: `ベット(${potBet}) × ${3 + numCallers} + Pot(${potSize}) = ${rePot}`,
        tips: [`コール${numCallers}人後: ベット × ${3 + numCallers} + Pot`]
      })

      const reRePot = rePot * 3 + (potSize + potBet * (numCallers + 1))

      sequence.push({
        stepNum: stepNum++,
        description: `SBがポットレイズ（Re-Re-Pot）。レイズ額は？`,
        correctAmount: reRePot,
        userAnswer: null,
        hint2x: `ベット(${rePot}) × 2 + Pot全体 = ${reRePot}`,
        hint3x: `ベット(${rePot}) × 3 + 元のPot(${potSize + potBet * (numCallers + 1)}) = ${reRePot}`,
        tips: [`キリのいい数で丸めて引く: ${rePot}×3 ≈ ${Math.ceil(rePot / 1000) * 1000}×3 - ...`]
      })

      return {
        blind,
        bbAnte: bbAnteAmount,
        street,
        potSize,
        sequence
      }
    }
  }

  return {
    blind,
    bbAnte: bbAnteAmount,
    street,
    potSize: street === 'preflop' ? 0 : bb * (2 + Math.floor(Math.random() * 3)),
    sequence
  }
}
