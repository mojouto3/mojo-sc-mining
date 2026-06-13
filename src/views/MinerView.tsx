import { useState } from 'react'
import { Hammer, AlertTriangle, Bell } from 'lucide-react'
import { useMojoStore } from '@/store'
import { LaserTuner } from '@/components/LaserTuner'
import { EmptyState, Panel, PanelHeader, StatCard } from '@/components/ui'
import { BAG_STATUS_LABELS, BAG_STATUS_COLORS } from '@/data/laserData'
import type { BagStatus } from '@/data/laserData'

const BAG_STATUSES: BagStatus[] = ['empty', 'filling', 'full', 'swapped']

// Ship model → laser count
const LASER_COUNT: Record<string, number> = {
  'MISC Prospector': 1,
  'ARGO MOLE':       3,
  'RSI Arrastra':    3,
  'Greycat ROC':     1,
}

export function MinerView() {
  const operation = useMojoStore((s) => s.operation)

  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('')
  const [bagStatus, setBagStatus]               = useState<BagStatus>('empty')
  const [swapRequested, setSwapRequested]       = useState(false)

  const { players, ships, rocks } = operation

  // Miners in the operation
  const miners = players.filter((p) => p.operationRole === 'miner')

  const selectedPlayer = miners.find((p) => p.id === selectedPlayerId) ?? miners[0]
  const selectedShip   = ships.find((s) => s.id === selectedPlayer?.shipId)
  const assignedRock   = rocks.find((r) => r.assignedMinerId === selectedPlayer?.id)

  const laserCount = selectedShip
    ? (LASER_COUNT[selectedShip.model] ?? 1)
    : 1

  function handleSwapRequest() {
    setSwapRequested(true)
    setBagStatus('full')
    setTimeout(() => setSwapRequested(false), 5000)
  }

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Hammer className="w-5 h-5 text-amber-500" />
            Miner View
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Assigned rock, laser tuning, bag management
          </p>
        </div>

        {/* Miner selector */}
        {miners.length > 1 && (
          <select
            value={selectedPlayer?.id ?? ''}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-sm text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {miners.map((m) => (
              <option key={m.id} value={m.id}>{m.handle}</option>
            ))}
          </select>
        )}
      </div>

      {miners.length === 0 ? (
        <EmptyState
          icon={<Hammer className="w-10 h-10" />}
          message="No miners enlisted. Go to Party view and enlist pilots with the Miner role."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column — rock + bag */}
          <div className="lg:col-span-1 space-y-4">

            {/* Assigned rock */}
            <Panel>
              <PanelHeader
                title="Assigned rock"
                subtitle={selectedPlayer?.handle}
              />
              {assignedRock ? (
                <div className="p-4 space-y-3">
                  <div className="text-sm font-semibold text-slate-200">{assignedRock.location}</div>

                  {/* Ore bars */}
                  {assignedRock.ores.length > 0 && (
                    <div className="space-y-1.5">
                      {assignedRock.ores
                        .sort((a, b) => b.percentage - a.percentage)
                        .map((ore, idx) => (
                          <div key={ore.materialId} className="flex items-center gap-2">
                            <span className={`text-xs font-mono font-bold w-24 truncate ${
                              idx === 0 ? 'text-amber-400' :
                              idx === 1 ? 'text-sky-400' :
                              'text-emerald-400'
                            }`}>
                              {ore.materialId}
                            </span>
                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  idx === 0 ? 'bg-amber-500' :
                                  idx === 1 ? 'bg-sky-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, ore.percentage)}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
                              {ore.percentage}%
                            </span>
                          </div>
                        ))}
                    </div>
                  )}

                  {assignedRock.notes && (
                    <div className="text-[11px] text-slate-400 italic bg-slate-800/30 rounded px-2.5 py-1.5 border-l-2 border-amber-500/30">
                      {assignedRock.notes}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-600 font-mono">
                  No rock assigned — scout dispatches you from Scout view
                </div>
              )}
            </Panel>

            {/* Ship info */}
            {selectedShip && (
              <Panel>
                <PanelHeader title="Ship" />
                <div className="p-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-mono">Name</span>
                    <span className="text-slate-200 font-semibold">{selectedShip.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-mono">Model</span>
                    <span className="text-slate-200">{selectedShip.model}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-mono">Lasers</span>
                    <span className="text-amber-400 font-mono font-bold">{laserCount}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-mono">Location</span>
                    <span className="text-slate-400">{selectedShip.location}</span>
                  </div>
                </div>
              </Panel>
            )}

            {/* Bag status */}
            <Panel>
              <PanelHeader title="Bag status" subtitle="Signal when ready for swap" />
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {BAG_STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() => { setBagStatus(status); setSwapRequested(false) }}
                      className={`px-3 py-2 rounded-lg border text-[11px] font-mono font-bold uppercase tracking-wide transition-all cursor-pointer ${
                        bagStatus === status
                          ? BAG_STATUS_COLORS[status]
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {BAG_STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>

                {/* Call for swap button */}
                <button
                  onClick={handleSwapRequest}
                  disabled={bagStatus === 'swapped'}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border font-mono font-bold text-xs uppercase tracking-wide transition-all cursor-pointer ${
                    swapRequested
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 animate-pulse-slow'
                      : bagStatus === 'swapped'
                      ? 'bg-slate-800/20 border-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20 text-orange-400'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  {swapRequested ? 'Swap requested!' : 'Call for swap'}
                </button>

                {swapRequested && (
                  <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    Hauler notified — bags ready for pickup
                  </div>
                )}
              </div>
            </Panel>
          </div>

          {/* Right column — laser tuner */}
          <div className="lg:col-span-2">
            <LaserTuner laserCount={laserCount} />
          </div>

        </div>
      )}
    </div>
  )
}
