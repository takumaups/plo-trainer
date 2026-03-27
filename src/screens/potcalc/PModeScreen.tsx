import type { GameMode } from '../../types'
import GoldBtn from '../../components/GoldBtn'
import Panel from '../../components/Panel'

interface PModeScreenProps {
  onSelect: (mode: GameMode, timeLimit?: number) => void
  onBack: () => void
}

export default function PModeScreen({ onSelect, onBack }: PModeScreenProps) {
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
        Pot Calc Practice
      </h1>

      <div className="space-y-4">
        <Panel>
          <h2 className="text-xl mb-3" style={{ color: 'var(--gold)' }}>
            タイムアタック
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-dim)' }}>
            制限時間内に何問正解できるか
          </p>
          <div className="space-y-2">
            <GoldBtn fullWidth onClick={() => onSelect('time', 60)}>
              60秒
            </GoldBtn>
            <GoldBtn fullWidth onClick={() => onSelect('time', 120)}>
              120秒
            </GoldBtn>
            <GoldBtn fullWidth onClick={() => onSelect('time', 180)}>
              180秒
            </GoldBtn>
          </div>
        </Panel>

        <Panel>
          <h2 className="text-xl mb-3" style={{ color: 'var(--gold)' }}>
            通常モード
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-dim)' }}>
            好きなだけ練習できます
          </p>
          <GoldBtn fullWidth onClick={() => onSelect('endless')}>
            スタート
          </GoldBtn>
        </Panel>

        <Panel>
          <h2 className="text-xl mb-3" style={{ color: 'var(--gold)' }}>
            サバイバル
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-dim)' }}>
            1問でも間違えたら終了
          </p>
          <GoldBtn fullWidth onClick={() => onSelect('survive')}>
            挑戦する
          </GoldBtn>
        </Panel>
      </div>
    </div>
  )
}
