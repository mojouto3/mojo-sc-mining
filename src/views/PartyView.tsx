import { useState } from 'react'
import { Plus, Ship, Users, RotateCcw, AlertTriangle, Bell } from 'lucide-react'
import { useMojoStore } from '@/store'
import { ShipCard } from '@/components/ShipCard'
import { AddShipModal } from '@/components/AddShipModal'
import { AddPlayerModal } from '@/components/AddPlayerModal'
import { Avatar, RoleBadge, StatCard, EmptyState, Btn, Panel, PanelHeader } from '@/components/ui'
import type { Player, Ship as ShipType, ShipType as ShipTypeEnum } from '@/types'

interface PartyViewProps {
  currentPlayerId: string
}

export function PartyView({ currentPlayerId }: PartyViewProps) {
  const operation      = useMojoStore((s) => s.operation)
  const resetOperation = useMojoStore((s) => s.resetOperation)
  const estRevenue     = useMojoStore((s) => s.getEstimatedRevenue())
  const expenses       = useMojoStore((s) => s.getTotalExpenses())

  const [showAddShip, setShowAddShip]     = useState(false)
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [confirmReset, setConfirmReset]   = useState(false)

  const { ships, players, rocks } = operation
  const unassigned = players.filter((p) => !p.shipId)

  // ── Needs Attention alerts ─────────────────────────────────────────────────
  const bagSwapAlerts = players.filter((p) => p.status === 'swapping')
  const refineryReady = operation.refineryJobs.filter((j) => j.status === 'done')
  const hasAlerts     = bagSwapAlerts.length > 0 || refineryReady.length > 0

  // ── Fleet grid by ship type ────────────────────────────────────────────────
  const scoutShips   = ships.filter((s) => s.type === 'scout')
  const miningShips  = ships.filter((s) => s.type === 'mining')
  const haulingShips = ships.filter((s) => s.type === 'raw_hauler' || s.type === 'refine_hauler')
  

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 3000)
      return
    }
    resetOperation()
    setConfirmReset(false)
  }

  return (
    <div className="space-y-5 animate-fadeIn">

      {/* ── Op name + controls ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <OpNameInput />
        <div className="flex items-center gap-2">
          <Btn onClick={() => setShowAddShip(true)}>
            <Ship className="w-3.5 h-3.5" /> Add ship
          </Btn>
          <Btn onClick={() => setShowAddPlayer(true)}>
            <Plus className="w-3.5 h-3.5" /> Enlist pilot
          </Btn>
          <Btn variant={confirmReset ? 'danger' : 'ghost'} onClick={handleReset}>
            {confirmReset
              ? <><AlertTriangle className="w-3.5 h-3.5" /> Confirm reset?</>
              : <><RotateCcw className="w-3.5 h-3.5" /> Reset</>
            }
          </Btn>
        </div>
      </div>

      {/* ── Needs Attention bar ── */}
      {hasAlerts && (
        <div className="bg-orange-500/06 border border-orange-500/20 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-mono text-orange-400 uppercase tracking-wider">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            Needs attention
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {bagSwapAlerts.map((player) => {
              const ship = ships.find((s) => s.id === player.shipId)
              return (
                <div key={player.id} className="flex items-center gap-3 bg-slate-950/60 border border-orange-500/20 rounded-lg px-3 py-2">
                  <Bell className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-200">{player.handle} — bags full</div>
                    <div className="text-[10px] font-mono text-slate-500">{ship?.model ?? 'Unknown ship'}</div>
                  </div>
                </div>
              )
            })}
            {refineryReady.map((job) => (
              <div key={job.id} className="flex items-center gap-3 bg-slate-950/60 border border-violet-500/20 rounded-lg px-3 py-2">
                <Bell className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-200">Refinery ready</div>
                  <div className="text-[10px] font-mono text-slate-500">{job.quantitySCU} SCU {job.materialName} · {job.stationName}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Fleet grid ── */}
      {ships.length === 0 ? (
        <EmptyState
          icon={<Ship className="w-10 h-10" />}
          message="No ships yet. Add your first ship to start the operation."
          action={
            <Btn variant="primary" onClick={() => setShowAddShip(true)}>
              <Plus className="w-3.5 h-3.5" /> Add first ship
            </Btn>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Scout */}
          <div className="space-y-3">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span>📡</span> Scout ({scoutShips.length})
            </div>
            {scoutShips.length === 0
              ? <div className="text-[11px] text-slate-700 font-mono text-center py-4 border border-dashed border-slate-800 rounded-lg">No scout ships</div>
              : scoutShips.map((ship) => <ShipCard key={ship.id} ship={ship} players={players} />)
            }
          </div>

          {/* Mining */}
          <div className="space-y-3">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span>⛏️</span> Mining ({miningShips.length})
            </div>
            {miningShips.length === 0
              ? <div className="text-[11px] text-slate-700 font-mono text-center py-4 border border-dashed border-slate-800 rounded-lg">No mining ships</div>
              : miningShips.map((ship) => <ShipCard key={ship.id} ship={ship} players={players} />)
            }
          </div>

          {/* Hauling */}
          <div className="space-y-3">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span>📦</span> Hauling ({haulingShips.length})
            </div>
            {haulingShips.length === 0
              ? <div className="text-[11px] text-slate-700 font-mono text-center py-4 border border-dashed border-slate-800 rounded-lg">No hauling ships</div>
              : haulingShips.map((ship) => <ShipCard key={ship.id} ship={ship} players={players} />)
            }
          </div>
        </div>
      )}

      {/* ── Unassigned pilots ── */}
      {unassigned.length > 0 && (
        <Panel>
          <PanelHeader
            title={<span className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-slate-500" /> Unassigned pilots</span>}
            subtitle="Waiting to be assigned to a ship"
          />
          <div className="divide-y divide-slate-800/40">
            {unassigned.map((player) => (
              <UnassignedRow key={player.id} player={player} ships={ships} />
            ))}
          </div>
        </Panel>
      )}

      {/* ── Modals ── */}
      {showAddShip   && <AddShipModal   onClose={() => setShowAddShip(false)} currentPlayerId={currentPlayerId} />}
      {showAddPlayer && <AddPlayerModal onClose={() => setShowAddPlayer(false)} />}
    </div>
  )
}

// ─── Op name inline edit ──────────────────────────────────────────────────────

function OpNameInput() {
  const name             = useMojoStore((s) => s.operation.name)
  const setOperationName = useMojoStore((s) => s.setOperationName)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(name)

  function save() {
    setOperationName(draft.trim() || name)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
        className="text-lg font-bold text-slate-100 bg-slate-900 border border-amber-500/40 rounded-lg px-3 py-1.5 focus:outline-none"
      />
    )
  }

  return (
    <button
      onClick={() => { setDraft(name); setEditing(true) }}
      className="text-lg font-bold text-slate-100 hover:text-amber-400 transition-colors cursor-pointer"
      title="Click to rename operation"
    >
      {name}
    </button>
  )
}

// ─── Unassigned player row ────────────────────────────────────────────────────

function UnassignedRow({ player, ships }: { player: Player; ships: ShipType[] }) {
  const assignPlayerToShip = useMojoStore((s) => s.assignPlayerToShip)
  const removePlayer       = useMojoStore((s) => s.removePlayer)

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <Avatar handle={player.handle} role={player.operationRole} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">{player.handle}</span>
          {player.isFleetManager && (
            <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded">
              Fleet Manager
            </span>
          )}
        </div>
        <div className="mt-0.5"><RoleBadge role={player.operationRole} /></div>
      </div>

      <select
        defaultValue=""
        onChange={(e) => { if (e.target.value) assignPlayerToShip(player.id, e.target.value) }}
        className="bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 rounded px-2 py-1 focus:outline-none focus:border-amber-500 cursor-pointer"
      >
        <option value="">Assign to ship...</option>
        {ships.map((s) => (
          <option key={s.id} value={s.id}>{s.model} ({s.name})</option>
        ))}
      </select>

      <button
        onClick={() => removePlayer(player.id)}
        className="text-slate-700 hover:text-red-400 transition-colors cursor-pointer"
      >
        <Users className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}