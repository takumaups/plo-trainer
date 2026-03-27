import { useState } from 'react'
import type { Difficulty } from '../../types'
import GoldBtn from '../../components/GoldBtn'
import Panel from '../../components/Panel'

interface QPlayersScreenProps {
  onSelect: (playerCount: number, difficulty: Difficulty) => void
  onBack: () => void
}

export default function QPlayersScreen({ onSelect, onBack }: QPlayersScreenProps) {
  const [playerCount, setPlayerCount] = useState<number>(2)
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner')

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

      <div className="space-y-6">
        <Panel>
          <h2 className="text-lg mb-3" style={{ color: 'var(--gold)' }}>
            プレイヤー人数
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {[2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => setPlayerCount(num)}
                className="py-2 px-3 rounded transition-all active:scale-95"
                style={{
                  background: playerCount === num ? 'var(--gold)' : 'var(--surface)',
                  color: playerCount === num ? '#111' : 'var(--text)',
                  border: '1px solid var(--border)',
                  minHeight: '44px',
                }}
              >
                {num}人
              </button>
            ))}
          </div>
        </Panel>

        <Panel>
          <h2 className="text-lg mb-3" style={{ color: 'var(--gold)' }}>
            難易度
          </h2>
          <div className="space-y-2">
            {[
              { value: 'beginner', label: '簡単', desc: '差が大きい（一目で分かる）' },
              { value: 'intermediate', label: '普通', desc: 'やや差がある' },
              { value: 'advanced', label: '難しい', desc: '接戦' },
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

        <GoldBtn fullWidth onClick={() => onSelect(playerCount, difficulty)}>
          ゲーム開始
        </GoldBtn>
      </div>
    </div>
  )
}
