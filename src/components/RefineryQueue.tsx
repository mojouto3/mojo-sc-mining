import { useState, useEffect } from 'react'
import { Plus, X, Clock, CheckCircle2, FlaskConical } from 'lucide-react'
import { useMojoStore } from '@/store'
import { Btn, Panel, PanelHeader, EmptyState } from '@/components/ui'
import type { RefineryJob, RefineMethod } from '@/types'

const REFINE_METHODS: RefineMethod[] = [
  'Cormack', 'Dinyan', 'Ferron', 'Gallow', 'Pyrometric', 'Electrostarolysis', 'Kazen',
]

const REFINERY_STATIONS = [
  'ARC-L1 Wide Forest Station',
  'ARC-L2 Lively Pathway Station',
  'ARC-L3 Modern Express Station',
  'ARC-L4 Faint Glen Station',
  'ARC-L5 Yellow Core Station',
  'CRU-L1 Ambitious Dream Station',
  'HUR-L1 Green Glade Station',
  'HUR-L2 Faithful Dream Station',
  'MIC-L1 Shallow Frontier Station',
  'MIC-L2 Long Forest Station',
  'POB Mining Station',
]

const COMMON_MATERIALS = [
  'Quantainium', 'Bexalite', 'Taranite', 'Borase', 'Stileron',
  'Laranite', 'Agricium', 'Beryl', 'Diamond', 'Gold', 'Titanium',
]

function formatTime(ms: number): string {
  if (ms <= 0) return 'Ready'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function getProgress(job: RefineryJob): number {
  if (job.status === 'done') return 100
  if (job.status === 'queued') return 0
  const total = job.endsAt - job.startedAt
  const elapsed = Date.now() - job.startedAt
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
}

interface AddJobFormProps { onClose: () => void }

function AddJobForm({ onClose }: AddJobFormProps) {
  const operation      = useMojoStore((s) => s.operation)
  const addRefineryJob = useMojoStore((s) => s.addRefineryJob)

  const [material, setMaterial]   = useState('Quantainium')
  const [scu, setScu]             = useState<number>(0)
  const [method, setMethod]       = useState<RefineMethod>('Cormack')
  const [station, setStation]     = useState(REFINERY_STATIONS[0])
  const [fee, setFee]             = useState<number>(0)
  const [durationH, setDurationH] = useState<number>(2)
  const [estValue, setEstValue]   = useState<number>(0)
  const [paidBy, setPaidBy]       = useState(operation.players[0]?.id ?? '')

  function handleSubmit() {
    if (!material || scu <= 0) return
    const now = Date.now()
    const durationMs = durationH * 3600 * 1000
    addRefineryJob({
      materialId:         material.toLowerCase().replace(' ', '_'),
      materialName:       material,
      quantitySCU:        scu,
      method,
      stationId:          station.toLowerCase().replace(/\s+/g, '_'),
      stationName:        station,
      status:             'processing',
      startedAt:          now,
      endsAt:             now + durationMs,
      feePaid:            fee,
      paidByPlayerId:     paidBy,
      yieldMultiplier:    0.85,
      estimatedValueAUEC: estValue,
    })
    onClose()
  }

  return (
    <div className="bg-slate-950/95 border border-slate-700/60 rounded-xl p-4 space-y-3">
      <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
        New refinery job
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Material</label>
          <select value={material} onChange={(e) => setMaterial(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer">
            {COMMON_MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">SCU</label>
          <input type="number" min={1} value={scu || ''} onChange={(e) => setScu(Number(e.target.value))}
            placeholder="32"
            className="w-full bg-slate-900 border border-slate-800 text-xs text-amber-400 font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500" />
        </div>
        <div>
          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Method</label>
          <select value={method} onChange={(e) => setMethod(e.target.value as RefineMethod)}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer">
            {REFINE_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Station</label>
          <select value={station} onChange={(e) => setStation(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer">
            {REFINERY_STATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Duration (hours)</label>
          <input type="number" min={0.1} step={0.5} value={durationH || ''} onChange={(e) => setDurationH(Number(e.target.value))}
            placeholder="2"
            className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500" />
        </div>
        <div>
          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Fee (aUEC)</label>
          <input type="number" min={0} value={fee || ''} onChange={(e) => setFee(Number(e.target.value))}
            placeholder="24000"
            className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500" />
        </div>
        <div>
          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Est. value (aUEC)</label>
          <input type="number" min={0} value={estValue || ''} onChange={(e) => setEstValue(Number(e.target.value))}
            placeholder="612000"
            className="w-full bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500" />
        </div>
        <div>
          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Fee paid by</label>
          <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer">
            {operation.players.map((p) => <option key={p.id} value={p.id}>{p.handle}</option>)}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={handleSubmit} disabled={scu <= 0}>
          <FlaskConical className="w-3.5 h-3.5" /> Add job
        </Btn>
      </div>
    </div>
  )
}

export function RefineryQueue() {
  const operation        = useMojoStore((s) => s.operation)
  const updateRefineryJob = useMojoStore((s) => s.updateRefineryJob)
  const removeRefineryJob = useMojoStore((s) => s.removeRefineryJob)

  const [showForm, setShowForm] = useState(false)
  const [tick, setTick]         = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    operation.refineryJobs.forEach((job) => {
      if (job.status === 'processing' && Date.now() >= job.endsAt) {
        updateRefineryJob(job.id, { status: 'done' })
      }
    })
  }, [tick])

  const { refineryJobs } = operation
  const active = refineryJobs.filter((j) => j.status !== 'done')
  const done   = refineryJobs.filter((j) => j.status === 'done')

  return (
    <Panel>
      <PanelHeader
        title={<span className="flex items-center gap-2"><FlaskConical className="w-3.5 h-3.5 text-violet-400" /> Refinery Queue</span>}
        subtitle={`${active.length} active · ${done.length} done`}
        action={<Btn onClick={() => setShowForm((v) => !v)}><Plus className="w-3.5 h-3.5" /> Add job</Btn>}
      />
      <div className="p-4 space-y-3">
        {showForm && <AddJobForm onClose={() => setShowForm(false)} />}
        {refineryJobs.length === 0 && !showForm ? (
          <EmptyState
            icon={<FlaskConical className="w-8 h-8" />}
            message="No refinery jobs yet."
            action={<Btn onClick={() => setShowForm(true)}><Plus className="w-3.5 h-3.5" /> Add first job</Btn>}
          />
        ) : (
          <div className="space-y-2">
            {[...active, ...done].map((job) => {
              const progress  = getProgress(job)
              const remaining = job.endsAt - Date.now()
              const isDone    = job.status === 'done'
              return (
                <div key={job.id} className={`bg-slate-950/60 border rounded-lg p-3 space-y-2 transition-all ${isDone ? 'border-emerald-500/20' : 'border-slate-800/60'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {isDone
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        : <Clock className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 animate-pulse-slow" />
                      }
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {job.quantitySCU} SCU {job.materialName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{job.method}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[11px] font-mono font-bold ${isDone ? 'text-emerald-400' : 'text-violet-400'}`}>
                        {isDone ? '✓ Ready' : formatTime(remaining)}
                      </span>
                      <button onClick={() => removeRefineryJob(job.id)}
                        className="text-slate-700 hover:text-red-400 transition-colors cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${isDone ? 'bg-emerald-500' : 'bg-violet-500'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>{job.stationName}</span>
                    <span>Fee: {job.feePaid.toLocaleString()} aUEC · Est: <span className="text-emerald-400">{job.estimatedValueAUEC.toLocaleString()}</span></span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Panel>
  )
}