import { useState } from 'react'
import { X, Plus, Trash2, MapPin, Radar } from 'lucide-react'
import { useMojoStore } from '@/store'
import type { OreDeposit } from '@/types'
import { Btn, Combobox } from '@/components/ui'
import { identifyCluster, TIER_COLORS, type SignatureMatch } from '@/data/signatureData'

const COMMON_ORES = [
  'Quantainium', 'Bexalite', 'Taranite', 'Borase', 'Stileron',
  'Laranite', 'Agricium', 'Beryl', 'Gold', 'Titanium',
  'Tungsten', 'Hephestanite', 'Tin', 'Quartz', 'Corundum',
  'Copper', 'Silicon', 'Iron', 'Aluminium', 'Ice',
  'Savrilium', 'Ouratite', 'Riccite', 'Lindinium', 'Aslarite', 'Torite',
]

const LOCATIONS = [
  { value: 'Aaron Halo',   label: 'Aaron Halo',   group: 'Asteroid Belt' },
  { value: 'Crusader',     label: 'Crusader',     group: 'Stanton' },
  { value: 'Cellin',       label: 'Cellin',       group: 'Stanton' },
  { value: 'Daymar',       label: 'Daymar',       group: 'Stanton' },
  { value: 'Yela',         label: 'Yela',         group: 'Stanton' },
  { value: 'ArcCorp',      label: 'ArcCorp',      group: 'Stanton' },
  { value: 'Wala',         label: 'Wala',         group: 'Stanton' },
  { value: 'Aberdeen',     label: 'Aberdeen',     group: 'Stanton' },
  { value: 'MicroTech',    label: 'MicroTech',    group: 'Stanton' },
  { value: 'Calliope',     label: 'Calliope',     group: 'Stanton' },
  { value: 'Clio',         label: 'Clio',         group: 'Stanton' },
  { value: 'Euterpe',      label: 'Euterpe',      group: 'Stanton' },
  { value: 'Hurston',      label: 'Hurston',      group: 'Stanton' },
  { value: 'Arial',        label: 'Arial',        group: 'Stanton' },
  { value: 'Magda',        label: 'Magda',        group: 'Stanton' },
  { value: 'Ita',          label: 'Ita',          group: 'Stanton' },
  { value: 'Glaciem Ring', label: 'Glaciem Ring', group: 'Pyro' },
  { value: 'Pyro I',       label: 'Pyro I',       group: 'Pyro' },
  { value: 'Monox',        label: 'Monox',        group: 'Pyro' },
  { value: 'Fuego',        label: 'Fuego',        group: 'Pyro' },
  { value: 'Bloom',        label: 'Bloom',        group: 'Pyro' },
  { value: 'Terminus',     label: 'Terminus',     group: 'Pyro' },
  { value: 'Pyro VI',      label: 'Pyro VI',      group: 'Pyro' },
]

interface Props {
  onClose: () => void
  scoutHandle: string
}

export function AddRockModal({ onClose, scoutHandle }: Props) {
  const addRock = useMojoStore((s) => s.addRock)
  const [location, setLocation] = useState('')
  const [mass, setMass]         = useState<number | ''>('')
  const [notes, setNotes]       = useState('')
  const [signature, setSignature] = useState<number | ''>('')
  const [ores, setOres]         = useState<OreDeposit[]>([
    { materialId: 'Quantainium', percentage: 0 },
  ])

  const matches: SignatureMatch[] = signature !== '' ? identifyCluster(Number(signature)) : []
  const topMatches = matches.slice(0, 3)

  function addOre() {
    setOres((prev) => [...prev, { materialId: '', percentage: 0 }])
  }

  function removeOre(idx: number) {
    setOres((prev) => prev.filter((_, i) => i !== idx))
  }

  function updateOre(idx: number, field: keyof OreDeposit, value: string | number) {
    setOres((prev) => prev.map((ore, i) => i === idx ? { ...ore, [field]: value } : ore))
  }

  function applyMatch(match: SignatureMatch) {
    setOres([{ materialId: match.entry.ore, percentage: 100 }])
    setNotes((prev) => {
      const tag = `Signature ${signature} → ${match.entry.ore} × ${match.nodeCount} node${match.nodeCount > 1 ? 's' : ''} (${match.confidence}% match)`
      return prev ? `${prev}\n${tag}` : tag
    })
  }

  function handleSubmit() {
    if (!location) return
    const validOres = ores.filter((o) => o.materialId && o.percentage > 0)
    addRock({
      location,
      scoutedBy: scoutHandle,
      ores: validOres,
      status: 'scouted',
      assignedMinerId: null,
      notes: notes.trim(),
      mass: mass === '' ? undefined : mass,
    })
    onClose()
  }

  const totalPct = ores.reduce((s, o) => s + (Number(o.percentage) || 0), 0)

  return (
    <div className="modal-overlay">
      <div className="modal-content-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Pin Rock</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Location</label>
              <Combobox value={location} onChange={setLocation} placeholder="Select location..." options={LOCATIONS} />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">
                Mass <span className="text-slate-600">(optional)</span>
              </label>
              <input
                type="number" min={0} placeholder="e.g. 2700" value={mass}
                onChange={(e) => setMass(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-sm text-amber-400 font-mono rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 placeholder-slate-600"
              />
            </div>
          </div>

          {/* Signature lookup */}
          <div className="bg-slate-950/60 border border-violet-500/20 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Radar className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
              <label className="text-[10px] font-mono text-violet-300 uppercase">
                Cluster signature lookup <span className="text-slate-600">(optional — RS reading from scan)</span>
              </label>
            </div>
            <input
              type="number"
              min={0}
              placeholder="e.g. 18000"
              value={signature}
              onChange={(e) => setSignature(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 text-sm text-violet-300 font-mono rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 placeholder-slate-600"
            />
            {signature !== '' && (
              topMatches.length === 0 ? (
                <div className="text-[11px] text-slate-600 font-mono">No match found for this signature.</div>
              ) : (
                <div className="space-y-1.5">
                  {topMatches.map((m, idx) => (
                    <button
                      key={`${m.entry.ore}-${m.nodeCount}`}
                      onClick={() => applyMatch(m)}
                      className="w-full flex items-center justify-between gap-2 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-violet-500/30 rounded-lg px-3 py-1.5 transition-all cursor-pointer text-left"
                    >
                      <span className="flex items-center gap-2">
                        <span className={`text-xs font-mono font-bold ${TIER_COLORS[m.entry.tier]}`}>{m.entry.ore}</span>
                        <span className="text-[10px] font-mono text-slate-500">× {m.nodeCount} node{m.nodeCount > 1 ? 's' : ''}</span>
                      </span>
                      <span className={`text-[10px] font-mono ${m.confidence >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {m.confidence}% match
                      </span>
                    </button>
                  ))}
                </div>
              )
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
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
                  <Combobox
                    value={ore.materialId}
                    onChange={(v) => updateOre(idx, 'materialId', v)}
                    placeholder="Select ore..."
                    options={COMMON_ORES.map((o) => ({ value: o, label: o }))}
                    className="flex-1"
                  />
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
            <textarea
              rows={2}
              placeholder='e.g. "High instability, keep laser at 35%"'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-sm text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 placeholder-slate-600 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-800">
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSubmit} disabled={!location} className="bg-sky-500 hover:bg-sky-400">
            <MapPin className="w-3.5 h-3.5" /> Pin rock
          </Btn>
        </div>
      </div>
    </div>
  )
}