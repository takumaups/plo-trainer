import { useState } from 'react'
import type { GameMode, Difficulty, Street, QGameResult, PCalcGameResult, SessionStats } from './types'
import HomeScreen from './screens/HomeScreen'
import QModeScreen from './screens/qualify/QModeScreen'
import QPlayersScreen from './screens/qualify/QPlayersScreen'
import QGameScreen from './screens/qualify/QGameScreen'
import QReviewScreen from './screens/qualify/QReviewScreen'
import PModeScreen from './screens/potcalc/PModeScreen'
import PSettingsScreen from './screens/potcalc/PSettingsScreen'
import PGameScreen from './screens/potcalc/PGameScreen'
import PReviewScreen from './screens/potcalc/PReviewScreen'

type Screen =
  | 'home'
  | 'q-mode'
  | 'q-players'
  | 'q-game'
  | 'q-review'
  | 'p-mode'
  | 'p-settings'
  | 'p-game'
  | 'p-review'

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [stats, setStats] = useState<SessionStats>({
    qualify: { correct: 0, total: 0, results: [] },
    potCalc: { correct: 0, total: 0, results: [] },
  })

  // Qualify state
  const [qMode, setQMode] = useState<GameMode>('endless')
  const [qTimeLimit, setQTimeLimit] = useState<number | undefined>(undefined)
  const [qPlayerCount, setQPlayerCount] = useState(2)
  const [qDifficulty, setQDifficulty] = useState<Difficulty>('beginner')
  const [qResults, setQResults] = useState<QGameResult[]>([])

  // Pot Calc state
  const [pMode, setPMode] = useState<GameMode>('endless')
  const [pTimeLimit, setPTimeLimit] = useState<number | undefined>(undefined)
  const [pSettings, setPSettings] = useState<{
    playerCount: number
    blinds: [number, number][]
    bbAnte: boolean
    streets: Street[]
    difficulty: Difficulty
  }>({
    playerCount: 6,
    blinds: [[200, 400]],
    bbAnte: false,
    streets: ['preflop'],
    difficulty: 'beginner',
  })
  const [pResults, setPResults] = useState<PCalcGameResult[]>([])

  const handleNavigate = (newScreen: string) => {
    setScreen(newScreen as Screen)
  }

  const handleQModeSelect = (mode: GameMode, timeLimit?: number) => {
    setQMode(mode)
    setQTimeLimit(timeLimit)
    setScreen('q-players')
  }

  const handleQPlayersSelect = (playerCount: number, difficulty: Difficulty) => {
    setQPlayerCount(playerCount)
    setQDifficulty(difficulty)
    setScreen('q-game')
  }

  const handleQGameFinish = (results: QGameResult[]) => {
    setQResults(results)
    const correct = results.filter((r) => r.isWinnerCorrect && r.isHandCorrect).length
    setStats({
      ...stats,
      qualify: {
        correct: stats.qualify.correct + correct,
        total: stats.qualify.total + results.length,
        results: [...stats.qualify.results, ...results],
      },
    })
    setScreen('q-review')
  }

  const handlePModeSelect = (mode: GameMode, timeLimit?: number) => {
    setPMode(mode)
    setPTimeLimit(timeLimit)
    setScreen('p-settings')
  }

  const handlePSettingsStart = (settings: {
    playerCount: number
    blinds: [number, number][]
    bbAnte: boolean
    streets: Street[]
    difficulty: Difficulty
  }) => {
    setPSettings(settings)
    setScreen('p-game')
  }

  const handlePGameFinish = (results: PCalcGameResult[]) => {
    setPResults(results)
    const correct = results.filter((r) => r.allCorrect).length
    setStats({
      ...stats,
      potCalc: {
        correct: stats.potCalc.correct + correct,
        total: stats.potCalc.total + results.length,
        results: [...stats.potCalc.results, ...results],
      },
    })
    setScreen('p-review')
  }

  return (
    <>
      {screen === 'home' && <HomeScreen onNavigate={handleNavigate} />}
      {screen === 'q-mode' && (
        <QModeScreen onSelect={handleQModeSelect} onBack={() => setScreen('home')} />
      )}
      {screen === 'q-players' && (
        <QPlayersScreen onSelect={handleQPlayersSelect} onBack={() => setScreen('q-mode')} />
      )}
      {screen === 'q-game' && (
        <QGameScreen
          mode={qMode}
          timeLimit={qTimeLimit}
          playerCount={qPlayerCount}
          difficulty={qDifficulty}
          onFinish={handleQGameFinish}
        />
      )}
      {screen === 'q-review' && (
        <QReviewScreen results={qResults} onHome={() => setScreen('home')} />
      )}
      {screen === 'p-mode' && (
        <PModeScreen onSelect={handlePModeSelect} onBack={() => setScreen('home')} />
      )}
      {screen === 'p-settings' && (
        <PSettingsScreen onStart={handlePSettingsStart} onBack={() => setScreen('p-mode')} />
      )}
      {screen === 'p-game' && (
        <PGameScreen
          mode={pMode}
          timeLimit={pTimeLimit}
          settings={pSettings}
          onFinish={handlePGameFinish}
        />
      )}
      {screen === 'p-review' && (
        <PReviewScreen results={pResults} onHome={() => setScreen('home')} />
      )}
    </>
  )
}

export default App
