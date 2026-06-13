import { useState } from 'react'
import { Trash2, ChevronDown, ChevronUp, MapPin, UserMinus } from 'lucide-react'
import { useMojoStore } from '@/store'
import {
  Avatar, RoleBadge, StatusBadge, Badge,
  SHIP_TYPE_COLORS, Btn,
} from '@/components/ui'
import type { Ship, Player, PlayerStatus, ShipType } from '@/types'

const SHIP_TYPE_ICON: Record<ShipType, string> = {
  scout:         '📡',
  mining:        '⛏️',
  raw_hauler:    '📦',
  refine_hauler: '🏭',
}

const SHIP_STATUS_LABELS = {
  active:  { label: 'Active',   cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  transit: { label: 'Transit',  cls: 'bg-sky-500/10     text-sky-400     border-sky-500/20' },
  docked:  { label: 'Docked',   cls: 'bg-slate-500/10   text-slate-400   border-slate-500/20' },
  standby: { label: 'Standby',  cls: 'bg-slate-700/10   text-slate-500   border-slate-700/20' },
}

const PLAYER_STATUSES: PlayerStatus[] = [
  'standby', 'scanning', 'mining', 'swapping', 'hauling', 'refining', 'selling', 'offline',
]

interface Props {
  ship: Ship
  players: Player[]
}

export function ShipCard({ ship, players }: Props) {
  const updateShip   = useMojoStore((s) => s.updateShip)
  const removeShip   = useMojoStore((s) => s.removeShip)
  const updatePlayer = useMojoStore((s) => s.updatePlayer)
  const removePlayer = useMojoStore((s) => s.removePlayer)

  const [collapsed, setCollapsed]       = useState(false)
  const [editLocation, setEditLocation] = useState(false)
  const [locationDraft, setLocationDraft] = useState(ship.location)

  const crew       = players.filter((p) => p.shipId === ship.id)
  const borderColor = SHIP_TYPE_COLORS[ship.type]
  const statusMeta  = SHIP_STATUS_LABELS[ship.status]

  function saveLocation() {
    updateShip(ship.id, { location: locationDraft.trim() || ship.location })
    setEditLocation(false)
  }

  return (
    <div className={`bg-slate-900/70 border rounded-xl overflow-hidden transition-all ${borderColor}`}>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/60">
        <span className="text-lg" aria-hidden="true">{SHIP_TYPE_ICON[ship.type]}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-100">{ship.name}</span>
            <span className="text-xs text-slate-500 font-mono">{ship.model}</span>
            <Badge className={statusMeta.cls}>{statusMeta.label}</Badge>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-600 flex-shrink-0" />
            {editLocation ? (
              <input
                autoFocus
                value={locationDraft}
                onChange={(e) => setLocationDraft(e.target.value)}
                onBlur={saveLocation}
                onKeyDown={(e) => { if (e.key === 'Enter') saveLocation(); if (e.key === 'Escape') setEditLocation(false) }}
                className="text-[11px] font-mono bg-slate-950 border border-amber-500/40 text-slate-300 rounded px-1.5 py-0.5 focus:outline-none w-48"
              />
            ) : (
              <button
                onClick={() => { setLocationDraft(ship.location); setEditLocation(true) }}
                className="text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {ship.location}
              </button>
            )}
          </div>
        </div>

        <select
          value={ship.status}
          onChange={(e) => updateShip(ship.id, { status: e.target.value as Ship['status'] })}
          className="bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 rounded px-2 py-1 focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="active">Active</option>
          <option value="transit">Transit</option>
          <option value="docked">Docked</option>
          <option value="standby">Standby</option>
        </select>

        <span className="text-[11px] font-mono text-slate-500">{crew.length} crew</span>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-slate-600 hover:text-slate-400 transition-colors cursor-pointer p-0.5"
        >
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        <button
          onClick={() => removeShip(ship.id)}
          className="text-slate-700 hover:text-red-400 transition-colors cursor-pointer p-0.5"
          title="Remove ship"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {!collapsed && (
        <div className="divide-y divide-slate-800/40">
          {crew.length === 0 ? (
            <div className="px-4 py-4 text-[11px] text-slate-600 font-mono text-center">
              No crew assigned — enlist pilots and assign them to this ship
            </div>
          ) : (
            crew.map((player) => (
              <PlayerRow
                key={player.id}
                player={player}
                onStatusChange={(status) => updatePlayer(player.id, { status })}
                onRemove={() => removePlayer(player.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── PlayerRow ────────────────────────────────────────────────────────────────

interface PlayerRowProps {
  player: Player
  onStatusChange: (s: PlayerStatus) => void
  onRemove: () => void
}

function PlayerRow({ player, onStatusChange, onRemove }: PlayerRowProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/20 transition-colors">
      <Avatar handle={player.handle} role={player.operationRole} size="sm" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-200">{player.handle}</span>
          {player.isFleetManager && (
            <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded">
              Fleet Manager
            </span>
          )}
          <RoleBadge role={player.operationRole} />
        </div>
        <div className="text-[10px] text-slate-500 font-mono capitalize mt-0.5">
          {player.shipRole.replace('_', ' ')}
        </div>
      </div>

      <select
        value={player.status}
        onChange={(e) => onStatusChange(e.target.value as PlayerStatus)}
        className="bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 rounded px-2 py-1 focus:outline-none focus:border-amber-500 cursor-pointer"
      >
        {PLAYER_STATUSES.map((s) => (
          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
        ))}
      </select>

      <StatusBadge status={player.status} />

      <button
        onClick={onRemove}
        className="text-slate-700 hover:text-red-400 transition-colors cursor-pointer p-0.5"
        title="Remove player"
      >
        <UserMinus className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}