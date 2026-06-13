import { useState } from 'react'
import { Copy, Check, Wallet, Plus, X } from 'lucide-react'
import { useMojoStore } from '@/store'
import { Avatar, Panel, PanelHeader, StatCard, Btn } from '@/components/ui'
import type { SplitMethod } from '@/types'

const SPLIT_LABELS: Record<SplitMethod, string> = {
  equal:          'Equal Split',
  role_based:     'By Role %',
  custom_weights: 'Custom Weights',
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button onClick={handleCopy}
      className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded border transition-all cursor-pointer bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600">
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}
export function PayoutPanel() {
  const { operation, setSplitMethod, addSale, addExpense, markPlayerPaid } = useMojoStore((s) => ({
  operation:      s.operation,
  setSplitMethod: s.setSplitMethod,
  addSale:        s.addSale,
  addExpense:     s.addExpense,
  markPlayerPaid: s.markPlayerPaid,
}))
  const payouts   = useMojoStore((s) => s.getPayouts())
  const netProfit = useMojoStore((s) => s.getNetProfit())
  const revenue   = useMojoStore((s) => s.getTotalRevenue())
  const expenses  = useMojoStore((s) => s.getTotalExpenses())
  const estimated = useMojoStore((s) => s.getEstimatedRevenue())

  const [showSaleForm, setShowSaleForm]       = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)



  const { splitMethod, players, sales } = operation
  const holder = players.find((p) => p.operationRole === 'refine_hauler') ?? players[0]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Gross revenue"        value={`${revenue.toLocaleString()} aUEC`} />
        <StatCard label="Total expenses"       value={`${expenses.toLocaleString()} aUEC`} />
        <StatCard label="Net profit"           value={`${netProfit.toLocaleString()} aUEC`} accent />
        <StatCard label="Est. incl. refining"  value={`${estimated.toLocaleString()} aUEC`} />
      </div>

      <Panel>
        <PanelHeader title="Split strategy" />
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2">
            {(['equal', 'role_based', 'custom_weights'] as SplitMethod[]).map((method) => (
              <button key={method} onClick={() => setSplitMethod(method)}
                className={`px-3 py-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  splitMethod === method
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                }`}>
                {SPLIT_LABELS[method]}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Cargo sales" subtitle={`${sales.length} recorded`}
          action={<Btn onClick={() => setShowSaleForm((v) => !v)}><Plus className="w-3.5 h-3.5" /> Add sale</Btn>} />
        {showSaleForm && <AddSaleForm onClose={() => setShowSaleForm(false)} />}
        {sales.length > 0 && (
          <div className="divide-y divide-slate-800/40">
            {sales.map((sale) => (
              <div key={sale.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="flex-1">
                  <span className="text-xs font-semibold text-slate-200">{sale.quantitySCU} SCU {sale.materialName}</span>
                  <div className="text-[10px] font-mono text-slate-500">{sale.terminalName}</div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {(sale.pricePerSCU * sale.quantitySCU).toLocaleString()} aUEC
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel>
        <PanelHeader title="Expenses" subtitle="Fuel, repairs, rentals"
          action={<Btn onClick={() => setShowExpenseForm((v) => !v)}><Plus className="w-3.5 h-3.5" /> Add expense</Btn>} />
        {showExpenseForm && <AddExpenseForm onClose={() => setShowExpenseForm(false)} />}
        {operation.expenses.length > 0 && (
          <div className="divide-y divide-slate-800/40">
            {operation.expenses.map((exp) => {
              const paidBy = players.find((p) => p.id === exp.paidByPlayerId)
              return (
                <div key={exp.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="flex-1">
                    <span className="text-xs text-slate-200">{exp.description}</span>
                    <div className="text-[10px] font-mono text-slate-500">Paid by {paidBy?.handle ?? '—'}</div>
                  </div>
                  <span className="text-xs font-mono font-bold text-red-400">
                    -{exp.amountAUEC.toLocaleString()} aUEC
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </Panel>

      {payouts.length > 0 && (
        <Panel>
          <PanelHeader
            title={<span className="flex items-center gap-2"><Wallet className="w-3.5 h-3.5 text-amber-400" /> Payout breakdown</span>}
            subtitle={holder ? `Credits held by ${holder.handle}` : undefined} />
          <div className="divide-y divide-slate-800/40">
            {payouts.map(({ player, profitShare, expenseReimbursement, totalReceive, isRevenueHolder }) => (
              <div key={player.id} className={`flex items-center gap-3 px-4 py-3 ${player.payoutStatus === 'paid' ? 'opacity-50' : ''}`}>
                <Avatar handle={player.handle} role={player.operationRole} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">{player.handle}</span>
                    {isRevenueHolder && (
                      <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded">holds credits</span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                    Share: {profitShare.toLocaleString()}
                    {expenseReimbursement > 0 && ` + ${expenseReimbursement.toLocaleString()} reimburse`}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-mono font-bold ${player.payoutStatus === 'paid' ? 'text-slate-500 line-through' : 'text-amber-400'}`}>
                    {totalReceive.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono">aUEC</div>
                </div>
                {!isRevenueHolder && (
                  <button onClick={() => markPlayerPaid(player.id)}
                    className={`text-[10px] font-mono px-2 py-1 rounded border transition-all cursor-pointer ${
                      player.payoutStatus === 'paid'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}>
                    {player.payoutStatus === 'paid' ? '✓ Paid' : 'Mark paid'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </Panel>
      )}

      {payouts.filter((p) => !p.isRevenueHolder).length > 0 && (
        <Panel>
          <PanelHeader title="mo.TRADER commands" subtitle="Copy and paste in Star Citizen chat" />
          <div className="p-4 space-y-2">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 font-mono text-xs">
              {payouts.filter((p) => !p.isRevenueHolder && p.totalReceive > 0).map(({ player, totalReceive }) => {
                const cmd = `/transfer ${player.handle} ${totalReceive}`
                return (
                  <div key={player.id} className="flex items-center justify-between gap-3">
                    <span className={player.payoutStatus === 'paid' ? 'text-slate-600 line-through' : 'text-slate-300'}>
                      {cmd}
                    </span>
                    {player.payoutStatus !== 'paid' && <CopyButton text={cmd} />}
                    {player.payoutStatus === 'paid' && <span className="text-[10px] text-emerald-400">✓ sent</span>}
                  </div>
                )
              })}
            </div>
            <div className="text-[10px] text-slate-600 font-mono">
              Open chat in SC (ENTER) → paste command (CTRL+V) → send
            </div>
          </div>
        </Panel>
      )}
    </div>
  )
}
const SALE_MATERIALS = [
  'Quantainium', 'Bexalite', 'Taranite', 'Borase', 'Stileron',
  'Laranite', 'Agricium', 'Beryl', 'Diamond', 'Gold', 'Titanium',
]

const TDD_TERMINALS = [
  'ARC-L1 TDD', 'ARC-L2 TDD', 'HUR-L2 TDD', 'MIC-L1 TDD',
  'CRU-L1 TDD', 'HUR-L1 TDD', 'MIC-L2 TDD', 'Levski TDD',
]

function AddSaleForm({ onClose }: { onClose: () => void }) {
  const { operation, addSale } = useMojoStore((s) => ({
    operation: s.operation,
    addSale:   s.addSale,
  }))

  const [material, setMaterial] = useState('Quantainium')
  const [scu, setScu]           = useState<number>(0)
  const [price, setPrice]       = useState<number>(0)
  const [terminal, setTerminal] = useState(TDD_TERMINALS[0])
  const [soldBy, setSoldBy]     = useState(operation.players[0]?.id ?? '')

  function handleSubmit() {
    if (scu <= 0 || price <= 0) return
    addSale({
      materialId:     material.toLowerCase(),
      materialName:   material,
      quantitySCU:    scu,
      pricePerSCU:    price,
      terminalId:     terminal.toLowerCase().replace(/\s+/g, '_'),
      terminalName:   terminal,
      soldByPlayerId: soldBy,
    })
    onClose()
  }

  return (
    <div className="mx-4 mb-3 bg-slate-950/95 border border-slate-700/60 rounded-xl p-4 space-y-3">
      <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">Record sale</div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Material</label>
          <select value={material} onChange={(e) => setMaterial(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer">
            {SALE_MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">SCU</label>
          <input type="number" min={1} value={scu || ''} onChange={(e) => setScu(Number(e.target.value))}
            placeholder="32"
            className="w-full bg-slate-900 border border-slate-800 text-xs text-amber-400 font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500" />
        </div>
        <div>
          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Price/SCU (aUEC)</label>
          <input type="number" min={1} value={price || ''} onChange={(e) => setPrice(Number(e.target.value))}
            placeholder="25600"
            className="w-full bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500" />
        </div>
        <div>
          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Terminal</label>
          <select value={terminal} onChange={(e) => setTerminal(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer">
            {TDD_TERMINALS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={handleSubmit} disabled={scu <= 0 || price <= 0}>
          Record sale
        </Btn>
      </div>
    </div>
  )
}

function AddExpenseForm({ onClose }: { onClose: () => void }) {
  const { operation, addExpense } = useMojoStore((s) => ({
    operation:  s.operation,
    addExpense: s.addExpense,
  }))

  const [description, setDescription] = useState('')
  const [amount, setAmount]           = useState<number>(0)
  const [paidBy, setPaidBy]           = useState(operation.players[0]?.id ?? '')
  const [category, setCategory]       = useState<'refinery' | 'fuel' | 'repair' | 'rental' | 'other'>('fuel')

  function handleSubmit() {
    if (!description.trim() || amount <= 0) return
    addExpense({
      description:    description.trim(),
      amountAUEC:     amount,
      paidByPlayerId: paidBy,
      category,
    })
    onClose()
  }

  return (
    <div className="mx-4 mb-3 bg-slate-950/95 border border-slate-700/60 rounded-xl p-4 space-y-3">
      <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">Add expense</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Description</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder='e.g. "Fuel refill at ARC-L1"'
            className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 placeholder-slate-600" />
        </div>
        <div>
          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Amount (aUEC)</label>
          <input type="number" min={1} value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="5000"
            className="w-full bg-slate-900 border border-slate-800 text-xs text-red-400 font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-500" />
        </div>
        <div>
          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer">
            <option value="fuel">Fuel</option>
            <option value="repair">Repair</option>
            <option value="refinery">Refinery fee</option>
            <option value="rental">Rental</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Paid by</label>
          <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer">
            {operation.players.map((p) => <option key={p.id} value={p.id}>{p.handle}</option>)}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={handleSubmit} disabled={!description.trim() || amount <= 0}>
          Add expense
        </Btn>
      </div>
    </div>
  )
}