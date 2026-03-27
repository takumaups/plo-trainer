import GoldBtn from '../components/GoldBtn'
import Panel from '../components/Panel'

interface HomeScreenProps {
  onNavigate: (screen: string) => void
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center">
      <h1 className="text-4xl mb-2 text-center" style={{ color: 'var(--gold)' }}>
        PLO TRAINER
      </h1>
      <p className="text-center mb-8" style={{ color: 'var(--text-dim)' }}>
        Pot Limit Omaha Practice
      </p>

      <div className="w-full space-y-4">
        <Panel>
          <h2 className="text-xl mb-3" style={{ color: 'var(--gold)' }}>
            Qualify Practice
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-dim)' }}>
            ボードとホールカードから勝者とハンドランクを当てる練習
          </p>
          <GoldBtn fullWidth onClick={() => onNavigate('q-mode')}>
            Start
          </GoldBtn>
        </Panel>

        <Panel>
          <h2 className="text-xl mb-3" style={{ color: 'var(--gold)' }}>
            Pot Calc Practice
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-dim)' }}>
            ポット計算のシチュエーションを解く練習
          </p>
          <GoldBtn fullWidth onClick={() => onNavigate('p-mode')}>
            Start
          </GoldBtn>
        </Panel>
      </div>
    </div>
  )
}
