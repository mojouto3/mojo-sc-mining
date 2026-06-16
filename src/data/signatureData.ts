// Reference table: base RS (Radar Signature) per resource node.
// In-game, a cluster scan shows a TOTAL RS value that is a multiple of
// a single resource's base signature — e.g. a reading of 18000 with
// Bexalite (base RS 3600) means 5 nodes are present in that cluster.
//
// Source: community data credited to MrKraken (@RealMrKraken),
// Star Citizen 4.7 PTU mining signatures chart.
// Cross-referenced: Regolith.rocks, UEX Corp, SC Trade Tools.
// Patch: 4.7.0 (current as of Alpha 4.8.1 — no mining signature changes since)

export type ResourceTier = 'S' | 'A' | 'B' | 'C'

export interface SignatureEntry {
  baseRS: number
  ore: string
  tier: ResourceTier
}

export const SIGNATURE_TABLE: SignatureEntry[] = [
  { baseRS: 3170, ore: 'Quantainium',  tier: 'S' },
  { baseRS: 3185, ore: 'Stileron',     tier: 'A' },
  { baseRS: 3200, ore: 'Savrilium',    tier: 'A' },
  { baseRS: 3370, ore: 'Ouratite',     tier: 'A' },
  { baseRS: 3385, ore: 'Riccite',      tier: 'B' },
  { baseRS: 3400, ore: 'Lindinium',    tier: 'B' },
  { baseRS: 3540, ore: 'Beryl',        tier: 'A' },
  { baseRS: 3555, ore: 'Taranite',     tier: 'A' },
  { baseRS: 3570, ore: 'Borase',       tier: 'B' },
  { baseRS: 3585, ore: 'Gold',         tier: 'A' },
  { baseRS: 3600, ore: 'Bexalite',     tier: 'S' },
  { baseRS: 3825, ore: 'Laranite',     tier: 'A' },
  { baseRS: 3840, ore: 'Aslarite',     tier: 'B' },
  { baseRS: 3855, ore: 'Titanium',     tier: 'B' },
  { baseRS: 3870, ore: 'Tungsten',     tier: 'B' },
  { baseRS: 3885, ore: 'Agricium',     tier: 'A' },
  { baseRS: 3900, ore: 'Torite',       tier: 'B' },
  { baseRS: 4180, ore: 'Hephestanite', tier: 'B' },
  { baseRS: 4195, ore: 'Tin',          tier: 'C' },
  { baseRS: 4210, ore: 'Quartz',       tier: 'C' },
  { baseRS: 4225, ore: 'Corundum',     tier: 'C' },
  { baseRS: 4240, ore: 'Copper',       tier: 'C' },
  { baseRS: 4255, ore: 'Silicon',      tier: 'C' },
  { baseRS: 4270, ore: 'Iron',         tier: 'C' },
  { baseRS: 4285, ore: 'Aluminium',    tier: 'C' },
  { baseRS: 4300, ore: 'Ice',          tier: 'C' },
]

export const TIER_COLORS: Record<ResourceTier, string> = {
  S: 'text-violet-400',
  A: 'text-amber-400',
  B: 'text-sky-400',
  C: 'text-slate-400',
}

export interface SignatureMatch {
  entry: SignatureEntry
  nodeCount: number
  confidence: number   // 0-100, 100 = perfect division
}

/**
 * Given a total cluster RS reading, find which resource(s) it could be
 * and how many nodes are present. A perfect match means totalRS is an
 * exact multiple of that resource's base RS.
 */
export function identifyCluster(totalRS: number, maxNodes = 12): SignatureMatch[] {
  const matches: SignatureMatch[] = []

  for (const entry of SIGNATURE_TABLE) {
    for (let n = 1; n <= maxNodes; n++) {
      const expected = entry.baseRS * n
      const diff = Math.abs(expected - totalRS)
      const tolerance = entry.baseRS * 0.02 // 2% tolerance for rounding
      if (diff <= tolerance) {
        const confidence = Math.max(0, Math.round(100 - (diff / tolerance) * 100))
        matches.push({ entry, nodeCount: n, confidence })
      }
    }
  }

  return matches.sort((a, b) => b.confidence - a.confidence)
}