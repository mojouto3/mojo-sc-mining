// ─── Laser Heads ─────────────────────────────────────────────────────────────

export interface LaserHead {
  id: string
  name: string
  size: 1 | 2 | 3
  power: number           // MW
  optimalWindow: number   // % range
  instabilityMod: number  // % change
  resistanceMod: number   // % change
  moduleSlots: number
  description: string
}

export const LASER_HEADS: LaserHead[] = [
  {
    id: 'lancet_mb1',
    name: 'Lancet MB-1',
    size: 1,
    power: 1200,
    optimalWindow: 25,
    instabilityMod: 0,
    resistanceMod: 0,
    moduleSlots: 2,
    description: 'Balanced entry-level laser. Good starting point.',
  },
  {
    id: 'helix_i',
    name: 'Helix I',
    size: 1,
    power: 1000,
    optimalWindow: 35,
    instabilityMod: -10,
    resistanceMod: 0,
    moduleSlots: 2,
    description: 'Wider optimal window. Good for unstable rocks.',
  },
  {
    id: 'arbor_mh1',
    name: 'Arbor MH-1',
    size: 1,
    power: 900,
    optimalWindow: 20,
    instabilityMod: 0,
    resistanceMod: -15,
    moduleSlots: 2,
    description: 'Reduces rock resistance. Good for hard rocks.',
  },
  {
    id: 'lancet_mb2',
    name: 'Lancet MB-2',
    size: 2,
    power: 2200,
    optimalWindow: 25,
    instabilityMod: 0,
    resistanceMod: 0,
    moduleSlots: 3,
    description: 'Size 2 balanced laser for MOLE center turret.',
  },
  {
    id: 'helix_ii',
    name: 'Helix II',
    size: 2,
    power: 1800,
    optimalWindow: 38,
    instabilityMod: -12,
    resistanceMod: 0,
    moduleSlots: 3,
    description: 'Size 2 wide window laser. Excellent for Quantainium.',
  },
  {
    id: 'arbor_mh2',
    name: 'Arbor MH-2',
    size: 2,
    power: 1600,
    optimalWindow: 20,
    instabilityMod: 0,
    resistanceMod: -18,
    moduleSlots: 3,
    description: 'Size 2 resistance reduction laser.',
  },
  {
    id: 'hofstede_s1',
    name: 'Hofstede S1',
    size: 1,
    power: 1100,
    optimalWindow: 28,
    instabilityMod: -5,
    resistanceMod: -10,
    moduleSlots: 2,
    description: 'Balanced reduction on both instability and resistance.',
  },
]

// ─── Modules ─────────────────────────────────────────────────────────────────

export interface MiningModule {
  id: string
  name: string
  type: 'Active' | 'Passive'
  powerMod: number          // % change to laser power
  optimalWindowMod: number  // % change to optimal window
  instabilityMod: number    // % change
  resistanceMod: number     // % change
  description: string
}

export const MINING_MODULES: MiningModule[] = [
  {
    id: 'surge',
    name: 'Surge',
    type: 'Active',
    powerMod: 40,
    optimalWindowMod: -20,
    instabilityMod: 20,
    resistanceMod: 0,
    description: 'Boosts power significantly but narrows window.',
  },
  {
    id: 'focus_i',
    name: 'Focus I',
    type: 'Passive',
    powerMod: 20,
    optimalWindowMod: -10,
    instabilityMod: 0,
    resistanceMod: 0,
    description: 'Increases power at cost of optimal window.',
  },
  {
    id: 'focus_ii',
    name: 'Focus II',
    type: 'Passive',
    powerMod: 35,
    optimalWindowMod: -15,
    instabilityMod: 0,
    resistanceMod: 0,
    description: 'Greater power boost, greater window penalty.',
  },
  {
    id: 'stampede',
    name: 'Stampede',
    type: 'Active',
    powerMod: 60,
    optimalWindowMod: -30,
    instabilityMod: 30,
    resistanceMod: 0,
    description: 'Maximum power burst. Very risky on unstable rocks.',
  },
  {
    id: 'lifeline',
    name: 'Lifeline',
    type: 'Active',
    powerMod: -20,
    optimalWindowMod: 30,
    instabilityMod: -20,
    resistanceMod: 0,
    description: 'Reduces power but greatly widens safe window.',
  },
  {
    id: 'optimum',
    name: 'Optimum',
    type: 'Passive',
    powerMod: 0,
    optimalWindowMod: 15,
    instabilityMod: 0,
    resistanceMod: 0,
    description: 'Widens optimal window without power penalty.',
  },
  {
    id: 'brandt',
    name: 'Brandt',
    type: 'Passive',
    powerMod: 0,
    optimalWindowMod: 0,
    instabilityMod: -15,
    resistanceMod: 0,
    description: 'Reduces instability transfer from rock to laser.',
  },
  {
    id: 'rieger_c3',
    name: 'Rieger C3',
    type: 'Passive',
    powerMod: 0,
    optimalWindowMod: 0,
    instabilityMod: 0,
    resistanceMod: -20,
    description: 'Reduces rock resistance.',
  },
  {
    id: 'torrent_i',
    name: 'Torrent I',
    type: 'Active',
    powerMod: 0,
    optimalWindowMod: 0,
    instabilityMod: -30,
    resistanceMod: 0,
    description: 'Active instability suppressor.',
  },
  {
    id: 'empty',
    name: '— Empty slot —',
    type: 'Passive',
    powerMod: 0,
    optimalWindowMod: 0,
    instabilityMod: 0,
    resistanceMod: 0,
    description: 'No module installed.',
  },
]

// ─── Bag status ───────────────────────────────────────────────────────────────

export type BagStatus = 'empty' | 'filling' | 'full' | 'swapped'

export const BAG_STATUS_LABELS: Record<BagStatus, string> = {
  empty:   'Empty',
  filling: 'Filling',
  full:    'Full — Ready for swap',
  swapped: 'Swapped',
}

export const BAG_STATUS_COLORS: Record<BagStatus, string> = {
  empty:   'text-slate-500  bg-slate-800/40    border-slate-700/40',
  filling: 'text-amber-400  bg-amber-500/10    border-amber-500/20',
  full:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  swapped: 'text-sky-400    bg-sky-500/10      border-sky-500/20',
}
