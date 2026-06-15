import { useState } from 'react'
import { useMojoStore } from '@/store'
import { useShallow } from 'zustand/react/shallow'
import { Panel, PanelHeader, Btn, Avatar, Badge } from '@/components/ui'
import { DollarSign, FlaskConical, ShoppingCart, Copy, Check, Plus } from 'lucide-react'
import type { RefineryJob } from '@/types'

const REFINERY_METHODS = [
  { id: 'cormack',  name: 'Cormack',  yield: 0.91, speed: 'Slow',   cost: 'Low' },
  { id: 'dinyx',    name: 'Dinyx',    yield: 0.85, speed: 'Medium', cost: 'Medium' },
  { id: 'electrox', name: 'Electrox', yield: 0.85, speed: 'Fast',   cost: 'High' },
  { id: 'ferron',   name: 'Ferron',   yield: 0.82, speed: 'Fast',   cost: 'High' },
  { id: 'gaskin',   name: 'Gaskin',   yield: 0.88, speed: 'Medium', cost: 'Medium' },
  { id: 'kayen',    name: 'Kayen',    yield: 0.91, speed: 'Slow',   cost: 'Low' },
  { id: 'tatoo',    name: 'Tatoo',    yield: 0.82, speed: 'Fast',   cost: 'High' },
  { id: 'xcr',      name: 'XCR',      yield: 0.76, speed: 'Fast',   cost: 'Very High' },
]

const REFINERY_STATIONS = [
  'ARC-L1 Wide Forest Station',
  'ARC-L2 Lively Pathway Station',
  'ARC-L3 Modern Icarus Station',
  'ARC-L4 Faint Glen Station',
  'ARC-L5 Yellow Core Station',
  'CRU-L1 Ambitious Dream Station',
  'CRU-L4 Shallow Fields Station',
  'CRU-L5 Beautiful Glen Station',
  'HUR-L1 Green Glade Station',
  'HUR-L2 Faithful Dream Station',
  'HUR-L3 Thundering Express Station',
  'HUR-L4 Melodic Fields Station',
  'HUR-L5 High Course Station',
  'MIC-L1 Shallow Frontier Station',
  'MIC-L2 Long Forest Station',
  'MIC-L3 Endless Odyssey Station',
  'MIC-L4 Red Crossroads Station',
  'MIC-L5 Modern Icarus Station',
  'POB-L1 Pyro Gateway Station',
]

interface SummaryViewProps {
  currentPlayerId: string
}

export function SummaryView({ currentPlayerId }: SummaryViewProps) {
  const operation      = useMojoStore((s) => s.operation)
  const addRefineryJob = useMojoStore((s) => s.addRefineryJob)
  const updateRefineryJob = useMojoStore((s) => s.updateRefineryJob)
  const players        = operation.players
  const jobs           = operation.refineryJobs

  const [showAddJob, setShowAddJob] = useState(false)
  const [copiedCmd, setCopiedCmd]   = useState<string | null>(null)
  const [splitMode, setSplitMode]   = useState<'equal' | 'custom'>('equal')

  // My jobs
  const myJobs = jobs.filter((j) => j.paidByPlayerId === currentPlayerId)

  // Totals
  const totalRevenue = jobs.reduce((s, j) => s + (j.actualSaleAUEC ?? 0), 0)
  const totalFees    = jobs.reduce((s, j) => s + j.feePaid, 0)
  const netProfit    = totalRevenue - totalFees

  // Payout calculation
  const activePlayers = players.filter((p) => p.status !== 'offline')
  const share         = activePlayers.length > 0 ? Math.floor(netProfit / activePlayers.length) : 0

  // Per player: base share + fee reimbursement
  const payouts = activePlayers.map((p) => {
    const myFees = jobs.filter((j) => j.paidByPlayerId === p.id).reduce((s, j) => s + j.feePaid, 0)
    const mySales = jobs.filter((j) => j.paidByPlayerId === p.id).reduce((s, j) => s + (j.actualSaleAUEC ?? 0), 0)
    return { player: p, share, feeReimbursement: myFees, total: share + myFees, mySales }
  })

  // Who owes what — seller keeps their sales, pays others
  const sellerPayouts = payouts.map((po) => {
    const owes = po.total - po.mySales
    return { ...po, owes }
  })

  function copyCmd(handle: string, amount: number) {
    const cmd = `/transfer ${handle} ${amount}`
    navigator.clipboard.writeText(cmd).catch(() => {})
    setCopiedCmd(handle)
    setTimeout(() => setCopiedCmd(null), 2000)
  }

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-500" />
            Session Summary
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Refinery jobs, sales, payout
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Gross revenue', value: totalRevenue.toLocaleString(), sub: 'aUEC settled', color: 'text-emerald-400' },
          { label: 'In progress', value: jobs.filter(j => j.status === 'processing').length.toString(), sub: 'refinery jobs', color: 'text-violet-400' },
          { label: 'Total fees', value: totalFees.toLocaleString(), sub: 'aUEC expenses', color: 'text-red-400' },
          { label: 'Net profit', value: netProfit.toLocaleString(), sub: 'ready to split', color: 'text-amber-400' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">{s.label}</div>
            <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
            <div className="text-[10px] font-mono text-slate-600 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Refinery Jobs */}
        <Panel>
          <PanelHeader
            title={<span className="flex items-center gap-2"><FlaskConical className="w-3.5 h-3.5" /> Refinery jobs</span>}
            action={<Btn onClick={() => setShowAddJob(true)}><Plus className="w-3 h-3" /> Add job</Btn>}
          />
          <div className="divide-y divide-slate-800/40">
            {jobs.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-600 font-mono">No refinery jobs yet</div>
            ) : (
              jobs.map((job) => (
                <JobRow
                  key={job.id}
                  job={job}
                  players={players}
                  currentPlayerId={currentPlayerId}
                  onUpdate={(patch) => updateRefineryJob(job.id, patch)}
                />
              ))
            )}
          </div>
        </Panel>

        {/* Payout */}
        <Panel>
          <PanelHeader
            title={<span className="flex items-center gap-2"><ShoppingCart className="w-3.5 h-3.5" /> Payout</span>}
            action={
              <div className="flex gap-1">
                <button
                  onClick={() => setSplitMode('equal')}
                  className={`text-[10px] font-mono px-2 py-1 rounded border transition-all cursor-pointer ${splitMode === 'equal' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                >Equal</button>
              </div>
            }
          />
          <div className="divide-y divide-slate-800/40">
            {activePlayers.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-600 font-mono">No active players</div>
            ) : (
              sellerPayouts.map((po) => (
                <div key={po.player.id} className="flex items-center gap-3 px-4 py-3">
                  <Avatar handle={po.player.handle} role={po.player.operationRole} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-200">{po.player.handle}</div>
                    <div className="text-[10px] font-mono text-slate-500">
                      Share: {po.share.toLocaleString()} + fees: {po.feeReimbursement.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-amber-400">{po.total.toLocaleString()}</div>
                    <div className="text-[10px] font-mono text-slate-500">aUEC</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* mo.TRADER commands */}
          {totalRevenue > 0 && (
            <div className="p-4 border-t border-slate-800 space-y-2">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">mo.TRADER commands</div>
              {sellerPayouts.map((po) => {
                if (po.player.id === currentPlayerId) return null
                if (po.total <= 0) return null
                const copied = copiedCmd === po.player.handle
                return (
                  <div key={po.player.id} className="flex items-center gap-2">
                    <code className="flex-1 text-[11px] font-mono text-slate-300 bg-slate-950 rounded px-2.5 py-1.5 truncate">
                      /transfer {po.player.handle} {po.total}
                    </code>
                    <button
                      onClick={() => copyCmd(po.player.handle, po.total)}
                      className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </Panel>
      </div>

      {/* Add Job Modal */}
      {showAddJob && (
        <AddJobModal
          currentPlayerId={currentPlayerId}
          players={players}
          onClose={() => setShowAddJob(false)}
          onAdd={(job) => { addRefineryJob(job); setShowAddJob(false) }}
        />
      )}
    </div>
  )
}

// ─── JobRow ───────────────────────────────────────────────────────────────────

function JobRow({ job, players, currentPlayerId, onUpdate }: {
  job: RefineryJob
  players: ReturnType<typeof useMojoStore.getState>['operation']['players']
  currentPlayerId: string
  onUpdate: (patch: Partial<RefineryJob>) => void
}) {
  const [editSale, setEditSale] = useState(false)
  const [saleInput, setSaleInput] = useState(job.actualSaleAUEC?.toString() ?? '')

  const seller = players.find((p) => p.id === job.paidByPlayerId)
  const isMine = job.paidByPlayerId === currentPlayerId

  const statusColors: Record<string, string> = {
    processing: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    done:       'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    collected:  'bg-slate-500/10 text-slate-400 border-slate-500/20',
  }

  return (
    <div className={`px-4 py-3 space-y-1.5 ${!isMine ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-slate-200">{job.materialName}</span>
        <span className="text-[10px] font-mono text-slate-500">{job.quantitySCU} SCU · {job.method}</span>
        <Badge className={statusColors[job.status] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/20'}>
          {job.status}
        </Badge>
        {!isMine && seller && (
          <span className="text-[10px] font-mono text-slate-600">{seller.handle}</span>
        )}
      </div>
      <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
        <span>{job.stationName}</span>
        <span>Fee: {job.feePaid.toLocaleString()} aUEC</span>
        <span>Yield: {Math.round(job.yieldMultiplier * 100)}%</span>
      </div>
      {isMine && (
        <div className="flex items-center gap-2 pt-1">
          <div className="flex gap-1">
            {['processing', 'done', 'collected'].map((s) => (
              <button
                key={s}
                onClick={() => onUpdate({ status: s as any })}
                className={`text-[9px] font-mono px-2 py-0.5 rounded border cursor-pointer transition-all ${
                  job.status === s ? statusColors[s] : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {job.status === 'collected' && (
            editSale ? (
              <div className="flex items-center gap-1 ml-auto">
                <input
                  autoFocus
                  type="number"
                  value={saleInput}
                  onChange={(e) => setSaleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { onUpdate({ actualSaleAUEC: Number(saleInput) }); setEditSale(false) }
                    if (e.key === 'Escape') setEditSale(false)
                  }}
                  placeholder="Actual sale aUEC"
                  className="w-32 bg-slate-950 border border-amber-500/40 text-xs text-amber-400 font-mono rounded px-2 py-1 focus:outline-none"
                />
                <button onClick={() => { onUpdate({ actualSaleAUEC: Number(saleInput) }); setEditSale(false) }}
                  className="text-[10px] font-mono text-emerald-400 cursor-pointer">✓</button>
              </div>
            ) : (
              <button onClick={() => setEditSale(true)} className="ml-auto text-[10px] font-mono text-amber-400 hover:text-amber-300 cursor-pointer">
                {job.actualSaleAUEC ? `${job.actualSaleAUEC.toLocaleString()} aUEC sold` : '+ Record sale'}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}

// ─── AddJobModal ──────────────────────────────────────────────────────────────

function AddJobModal({ currentPlayerId, players, onClose, onAdd }: {
  currentPlayerId: string
  players: ReturnType<typeof useMojoStore.getState>['operation']['players']
  onClose: () => void
  onAdd: (job: Omit<RefineryJob, 'id'>) => void
}) {
  const [ore, setOre]         = useState('')
  const [rawSCU, setRawSCU]   = useState<number | ''>('')
  const [method, setMethod]   = useState(REFINERY_METHODS[0].id)
  const [station, setStation] = useState(REFINERY_STATIONS[0])
  const [fee, setFee]         = useState<number | ''>('')

  const selectedMethod = REFINERY_METHODS.find((m) => m.id === method) ?? REFINERY_METHODS[0]
  const yieldSCU = rawSCU !== '' ? Math.floor(Number(rawSCU) * selectedMethod.yield) : 0

  function handleSubmit() {
    if (!ore || !rawSCU || !fee) return
    onAdd({
      materialId:         ore.toLowerCase(),
      materialName:       ore,
      quantitySCU:        Number(rawSCU),
      method:             selectedMethod.name as any,
      stationId:          station.toLowerCase().replace(/\s/g, '_'),
      stationName:        station,
      status:             'processing',
      startedAt:          Date.now(),
      endsAt:             Date.now() + 1000 * 60 * 60 * 4,
      feePaid:            Number(fee),
      paidByPlayerId:     currentPlayerId,
      yieldMultiplier:    selectedMethod.yield,
      estimatedValueAUEC: 0,
    })
  }

  return (
  <div className="modal-overlay">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-violet-400" /> Add Refinery Job
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 cursor-pointer">✕</button>
        </div>

        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Ore</label>
              <input
                autoFocus
                type="text"
                placeholder="e.g. Quantainium"
                value={ore}
                onChange={(e) => setOre(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-sm text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 placeholder-slate-600"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Raw SCU</label>
              <input
                type="number"
                min={0}
                placeholder="e.g. 32"
                value={rawSCU}
                onChange={(e) => setRawSCU(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-sm text-amber-400 font-mono rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 placeholder-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Station</label>
            <select
              value={station}
              onChange={(e) => setStation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-sm text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              {REFINERY_STATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Method</label>
            <div className="grid grid-cols-2 gap-2">
              {REFINERY_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`text-left px-3 py-2 rounded-lg border text-xs transition-all cursor-pointer ${
                    method === m.id
                      ? 'bg-violet-500/10 border-violet-500/30 text-violet-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-[10px] font-mono text-slate-500">{Math.round(m.yield * 100)}% yield · {m.speed}</div>
                </button>
              ))}
            </div>
          </div>

          {rawSCU !== '' && (
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">Estimated yield</span>
              <span className="text-sm font-mono font-bold text-violet-400">{yieldSCU} SCU</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Fee paid (aUEC)</label>
            <input
              type="number"
              min={0}
              placeholder="e.g. 24000"
              value={fee}
              onChange={(e) => setFee(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 text-sm text-amber-400 font-mono rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 placeholder-slate-600"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-800">
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSubmit} disabled={!ore || !rawSCU || !fee}
            className="bg-violet-500 hover:bg-violet-400">
            <FlaskConical className="w-3.5 h-3.5" /> Add job
          </Btn>
        </div>
      </div>
    </div>
  )
}