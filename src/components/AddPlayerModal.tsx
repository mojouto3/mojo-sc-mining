import { useState } from 'react'
import { X, UserPlus } from 'lucide-react'
import { useMojoStore } from '@/store'
import { Btn, ROLE_LABELS } from '@/components/ui'
import type { OperationRole, ShipRole } from '@/types'

const OPERATION_ROLES: OperationRole[] = ['scout', 'miner', 'raw_hauler', 'refine_hauler']

const SHIP_ROLE_LABELS: Record<ShipRole, string> = {
  pilot:          'Pilot',
  laser_operator: 'Laser Operator',
  bag_swapper:    'Bag Swapper',
  cargo_crew:     'Cargo Crew',
  co_pilot:       'Co-Pilot',
}

const SHIP_ROLES_FOR: Record<OperationRole, ShipRole[]> = {
  scout:         ['pilot', 'co_pilot'],
  miner:         ['pilot', 'laser_operator', 'bag_swapper'],
  raw_hauler:    ['pilot', 'cargo_crew', 'bag_swapper'],
  refine_hauler: ['pilot', 'cargo_crew'],
}

interface Props { onClose: () => void }

export function AddPlayerModal({ onClose }: Props) {
  const operation = useMojoStore((s) => s.operation)
  const addPlayer = useMojoStore((s) => s.addPlayer)

  const [handle, setHandle]               = useState('')
  const [operationRole, setOperationRole] = useState<OperationRole>('miner')
  const [shipRole, setShipRole]           = useState<ShipRole>('pilot')
  const [shipId, setShipId]               = useState<string>('')
  const [shareWeight, setShareWeight]     = useState(1)

  const availableShipRoles = SHIP_ROLES_FOR[operationRole]

  function handleOpRoleChange(role: OperationRole) {
    setOperationRole(role)
    const roles = SHIP_ROLES_FOR[role]
    if (!roles.includes(shipRole)) setShipRole(roles[0])
  }

  function handleSubmit() {
    if (!handle.trim()) return
    addPlayer({
  handle: handle.trim(),
  operationRole,
  shipRole,
  shipId: shipId || null,
  status: 'standby',
  shareWeight,
  isFleetManager: false,
})
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4 pb-4" style={{ background: 'rgba(2,8,23,0.88)' }}>
        <div className="w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl flex flex-col max-h-[80vh]">

          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <UserPlus className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Enlist Pilot</h2>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-3 overflow-y-auto flex-1">

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">In-game handle</label>
              <input
                autoFocus
                type="text"
                placeholder="e.g. StarMinerX"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="w-full bg-slate-950 border border-slate-800 text-sm text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Operation role</label>
              <select
                value={operationRole}
                onChange={(e) => handleOpRoleChange(e.target.value as OperationRole)}
                className="w-full bg-slate-950 border border-slate-800 text-sm text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {OPERATION_ROLES.map((role) => (
                  <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Ship role</label>
              <select
                value={shipRole}
                onChange={(e) => setShipRole(e.target.value as ShipRole)}
                className="w-full bg-slate-950 border border-slate-800 text-sm text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {availableShipRoles.map((r) => (
                  <option key={r} value={r}>{SHIP_ROLE_LABELS[r]}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Assign to ship</label>
                <select
                  value={shipId}
                  onChange={(e) => setShipId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-sm text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="">— Unassigned —</option>
                  {operation.ships.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.model})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Share weight</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={shareWeight}
                  onChange={(e) => setShareWeight(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 text-sm text-amber-500 font-mono text-center rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-800">
            <Btn onClick={onClose}>Cancel</Btn>
            <Btn variant="primary" onClick={handleSubmit} disabled={!handle.trim()}>
              Enlist pilot
            </Btn>
          </div>

        </div>
    </div>
  )
}
