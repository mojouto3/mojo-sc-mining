import { useState } from 'react'
import { Plus, Radar, CheckCircle2, Circle, Loader } from 'lucide-react'
import { useMojoStore } from '@/store'
import { ClusterCard } from '@/components/ClusterCard'
import { AddRockModal } from '@/components/AddRockModal'
import { EmptyState, Btn, Panel, PanelHeader, StatCard } from '@/components/ui'
import type { RockStatus } from '@/types'

const STATUS_FILTERS: { value: RockStatus | 'all'; label: string }[] = [
  { value: 'all',      label: 'All' },
  { value: 'scouted',  label: 'Discovered' },
  { value: 'en_route', label: 'En Route' },
  { value: 'mining',   label: 'Mining' },
  { value: 'done',     label: 'Done' },
]

export function ScoutView() {
  const operation = useMojoStore((s) => s.operation)

  const [showAddRock, setShowAddRock] = useState(false)
  const [filter, setFilter]           = useState<RockStatus | 'all'>('all')

  const { rocks, players } = operation

  const miners = players.filter(
    (p) => p.operationRole === 'miner' || p.operationRole === 'raw_hauler'
  )

  const scout = players.find((p) => p.operationRole === 'scout')
  const scoutHandle = scout?.handle ?? 'Scout'

  const filtered = filter === 'all'
    ? rocks
    : rocks.filter((r) => r.status === filter)

  // newest first
  const sorted = [...filtered].sort((a, b) => b.scoutedAt - a.scoutedAt)

  const active   = rocks.filter((r) => r.status !== 'done').length
  const mining   = rocks.filter((r) => r.status === 'mining').length
  const done     = rocks.filter((r) => r.status === 'done').length
  const assigned = rocks.filter((r) => r.assignedMinerId).length

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Radar className="w-5 h-5 text-sky-400" />
            Scout View
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Pin clusters, log signatures, track discovery
          </p>
        </div>
        <Btn
          onClick={() => setShowAddRock(true)}
          className="bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30 text-sky-400"
        >
          <Plus className="w-3.5 h-3.5" /> Pin rock
        </Btn>
      </div>

      {/* Stats */}
      {rocks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total rocks"  value={rocks.length} />
          <StatCard label="Active"       value={active} />
          <StatCard label="Mining now"   value={mining} />
          <StatCard label="Cleared"      value={done} />
        </div>
      )}

      {/* Filter tabs */}
      {rocks.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(({ value, label }) => {
            const count = value === 'all'
              ? rocks.length
              : rocks.filter((r) => r.status === value).length
            return (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wide transition-all cursor-pointer border ${
                  filter === value
                    ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                }`}
              >
                {value === 'mining'   && <Loader       className="w-3 h-3 animate-spin" />}
                {value === 'done'     && <CheckCircle2 className="w-3 h-3" />}
                {value === 'scouted'  && <Circle       className="w-3 h-3" />}
                {label}
                <span className="opacity-60">({count})</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Cluster grid */}
      {rocks.length === 0 ? (
        <EmptyState
          icon={<Radar className="w-10 h-10" />}
          message="No rocks pinned yet. Start scanning and pin your first cluster."
          action={
            <Btn
              onClick={() => setShowAddRock(true)}
              className="bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30 text-sky-400"
            >
              <Plus className="w-3.5 h-3.5" /> Pin first rock
            </Btn>
          }
        />
      ) : sorted.length === 0 ? (
        <div className="text-center py-10 text-xs text-slate-600 font-mono">
          No rocks with status "{filter}"
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sorted.map((rock) => (
            <ClusterCard key={rock.id} rock={rock} miners={miners} />
          ))}
        </div>
      )}

      {/* Active miners panel */}
      {miners.length > 0 && (
        <Panel>
          <PanelHeader
            title="Active miners"
            subtitle="Who's working what"
          />
          <div className="divide-y divide-slate-800/40">
            {miners.map((miner) => {
              const assignedRock = rocks.find((r) => r.assignedMinerId === miner.id)
              return (
                <div key={miner.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    assignedRock ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'
                  }`} />
                  <span className="text-xs font-semibold text-slate-200 flex-1">
                    {miner.handle}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {assignedRock ? `→ ${assignedRock.location}` : 'Unassigned'}
                  </span>
                </div>
              )
            })}
          </div>
        </Panel>
      )}

      {showAddRock && (
        <AddRockModal
          onClose={() => setShowAddRock(false)}
          scoutHandle={scoutHandle}
        />
      )}
    </div>
  )
}