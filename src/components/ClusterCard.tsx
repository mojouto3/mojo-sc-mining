import { useState } from 'react'
import { ChevronDown, ChevronUp, X, MapPin, Clock } from 'lucide-react'
import { useMojoStore } from '@/store'
import { Badge } from '@/components/ui'

import type { Rock, RockStatus, Player } from '@/types'

const STATUS_META: Record<RockStatus, { label: string; cls: string }> = {
  scouted:  { label: 'Discovered',   cls: 'bg-sky-500/10     text-sky-400     border-sky-500/20' },
  en_route: { label: 'En Route',     cls: 'bg-amber-500/10   text-amber-400   border-amber-500/20' },
  mining:   { label: 'Mining',       cls: 'bg-orange-500/10  text-orange-400  border-orange-500/20' },
  done:     { label: 'Done',         cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
}

function timeAgo(ts: number): string {
  const diffMs = Date.now() - ts
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// Try to guess node count from notes left by signature lookup, e.g.
// "Signature 18000 → Bexalite × 5 nodes (100% match)"
function extractNodeCount(notes: string): number | null {
  const match = notes.match(/×\s*(\d+)\s*node/i)
  return match ? Number(match[1]) : null
}

interface Props {
  rock: Rock
  miners: Player[]
}

export function ClusterCard({ rock, miners }: Props) {
  const updateRock = useMojoStore((s) => s.updateRock)
  const removeRock = useMojoStore((s) => s.removeRock)
  const [expanded, setExpanded] = useState(false)

  const statusMeta     = STATUS_META[rock.status]
  const assignedMiner  = miners.find((m) => m.id === rock.assignedMinerId)
  const nodeCount       = extractNodeCount(rock.notes)
  const topOre          = rock.ores.length > 0
    ? [...rock.ores].sort((a, b) => b.percentage - a.percentage)[0]
    : null

  

  return (
    <div className={`bg-slate-900/70 border rounded-xl p-3.5 flex flex-col gap-2.5 transition-all ${
      rock.status === 'done' ? 'border-slate-800/40 opacity-55' : 'border-slate-700/50 hover:border-slate-600/60'
    }`}>
      {/* Top row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <span className="text-sm font-bold text-slate-100 truncate">{rock.location}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {nodeCount && (
            <span className="text-[10px] font-mono font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 px-1.5 py-0.5 rounded">
              ×{nodeCount}
            </span>
          )}
          <button
            onClick={() => removeRock(rock.id)}
            className="text-slate-700 hover:text-red-400 transition-colors cursor-pointer p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Ore line */}
      <div className="text-xs">
        {rock.ores.length === 0 ? (
          <span className="text-slate-600 font-mono italic">??? unidentified</span>
        ) : (
          <span className="text-slate-300 font-mono">
            {rock.ores.map((o) => o.materialId).join(' · ')}
          </span>
        )}
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
        <Clock className="w-3 h-3" />
        <span>{timeAgo(rock.scoutedAt)}</span>
        <span>·</span>
        <span className="truncate">{rock.scoutedBy}</span>
      </div>

      {/* Status badge */}
      <div className="flex items-center justify-between gap-2">
        <Badge className={statusMeta.cls}>{statusMeta.label}</Badge>
        {assignedMiner && (
          <span className="text-[10px] font-mono text-slate-400 truncate">{assignedMiner.handle}</span>
        )}
      </div>

      {/* Expand for details */}
      {(rock.notes || rock.mass) && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-1 text-[10px] font-mono text-slate-600 hover:text-slate-400 transition-colors cursor-pointer self-start"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Less' : 'Details'}
        </button>
      )}

      {expanded && (
        <div className="space-y-2 pt-1 border-t border-slate-800/50">
          {rock.mass && (
            <div className="text-[11px] font-mono text-slate-400">
              Mass: <span className="text-amber-400">{rock.mass}</span>
            </div>
          )}
          {rock.ores.length > 0 && (
            <div className="space-y-1">
              {rock.ores.sort((a, b) => b.percentage - a.percentage).map((ore) => (
                <div key={ore.materialId} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 w-20 truncate">{ore.materialId}</span>
                  <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, ore.percentage)}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 w-8 text-right">{ore.percentage}%</span>
                </div>
              ))}
            </div>
          )}
          {rock.notes && (
            <div className="text-[10px] text-slate-500 italic whitespace-pre-line bg-slate-950/50 rounded px-2 py-1.5">
              {rock.notes}
            </div>
          )}
        </div>
      )}

      {/* Status quick actions */}
      <div className="flex gap-1 pt-1">
        {(['scouted', 'en_route', 'mining', 'done'] as RockStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => updateRock(rock.id, { status: s })}
            className={`flex-1 text-[9px] font-mono font-bold py-1 rounded border cursor-pointer transition-all ${
              rock.status === s ? STATUS_META[s].cls : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400'
            }`}
          >
            {STATUS_META[s].label}
          </button>
        ))}
      </div>
    </div>
  )
}