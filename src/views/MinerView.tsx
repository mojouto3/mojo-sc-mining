import { useState } from 'react'
import { Hammer, Bell, Plus, Minus, X } from 'lucide-react'
import { useMojoStore } from '@/store'
import { EmptyState, Panel, PanelHeader, Avatar, RoleBadge, Combobox } from '@/components/ui'
import { getShipCapacity } from '@/data/shipData'

const COMMON_ORES = [
  'Quantainium', 'Bexalite', 'Taranite', 'Borase', 'Stileron',
  'Laranite', 'Agricium', 'Beryl', 'Diamond', 'Gold',
  'Hephaestanite', 'Titanium', 'Iron', 'Corundum', 'Aluminum',
]

interface MinerViewProps {
  currentPlayerId: string
}

export function MinerView({ currentPlayerId }: MinerViewProps) {
  const operation    = useMojoStore((s) => s.operation)
  const updatePlayer = useMojoStore((s) => s.updatePlayer)
  const updateRock   = useMojoStore((s) => s.updateRock)

  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('')
  const [newOreName, setNewOreName]             = useState('')

  const { players, ships, rocks } = operation

  const miners = players.filter((p) =>
    p.operationRole === 'miner' || p.operationRole === 'raw_hauler'
  )

  const selectedPlayer = miners.find((p) => p.id === selectedPlayerId) ?? miners[0]
  const selectedShip   = ships.find((s) => s.id === selectedPlayer?.shipId)
  const assignedRock   = rocks.find((r) => r.assignedMinerId === selectedPlayer?.id)
  const availableRocks = rocks.filter((r) => !r.assignedMinerId && r.status === 'scouted')

  const capacitySCU    = selectedShip ? getShipCapacity(selectedShip.model) : 32
  const cargoEntries   = assignedRock?.cargoEntries ?? []
  const totalFilledSCU = cargoEntries.reduce((s, e) => s + e.scu, 0)
  const fillPct        = Math.min(100, Math.round((totalFilledSCU / capacitySCU) * 100))
  const hasQuantainium = cargoEntries.some((e) => e.materialName === 'Quantainium' && e.scu > 0)

  function adjustCargo(materialId: string, materialName: string, delta: number) {
    if (!assignedRock) return
    const existing = cargoEntries.find((e) => e.materialId === materialId)
    let updated
    if (existing) {
      updated = cargoEntries
        .map((e) => e.materialId === materialId ? { ...e, scu: Math.max(0, e.scu + delta) } : e)
        .filter((e) => e.scu > 0)
    } else if (delta > 0) {
      updated = [...cargoEntries, { materialId, materialName, scu: delta }]
    } else return
    updateRock(assignedRock.id, { cargoEntries: updated })
  }

  function addNewOre() {
    if (!newOreName || !assignedRock) return
    adjustCargo(newOreName.toLowerCase(), newOreName, 1)
    setNewOreName('')
  }

  function callForSwap() {
    if (!selectedPlayer) return
    updatePlayer(selectedPlayer.id, { status: 'swapping' })
  }

  function clearCargo() {
    if (!assignedRock) return
    updateRock(assignedRock.id, { cargoEntries: [] })
    if (selectedPlayer) updatePlayer(selectedPlayer.id, { status: 'mining' })
  }

  // All ores to show — union of rock ores + cargo entries
  const allOreIds = new Set([
    ...(assignedRock?.ores.map((o) => o.materialId) ?? []),
    ...cargoEntries.map((e) => e.materialId),
  ])

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
            Assigned rock, cargo tracking, bag swap
          </p>
        </div>

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left — Rock info */}
          <div className="space-y-4">

            {/* Player info */}
            <Panel>
              <PanelHeader title="Miner" />
              <div className="p-4 flex items-center gap-3">
                <Avatar handle={selectedPlayer?.handle ?? ''} role="miner" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-200">{selectedPlayer?.handle}</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                    {selectedShip ? `${selectedShip.model} · ${capacitySCU} SCU capacity` : 'No ship assigned'}
                  </div>
                </div>
                {selectedPlayer && <RoleBadge role={selectedPlayer.operationRole} />}
              </div>
            </Panel>

            {/* Assigned rock */}
            <Panel>
              <PanelHeader title="Assigned rock" />
              {assignedRock ? (
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-200">{assignedRock.location}</span>
                    {assignedRock.mass && (
                      <span className="text-[11px] font-mono text-slate-400">
                        Mass: <span className="text-amber-400">{assignedRock.mass}</span>
                      </span>
                    )}
                  </div>

                  {assignedRock.ores.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Scout data</div>
                      {assignedRock.ores
                        .sort((a, b) => b.percentage - a.percentage)
                        .map((ore, idx) => (
                          <div key={ore.materialId} className="flex items-center gap-2">
                            <span className={`text-xs font-mono font-bold w-24 truncate ${
                              idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-sky-400' : 'text-emerald-400'
                            }`}>
                              {ore.materialId}
                            </span>
                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-sky-500' : 'bg-emerald-500'
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

                  <button
                    onClick={() => updateRock(assignedRock.id, { assignedMinerId: null, status: 'scouted' })}
                    className="text-[10px] font-mono text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    Unassign rock
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  <div className="text-center text-xs text-slate-600 font-mono">No rock assigned yet</div>
                  {availableRocks.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Available rocks</div>
                      {availableRocks.map((rock) => (
                        <div key={rock.id} className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-slate-200">{rock.location}</div>
                            <div className="text-[10px] font-mono text-slate-500">
                              {rock.ores.map((o) => `${o.materialId} ${o.percentage}%`).join(' · ')}
                              {rock.mass && ` · mass ${rock.mass}`}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (selectedPlayer) {
                                updateRock(rock.id, { assignedMinerId: selectedPlayer.id, status: 'en_route' })
                                updatePlayer(selectedPlayer.id, { status: 'mining' })
                              }
                            }}
                            className="text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer whitespace-nowrap"
                          >
                            On my way
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Panel>
          </div>

          {/* Right — Cargo tracker */}
          <div className="space-y-4">
            <Panel>
              <PanelHeader
                title="Cargo"
                subtitle={selectedShip ? `${selectedShip.model} · ${capacitySCU} SCU` : 'No ship'}
                action={
                  totalFilledSCU > 0 ? (
                    <button onClick={clearCargo} className="text-[10px] font-mono text-slate-500 hover:text-red-400 transition-colors cursor-pointer">
                      Clear
                    </button>
                  ) : undefined
                }
              />
              <div className="p-4 space-y-4">

                {/* Fill bar */}
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1.5">
                    <span className="text-slate-400">{totalFilledSCU} SCU filled</span>
                    <span className={fillPct >= 90 ? 'text-orange-400 font-bold' : 'text-slate-500'}>
                      {fillPct}% · {capacitySCU - totalFilledSCU} SCU free
                    </span>
                  </div>
                  <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        fillPct >= 90 ? 'bg-orange-500' :
                        fillPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>

                {/* Volatile warning */}
                {hasQuantainium && (
                  <div className="flex items-center gap-2 text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
                    ⚠️ Quantainium in cargo — deliver to refinery ASAP
                  </div>
                )}

                {/* Ore entries */}
                <div className="space-y-2">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Extracted ore</div>

                  {allOreIds.size === 0 && (
                    <div className="text-[11px] text-slate-600 font-mono text-center py-2">
                      Add ore below as you extract
                    </div>
                  )}

                  {[...allOreIds].map((oreId) => {
                    const entry = cargoEntries.find((e) => e.materialId === oreId)
                    const scu = entry?.scu ?? 0
                    const name = entry?.materialName ?? oreId
                    return (
                      <div key={oreId} className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-300 flex-1 truncate">{name}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => adjustCargo(oreId, name, -1)}
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                          >
                            <Minus className="w-3 h-3 text-slate-400" />
                          </button>
                          <span className="text-sm font-mono font-bold text-amber-400 w-8 text-center">{scu}</span>
                          <button
                            onClick={() => adjustCargo(oreId, name, 1)}
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                          >
                            <Plus className="w-3 h-3 text-slate-400" />
                          </button>
                          <span className="text-[10px] font-mono text-slate-600">SCU</span>
                        </div>
                      </div>
                    )
                  })}

                  {/* Add new ore */}
                  {assignedRock && (
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800/40">
                      <Combobox
                        value={newOreName}
                        onChange={setNewOreName}
                        placeholder="Add ore..."
                        options={COMMON_ORES.map((o) => ({ value: o, label: o }))}
                        className="flex-1"
                      />
                      <button
                        onClick={addNewOre}
                        disabled={!newOreName}
                        className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Call for swap */}
                <button
                  onClick={callForSwap}
                  disabled={totalFilledSCU === 0 || selectedPlayer?.status === 'swapping'}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border font-mono font-bold text-xs uppercase tracking-wide transition-all cursor-pointer ${
                    selectedPlayer?.status === 'swapping'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 animate-pulse'
                      : fillPct >= 90
                      ? 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20 text-orange-400'
                      : 'bg-slate-800/40 border-slate-700 text-slate-500 disabled:cursor-not-allowed'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  {selectedPlayer?.status === 'swapping' ? 'Swap requested!' : 'Call for swap'}
                </button>

              </div>
            </Panel>
          </div>

        </div>
      )}
    </div>
  )
}