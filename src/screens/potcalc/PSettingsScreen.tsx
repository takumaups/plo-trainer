import { useState } from 'react'
import type { Difficulty, Street } from '../../types'
import GoldBtn from '../../components/GoldBtn'
import Panel from '../../components/Panel'

interface PSettingsScreenProps {
  onStart: (settings: {
    playerCount: number
    blinds: [number, number][]
    bbAnte: boolean
    streets: Street[]
    difficulty: Difficulty
  }) => void
  onBack: () => void
}

const BLIND_OPTIONS: [number, number][] = [
  [200, 400],
  [300, 600],
  [400, 800],
  [500, 1000],
  [600, 1200],
  [1000, 1500],
  [1000, 2000],
  [1500, 3000],
]

export default function PSettingsScreen({ onStart, onBack }: PSettingsScreenProps) {
  const [playerCount, setPlayerCount] = useState(6)
  const [selectedBlinds, setSelectedBlinds] = useState<[number, number][]>([[200, 400]])
  const [bbAnte, setBbAnte] = useState(false)
  const [streets, setStreets] = useState<Street[]>(['preflop'])
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner')

  const toggleBlind = (blind: [number, number]) => {
    const exists = selectedBlinds.some((b) => b[0] === blind[0] && b[1] === blind[1])
    if (exists) {
      const filtered = selectedBlinds.filter((b) => b[0] !== blind[0] || b[1] !== blind[1])
      if (filtered.length > 0) {
        setSelectedBlinds(filtered)
      }
    } else {
      setSelectedBlinds([...selectedBlinds, blind])
    }
  }

  const toggleStreet = (street: Street) => {
    if (streets.includes(street)) {
      const filtered = streets.filter((s) => s !== street)
      if (filtered.length > 0) {
        setStreets(filtered)
      }
    } else {
      setStreets([...streets, street])
    }
  }

  const handleStart = () => {
    onStart({
      playerCount,
      blinds: selectedBlinds,
      bbAnte,
      streets,
      difficulty,
    })
  }

  return (
    <div className="min-h-screen p-6">
      <button
        onClick={onBack}
        className="mb-4 text-sm"
        style={{ color: 'var(--gold)' }}
      >
        ← 戻る
      </button>

      <h1 className="text-3xl mb-6 text-center" style={{ color: 'var(--gold)' }}>
        設定
      </h1>

      <div className="space-y-4">
        <Panel>
          <h2 className="text-lg mb-3" style={{ color: 'var(--gold)' }}>
            プレイヤー人数
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {[2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => setPlayerCount(num)}
                className="py-2 rounded text-sm transition-all active:scale-95"
                style={{
                  background: playerCount === num ? 'var(--gold)' : 'var(--surface)',
                  color: playerCount === num ? '#111' : 'var(--text)',
                  border: '1px solid var(--border)',
                  minHeight: '44px',
                }}
              >
                {num}
              </button>
            ))}
          </div>
        </Panel>

        <Panel>
          <h2 className="text-lg mb-3" style={{ color: 'var(--gold)' }}>
            ブラインド（複数選択可）
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {BLIND_OPTIONS.map((blind) => {
              const isSelected = selectedBlinds.some((b) => b[0] === blind[0] && b[1] === blind[1])
              return (
                <button
                  key={`${blind[0]}-${blind[1]}`}
                  onClick={() => toggleBlind(blind)}
                  className="py-2 rounded text-sm transition-all active:scale-95"
                  style={{
                    background: isSelected ? 'var(--gold)' : 'var(--surface)',
                    color: isSelected ? '#111' : 'var(--text)',
                    border: '1px solid var(--border)',
                    minHeight: '44px',
                  }}
                >
                  {blind[0]}/{blind[1]}
                </button>
              )
            })}
          </div>
        </Panel>

        <Panel>
          <h2 className="text-lg mb-3" style={{ color: 'var(--gold)' }}>
            BBAnte
          </h2>
          <button
            onClick={() => setBbAnte(!bbAnte)}
            className="w-full py-3 rounded transition-all active:scale-98"
            style={{
              background: bbAnte ? 'var(--gold)' : 'var(--surface)',
              color: bbAnte ? '#111' : 'var(--text)',
              border: '1px solid var(--border)',
              minHeight: '50px',
            }}
          >
            {bbAnte ? 'あり（BB額と同額）' : 'なし'}
          </button>
        </Panel>

        <Panel>
          <h2 className="text-lg mb-3" style={{ color: 'var(--gold)' }}>
            Street（複数選択可）
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => toggleStreet('preflop')}
              className="py-3 rounded transition-all active:scale-95"
              style={{
                background: streets.includes('preflop') ? 'var(--gold)' : 'var(--surface)',
                color: streets.includes('preflop') ? '#111' : 'var(--text)',
                border: '1px solid var(--border)',
                minHeight: '50px',
              }}
            >
              プリフロ
            </button>
            <button
              onClick={() => toggleStreet('postflop')}
              className="py-3 rounded transition-all active:scale-95"
              style={{
                background: streets.includes('postflop') ? 'var(--gold)' : 'var(--surface)',
                color: streets.includes('postflop') ? '#111' : 'var(--text)',
                border: '1px solid var(--border)',
                minHeight: '50px',
              }}
            >
              フロップ以降
            </button>
          </div>
        </Panel>

        <Panel>
          <h2 className="text-lg mb-3" style={{ color: 'var(--gold)' }}>
            難易度
          </h2>
          <div className="space-y-2">
            {[
              { value: 'beginner', label: '初級', desc: '単純なPot-Bet' },
              { value: 'intermediate', label: '中級', desc: 'コール + Re-Pot' },
              { value: 'advanced', label: '上級', desc: 'Re-Re-Pot、BBAnte' },
              { value: 'oni', label: '鬼', desc: '全要素の組み合わせ' },
            ].map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => setDifficulty(value as Difficulty)}
                className="w-full py-3 px-4 rounded text-left transition-all active:scale-98"
                style={{
                  background: difficulty === value ? 'var(--gold)' : 'var(--surface)',
                  color: difficulty === value ? '#111' : 'var(--text)',
                  border: '1px solid var(--border)',
                  minHeight: '60px',
                }}
              >
                <div className="font-semibold">{label}</div>
                <div className="text-xs opacity-70">{desc}</div>
              </button>
            ))}
          </div>
        </Panel>

        <GoldBtn fullWidth onClick={handleStart}>
          ゲーム開始
        </GoldBtn>
      </div>
    </div>
  )
}
