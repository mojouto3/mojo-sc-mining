import { useState } from 'react'
import { Plus, Ship, Users, RotateCcw, AlertTriangle } from 'lucide-react'
import { useMojoStore } from '@/store'
import { ShipCard } from '@/components/ShipCard'
import { AddShipModal } from '@/components/AddShipModal'
import { AddPlayerModal } from '@/components/AddPlayerModal'
import { StatCard, EmptyState, Btn, Panel, PanelHeader } from '@/components/ui'

export function PartyView() {
  const { operation, resetOperation, getEstimatedRevenue, getNetProfit, getTotalExpenses } = useMojoStore((s) => ({
    operation:          s.operation,
    resetOperation:     s.resetOperation,
    getEstimatedRevenue: s.getEstimatedRevenue,
    getNetProfit:       s.getNetProfit,
    getTotalExpenses:   s.getTotalExpenses,
  }))

  const [showAddShip, setShowAddShip]     = useState(false)
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [confirmReset, setConfirmReset]   = useState(false)

  const { ships, players } = operation
  const unassigned = players.filter((p) => !p.shipId)
  const estRevenue = getEstimatedRevenue()
  const netProfit  = getNetProfit()
  const expenses   = getTotalExpenses()

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
    <div className="space-y-6 animate-fadeIn">

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
          <Btn
            variant={confirmReset ? 'danger' : 'ghost'}
            onClick={handleReset}
          >
            {confirmReset
              ? <><AlertTriangle className="w-3.5 h-3.5" /> Confirm reset?</>
              : <><RotateCcw className="w-3.5 h-3.5" /> Reset</>
            }
          </Btn>
        </div>
      </div>

      {/* ── Stats row ── */}
      {(estRevenue > 0 || expenses > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Pilots" value={players.length} />
          <StatCard label="Ships" value={ships.length} />
          <StatCard label="Expenses" value={`${expenses.toLocaleString()} aUEC`} />
          <StatCard label="Est. revenue" value={`${estRevenue.toLocaleString()} aUEC`} accent />
        </div>
      )}

      {/* ── Ships ── */}
      <div className="space-y-4">
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
          ships.map((ship) => (
            <ShipCard key={ship.id} ship={ship} players={players} />
          ))
        )}
      </div>

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
      {showAddShip   && <AddShipModal   onClose={() => setShowAddShip(false)} />}
      {showAddPlayer && <AddPlayerModal onClose={() => setShowAddPlayer(false)} />}
    </div>
  )
}

// ─── Op name inline edit ──────────────────────────────────────────────────────

function OpNameInput() {
  const { name, setOperationName } = useMojoStore((s) => ({
    name:             s.operation.name,
    setOperationName: s.setOperationName,
  }))
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
        className="text-lg font-bold text-slate-100 bg-slate-900 border border-amber-500/40 rounded-lg px-3 py-1.5 focus:outline-none font-display"
      />
    )
  }

  return (
    <button
      onClick={() => { setDraft(name); setEditing(true) }}
      className="text-lg font-bold text-slate-100 hover:text-amber-400 transition-colors cursor-pointer font-display"
      title="Click to rename operation"
    >
      {name}
    </button>
  )
}

// ─── Unassigned player row ────────────────────────────────────────────────────

import { Avatar, RoleBadge } from '@/components/ui'
import type { Player, Ship as ShipType } from '@/types'

function UnassignedRow({ player, ships }: { player: Player; ships: ShipType[] }) {
  const { assignPlayerToShip, removePlayer } = useMojoStore((s) => ({
    assignPlayerToShip: s.assignPlayerToShip,
    removePlayer:       s.removePlayer,
  }))

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <Avatar handle={player.handle} role={player.operationRole} size="sm" />
      <div className="flex-1">
        <span className="text-xs font-semibold text-slate-300">{player.handle}</span>
        <div className="mt-0.5"><RoleBadge role={player.operationRole} /></div>
      </div>

      <select
        defaultValue=""
        onChange={(e) => { if (e.target.value) assignPlayerToShip(player.id, e.target.value) }}
        className="bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 rounded px-2 py-1 focus:outline-none focus:border-amber-500 cursor-pointer"
      >
        <option value="">Assign to ship...</option>
        {ships.map((s) => (
          <option key={s.id} value={s.id}>{s.name} ({s.model})</option>
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
