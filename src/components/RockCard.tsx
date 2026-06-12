import { useState } from 'react'
import { X, ChevronDown, ChevronUp, User } from 'lucide-react'
import { useMojoStore } from '@/store'
import { Badge, Avatar } from '@/components/ui'
import type { Rock, RockStatus, Player } from '@/types'

const STATUS_OPTIONS: { value: RockStatus; label: string; cls: string }[] = [
  { value: 'scouted',  label: 'Scouted',   cls: 'bg-sky-500/10    text-sky-400    border-sky-500/20' },
  { value: 'en_route', label: 'En Route',  cls: 'bg-amber-500/10  text-amber-400  border-amber-500/20' },
  { value: 'mining',   label: 'Mining',    cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  { value: 'done',     label: 'Done',      cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
]

// Color per ore tier — just visual
const ORE_COLORS = [
  'text-amber-400',
  'text-sky-400',
  'text-emerald-400',
  'text-violet-400',
  'text-rose-400',
]

interface Props {
  rock: Rock
  miners: Player[]  // active players who can be assigned
}

export function RockCard({ rock, miners }: Props) {
  const { updateRock, removeRock } = useMojoStore((s) => ({
    updateRock: s.updateRock,
    removeRock: s.removeRock,
  }))

  const [collapsed, setCollapsed] = useState(false)

  const statusMeta = STATUS_OPTIONS.find((s) => s.value === rock.status) ?? STATUS_OPTIONS[0]
  const assignedMiner = miners.find((m) => m.id === rock.assignedMinerId)

  const totalOre = rock.ores.reduce((sum, o) => sum + o.percentage, 0)

  return (
    <div className={`bg-slate-900/70 border rounded-xl overflow-hidden transition-all ${
      rock.status === 'done' ? 'border-slate-800/40 opacity-60' : 'border-slate-700/50'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Status indicator dot */}
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
          rock.status === 'scouted'  ? 'bg-sky-400' :
          rock.status === 'en_route' ? 'bg-amber-400 animate-pulse' :
          rock.status === 'mining'   ? 'bg-orange-400 animate-pulse' :
          'bg-emerald-400'
        }`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-200 truncate">{rock.location}</span>
            <Badge className={statusMeta.cls}>{statusMeta.label}</Badge>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
            Scouted by {rock.scoutedBy} · {rock.ores.length} ore{rock.ores.length !== 1 ? 's' : ''}
            {totalOre > 0 && ` · ${Math.round(totalOre)}% total`}
          </div>
        </div>

        {/* Collapse */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-slate-600 hover:text-slate-400 transition-colors cursor-pointer p-0.5"
        >
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        {/* Remove */}
        <button
          onClick={() => removeRock(rock.id)}
          className="text-slate-700 hover:text-red-400 transition-colors cursor-pointer p-0.5"
          title="Remove rock"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {!collapsed && (
        <div className="border-t border-slate-800/60 px-4 py-3 space-y-3">

          {/* Ore composition */}
          {rock.ores.length > 0 && (
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase mb-2">Ore composition</div>
              <div className="space-y-1.5">
                {rock.ores
                  .sort((a, b) => b.percentage - a.percentage)
                  .map((ore, idx) => (
                    <div key={ore.materialId} className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-bold w-24 truncate ${ORE_COLORS[idx % ORE_COLORS.length]}`}>
                        {ore.materialId}
                      </span>
                      {/* Progress bar */}
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            idx === 0 ? 'bg-amber-500' :
                            idx === 1 ? 'bg-sky-500' :
                            idx === 2 ? 'bg-emerald-500' : 'bg-slate-500'
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
            </div>
          )}

          {/* Notes */}
          {rock.notes && (
            <div className="text-[11px] text-slate-400 italic bg-slate-800/30 rounded px-2.5 py-1.5 border-l-2 border-slate-700">
              {rock.notes}
            </div>
          )}

          {/* Status + Miner dispatch row */}
          <div className="flex items-center gap-3 flex-wrap pt-1 border-t border-slate-800/40">
            {/* Status selector */}
            <div className="flex gap-1">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => updateRock(rock.id, { status: s.value })}
                  className={`text-[10px] font-mono font-bold px-2 py-1 rounded border transition-all cursor-pointer ${
                    rock.status === s.value
                      ? s.cls
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Miner assignment */}
            <div className="flex items-center gap-2 ml-auto">
              {assignedMiner ? (
                <div className="flex items-center gap-1.5">
                  <Avatar handle={assignedMiner.handle} role={assignedMiner.operationRole} size="sm" />
                  <span className="text-[11px] font-mono text-slate-300">{assignedMiner.handle}</span>
                  <button
                    onClick={() => updateRock(rock.id, { assignedMinerId: null })}
                    className="text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
                    title="Unassign miner"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        updateRock(rock.id, { assignedMinerId: e.target.value, status: 'en_route' })
                      }
                    }}
                    className="bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 rounded px-2 py-1 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="">Dispatch miner...</option>
                    {miners.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.handle}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
