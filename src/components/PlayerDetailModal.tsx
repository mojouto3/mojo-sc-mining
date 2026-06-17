import { X, Ship as ShipIcon, MapPin, Radio, FlaskConical, Crown } from 'lucide-react'
import { useMojoStore } from '@/store'
import { Avatar, RoleBadge, StatusBadge, Badge, ROLE_COLORS } from '@/components/ui'
import type { Player, OperationRole, PlayerStatus } from '@/types'

const OPERATION_ROLES: { value: OperationRole; label: string }[] = [
  { value: 'scout',         label: 'Scout' },
  { value: 'miner',         label: 'Miner' },
  { value: 'raw_hauler',    label: 'Raw Hauler' },
  { value: 'refine_hauler', label: 'Refine Hauler' },
]

const PLAYER_STATUSES: PlayerStatus[] = [
  'standby', 'scanning', 'mining', 'swapping', 'hauling', 'refining', 'selling', 'offline',
]

interface Props {
  player: Player
  currentPlayerId: string
  onClose: () => void
}

export function PlayerDetailModal({ player, currentPlayerId, onClose }: Props) {
  const operation     = useMojoStore((s) => s.operation)
  const updatePlayer  = useMojoStore((s) => s.updatePlayer)

  const isSelf = player.id === currentPlayerId
  const ship   = operation.ships.find((s) => s.id === player.shipId)
  const rock   = operation.rocks.find((r) => r.assignedMinerId === player.id)
  const job    = operation.refineryJobs.find((j) => j.paidByPlayerId === player.id && j.status !== 'collected')

  return (
    <div className="modal-overlay">
      <div className="modal-content">

        <div className="modal-header flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Avatar handle={player.handle} role={player.operationRole} size="sm" />
            <h2 className="text-sm font-semibold text-slate-200">{player.handle}</h2>
            {player.isFleetManager && (
              <Crown className="w-3.5 h-3.5 text-amber-400" />
            )}
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="modal-body p-5 space-y-4">

          {/* Role + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Operation role</label>
              {isSelf ? (
                <select
                  value={player.operationRole}
                  onChange={(e) => updatePlayer(player.id, { operationRole: e.target.value as OperationRole })}
                  className={`w-full text-xs font-mono font-bold px-2.5 py-2 rounded-lg border cursor-pointer focus:outline-none ${ROLE_COLORS[player.operationRole]}`}
                >
                  {OPERATION_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              ) : (
                <div className="py-1"><RoleBadge role={player.operationRole} /></div>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Status</label>
              {isSelf ? (
                <select
                  value={player.status}
                  onChange={(e) => updatePlayer(player.id, { status: e.target.value as PlayerStatus })}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {PLAYER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              ) : (
                <div className="py-1"><StatusBadge status={player.status} /></div>
              )}
            </div>
          </div>

          {/* Ship */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
              <ShipIcon className="w-3.5 h-3.5" /> Ship
            </div>
            {ship ? (
              <>
                <div className="text-sm font-semibold text-slate-200">{ship.model}</div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                  <MapPin className="w-3 h-3" /> {ship.location}
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-600 font-mono">Unassigned</div>
            )}
          </div>

          {/* Current rock (if mining) */}
          {rock && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
                <Radio className="w-3.5 h-3.5" /> Working
              </div>
              <div className="text-sm font-semibold text-slate-200">{rock.location}</div>
              {rock.ores.length > 0 && (
                <div className="text-[11px] font-mono text-slate-400">
                  {rock.ores.map((o) => o.materialId).join(' · ')}
                </div>
              )}
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">{rock.status}</Badge>
            </div>
          )}

          {/* Current refinery job (if any) */}
          {job && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
                <FlaskConical className="w-3.5 h-3.5" /> Refinery job
              </div>
              <div className="text-sm font-semibold text-slate-200">{job.materialName} · {job.quantitySCU} SCU</div>
              <div className="text-[11px] font-mono text-slate-500">{job.stationName}</div>
              <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20">{job.status}</Badge>
            </div>
          )}

          {!isSelf && (
            <div className="text-[10px] text-slate-600 font-mono italic text-center pt-1">
              Viewing {player.handle}'s status — role/status are editable by anyone
            </div>
          )}
        </div>

      </div>
    </div>
  )
}