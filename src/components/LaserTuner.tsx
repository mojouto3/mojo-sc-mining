import { useState } from 'react'
import { Zap, ChevronDown, ChevronUp } from 'lucide-react'
import { LASER_HEADS, MINING_MODULES } from '@/data/laserData'
import type { LaserHead, MiningModule } from '@/data/laserData'

interface LaserSetup {
  headId: string
  moduleIds: string[]
}

interface Props {
  laserCount: number  // 1 for Prospector, 3 for MOLE
}

export function LaserTuner({ laserCount }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [setups, setSetups] = useState<LaserSetup[]>(
    Array.from({ length: laserCount }, (_, i) => ({
      headId: i === 0 ? 'lancet_mb2' : 'lancet_mb1',
      moduleIds: ['empty', 'empty', 'empty'],
    }))
  )

  function setHead(laserIdx: number, headId: string) {
    const head = LASER_HEADS.find((h) => h.id === headId)!
    setSetups((prev) =>
      prev.map((s, i) =>
        i === laserIdx
          ? { ...s, headId, moduleIds: Array(head.moduleSlots).fill('empty') }
          : s
      )
    )
  }

  function setModule(laserIdx: number, slotIdx: number, moduleId: string) {
    setSetups((prev) =>
      prev.map((s, i) =>
        i === laserIdx
          ? { ...s, moduleIds: s.moduleIds.map((m, j) => (j === slotIdx ? moduleId : m)) }
          : s
      )
    )
  }

  // Calculate effective stats for a laser setup
  function calcStats(setup: LaserSetup) {
    const head = LASER_HEADS.find((h) => h.id === setup.headId)!
    const modules = setup.moduleIds
      .map((id) => MINING_MODULES.find((m) => m.id === id)!)
      .filter(Boolean)

    const totalPowerMod      = modules.reduce((s, m) => s + m.powerMod, 0)
    const totalWindowMod     = modules.reduce((s, m) => s + m.optimalWindowMod, 0)
    const totalInstabilityMod = modules.reduce((s, m) => s + m.instabilityMod, 0) + head.instabilityMod
    const totalResistanceMod  = modules.reduce((s, m) => s + m.resistanceMod, 0) + head.resistanceMod

    const effectivePower  = Math.round(head.power * (1 + totalPowerMod / 100))
    const effectiveWindow = Math.max(5, head.optimalWindow + totalWindowMod)

    return {
      power: effectivePower,
      window: effectiveWindow,
      instability: totalInstabilityMod,
      resistance: totalResistanceMod,
    }
  }

  function statColor(val: number, invert = false) {
    if (val === 0) return 'text-slate-500'
    const positive = invert ? val < 0 : val > 0
    return positive ? 'text-emerald-400' : 'text-red-400'
  }

  function statSign(val: number) {
    return val > 0 ? `+${val}%` : `${val}%`
  }

  const laserLabels = laserCount === 1
    ? ['Center laser']
    : ['Port laser', 'Center laser', 'Starboard laser']

  return (
    <div className="bg-slate-900/70 border border-slate-700/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-800/20 transition-colors"
        onClick={() => setCollapsed((c) => !c)}
      >
        <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <span className="text-sm font-semibold text-slate-200 flex-1">Laser Tuning</span>
        {collapsed ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronUp className="w-4 h-4 text-slate-500" />}
      </div>

      {!collapsed && (
        <div className="border-t border-slate-800/60 divide-y divide-slate-800/40">
          {setups.map((setup, laserIdx) => {
            const head  = LASER_HEADS.find((h) => h.id === setup.headId)!
            const stats = calcStats(setup)
            const availableHeads = LASER_HEADS.filter((h) =>
              laserIdx === 1 && laserCount === 3 ? h.size === 2 : h.size === 1
            )

            return (
              <div key={laserIdx} className="px-4 py-3 space-y-3">
                {/* Laser label */}
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  {laserLabels[laserIdx] ?? `Laser ${laserIdx + 1}`}
                </div>

                {/* Head selector */}
                <div className="flex items-center gap-3">
                  <label className="text-[10px] font-mono text-slate-400 w-16 flex-shrink-0">Head</label>
                  <select
                    value={setup.headId}
                    onChange={(e) => setHead(laserIdx, e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {availableHeads.map((h) => (
                      <option key={h.id} value={h.id}>{h.name} — {h.power}MW</option>
                    ))}
                  </select>
                </div>

                {/* Module slots */}
                <div className="space-y-1.5">
                  {setup.moduleIds.map((moduleId, slotIdx) => (
                    <div key={slotIdx} className="flex items-center gap-3">
                      <label className="text-[10px] font-mono text-slate-500 w-16 flex-shrink-0">
                        Slot {slotIdx + 1}
                      </label>
                      <select
                        value={moduleId}
                        onChange={(e) => setModule(laserIdx, slotIdx, e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        {MINING_MODULES.map((m) => (
                          <option key={m.id} value={m.id}>
                            [{m.type[0]}] {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[
                    { label: 'Power',       value: stats.power,       unit: 'MW', raw: true },
                    { label: 'Window',      value: stats.window,      unit: '%',  raw: true },
                    { label: 'Instability', value: stats.instability, unit: '',   raw: false, invert: true },
                    { label: 'Resistance',  value: stats.resistance,  unit: '',   raw: false, invert: true },
                  ].map(({ label, value, unit, raw, invert }) => (
                    <div key={label} className="bg-slate-950/60 rounded-lg p-2 border border-slate-800/60 text-center">
                      <div className="text-[9px] font-mono text-slate-500 uppercase mb-1">{label}</div>
                      <div className={`text-xs font-mono font-bold ${raw ? 'text-slate-200' : statColor(value, invert)}`}>
                        {raw ? `${value}${unit}` : (value === 0 ? '—' : statSign(value))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
