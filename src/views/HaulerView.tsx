import { Truck } from 'lucide-react'
import { RefineryQueue } from '@/components/RefineryQueue'
import { TDDPrices } from '@/components/TDDPrices'
import { PayoutPanel } from '@/components/PayoutPanel'

export function HaulerView() {
  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Truck className="w-5 h-5 text-emerald-400" />
          Hauler View
        </h2>
        <p className="text-xs text-slate-500 font-mono mt-0.5">
          Refinery queue, TDD prices, payout calculator
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          <RefineryQueue />
          <TDDPrices />
        </div>

        {/* Right column */}
        <div>
          <PayoutPanel />
        </div>
      </div>

    </div>
  )
}