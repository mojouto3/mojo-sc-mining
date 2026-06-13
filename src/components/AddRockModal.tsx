import { useState } from 'react'
import { X, Plus, Trash2, MapPin } from 'lucide-react'
import { useMojoStore } from '@/store'
import { Btn } from '@/components/ui'
import type { OreDeposit } from '@/types'

const COMMON_ORES = [
  'Quantainium', 'Bexalite', 'Taranite', 'Borase', 'Stileron',
  'Laranite', 'Agricium', 'Beryl', 'Diamond', 'Gold',
  'Hephaestanite', 'Janalite', 'Lumicite', 'Phaularcite', 'Titanium',
]

interface Props {
  onClose: () => void
  scoutHandle: string
}

export function AddRockModal({ onClose, scoutHandle }: Props) {
  const addRock = useMojoStore((s) => s.addRock)

  const [location, setLocation] = useState('')
  const [notes, setNotes]       = useState('')
  const [ores, setOres]         = useState<OreDeposit[]>([
    { materialId: 'Quantainium', percentage: 0 },
  ])

  function addOre() {
    setOres((prev) => [...prev, { materialId: '', percentage: 0 }])
  }

  function removeOre(idx: number) {
    setOres((prev) => prev.filter((_, i) => i !== idx))
  }

  function updateOre(idx: number, field: keyof OreDeposit, value: string | number) {
    setOres((prev) => prev.map((ore, i) => i === idx ? { ...ore, [field]: value } : ore))
  }

  function handleSubmit() {
    if (!location.trim()) return
    const validOres = ores.filter((o) => o.materialId && o.percentage > 0)
    addRock({
      location: location.trim(),
      scoutedBy: scoutHandle,
      ores: validOres,
      status: 'scouted',
      assignedMinerId: null,
      notes: notes.trim(),
    })
    onClose()
  }

  const totalPct = ores.reduce((s, o) => s + (Number(o.percentage) || 0), 0)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4 pb-4" style={{ background: 'rgba(2,8,23,0.88)' }}>
        <div className="w-full max-w-lg bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl flex flex-col max-h-[80vh]">

          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Pin Rock</h2>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-3 overflow-y-auto flex-1">

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Location</label>
              <input
                autoFocus
                type="text"
                placeholder='e.g. "Lyria OM-1 — Cluster Alpha"'
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-sm text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 placeholder-slate-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase">Ore composition</label>
                <div className="flex items-center gap-2">
                  {totalPct > 0 && (
                    <span className={`text-[10px] font-mono ${totalPct > 100 ? 'text-red-400' : 'text-slate-500'}`}>
                      Total: {Math.round(totalPct)}%
                    </span>
                  )}
                  <button onClick={addOre} className="text-[10px] font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer transition-colors">
                    <Plus className="w-3 h-3" /> Add ore
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {ores.map((ore, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={ore.materialId}
                      onChange={(e) => updateOre(idx, 'materialId', e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 cursor-pointer"
                    >
                      <option value="">Select ore...</option>
                      {COMMON_ORES.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <div className="flex items-center gap-1">
                      <input
                        type="number" min={0} max={100} step={0.1}
                        value={ore.percentage || ''}
                        onChange={(e) => updateOre(idx, 'percentage', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-16 bg-slate-950 border border-slate-800 text-xs text-amber-400 font-mono text-center rounded-lg px-2 py-1.5 focus:outline-none focus:border-sky-500"
                      />
                      <span className="text-xs text-slate-500 font-mono">%</span>
                    </div>
                    {ores.length > 1 && (
                      <button onClick={() => removeOre(idx)} className="text-slate-700 hover:text-red-400 transition-colors cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">
                Notes <span className="text-slate-600">(optional)</span>
              </label>
              <input
                type="text"
                placeholder='e.g. "High instability, keep laser at 35%"'
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-sm text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 placeholder-slate-600"
              />
            </div>

          </div>

          <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-800">
            <Btn onClick={onClose}>Cancel</Btn>
            <Btn variant="primary" onClick={handleSubmit} disabled={!location.trim()} className="bg-sky-500 hover:bg-sky-400">
              <MapPin className="w-3.5 h-3.5" /> Pin rock
            </Btn>
          </div>

        </div>
    </div>
  )
}
