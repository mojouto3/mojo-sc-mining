import { useState } from 'react'
import { RefreshCw, TrendingUp, AlertCircle } from 'lucide-react'
import { useUEXData } from '@/hooks/useUEXData'
import { Btn, Panel, PanelHeader } from '@/components/ui'

const TRACKED_MATERIALS = [
  'Quantainium', 'Bexalite', 'Taranite', 'Borase', 'Stileron',
  'Laranite', 'Agricium', 'Beryl', 'Diamond', 'Gold', 'Titanium',
]

export function TDDPrices() {
  const { commodityPrices, loading, error, lastUpdated, refresh } = useUEXData()
  const [selected, setSelected] = useState('Quantainium')

  const prices = commodityPrices
    .filter(
      (p) =>
        p.commodity_name?.toLowerCase() === selected.toLowerCase() &&
        p.price_sell > 0
    )
    .sort((a, b) => b.price_sell - a.price_sell)
    .slice(0, 5)

  const bestPrice = prices[0]?.price_sell ?? 0

  return (
    <Panel>
      <PanelHeader
        title={<span className="flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> TDD Prices</span>}
        subtitle={lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Live via UEXcorp'}
        action={
          <Btn onClick={refresh} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Btn>
        }
      />

      <div className="p-4 space-y-3">
        <div className="flex gap-1.5 flex-wrap">
          {TRACKED_MATERIALS.map((mat) => (
            <button
              key={mat}
              onClick={() => setSelected(mat)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wide transition-all cursor-pointer border ${
                selected === mat
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              {mat}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            Could not load UEX data — showing cached or no data
          </div>
        )}

        {loading ? (
          <div className="text-center py-6 text-xs text-slate-600 font-mono">Loading prices...</div>
        ) : prices.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-600 font-mono">No price data for {selected}</div>
        ) : (
          <div className="space-y-1.5">
            {prices.map((p, idx) => {
              const pct = bestPrice > 0 ? (p.price_sell / bestPrice) * 100 : 0
              return (
                <div
                  key={`${p.id_terminal}-${idx}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all ${
                    idx === 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-950/40 border-slate-800/40'
                  }`}
                >
                  <span className={`text-[10px] font-mono font-bold w-4 text-center flex-shrink-0 ${idx === 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                    {idx === 0 ? '★' : idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-200 truncate">{p.terminal_name}</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">{p.station_name}</div>
                  </div>
                  <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden flex-shrink-0">
                    <div className={`h-full rounded-full ${idx === 0 ? 'bg-emerald-500' : 'bg-slate-600'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={`text-xs font-mono font-bold flex-shrink-0 ${idx === 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {p.price_sell.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-600 font-mono flex-shrink-0">aUEC/SCU</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Panel>
  )
}