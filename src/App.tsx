import { useState } from 'react'
import { Diamond, Users, Radar, Hammer, Truck } from 'lucide-react'
import { useMojoStore } from '@/store'
import { PartyView } from '@/views/PartyView'
import { ScoutView } from '@/views/ScoutView'

type View = 'party' | 'scout' | 'miner' | 'hauler'

export default function App() {
  const [activeView, setActiveView] = useState<View>('party')
  const operation          = useMojoStore((s) => s.operation)
  const getEstimatedRevenue = useMojoStore((s) => s.getEstimatedRevenue)

  const navItems = [
    { id: 'party'  as View, label: 'Party',  Icon: Users  },
    { id: 'scout'  as View, label: 'Scout',  Icon: Radar  },
    { id: 'miner'  as View, label: 'Miner',  Icon: Hammer },
    { id: 'hauler' as View, label: 'Hauler', Icon: Truck  },
  ]

  const playerCount = operation.players.length
  const shipCount   = operation.ships.filter((s) => s.status === 'active').length
  const estRevenue  = getEstimatedRevenue()

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Topbar ── */}
      <header className="border-b border-amber-500/20 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Diamond className="w-4 h-4 text-amber-500 animate-spin-slow" />
            </div>
            <div>
              <span className="font-mono text-sm font-bold tracking-widest text-white uppercase">
                Mojo <span className="text-amber-500">Mining</span>
              </span>
              <p className="text-[10px] text-slate-600 font-mono">SC Cooperative Operations</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-400">
              {playerCount} {playerCount === 1 ? 'pilot' : 'pilots'}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-400">
              {shipCount} {shipCount === 1 ? 'ship' : 'ships'} active
            </span>
            {estRevenue > 0 && (
              <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">
                ~{estRevenue.toLocaleString()} aUEC
              </span>
            )}
          </div>

          {/* Nav */}
          <nav className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80">
            {navItems.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveView(id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeView === id
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 max-w-screen-xl w-full mx-auto px-4 py-6">
        {activeView === 'party'  && <PartyView />}
        {activeView === 'scout'  && <ScoutView />}
        {activeView === 'miner'  && <Placeholder title="Miner view"  sub="Assigned rock, laser tuning, bag status" />}
        {activeView === 'hauler' && <Placeholder title="Hauler view" sub="Refinery queue, TDD prices, payout" />}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-900/80 py-4 text-center text-[10px] text-slate-700 font-mono">
        Mojo Mining · Unofficial SC Fan Tool · Data via UEXcorp.space
      </footer>
    </div>
  )
}

function Placeholder({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fadeIn">
      <p className="text-sm font-mono text-amber-500/60 uppercase tracking-widest">{title}</p>
      <p className="text-xs text-slate-600 font-mono mt-1">{sub} — coming soon</p>
    </div>
  )
}
