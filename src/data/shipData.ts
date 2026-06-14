export interface MiningShipData {
  model: string
  miningCapacitySCU: number
  lasers: number
}

export const MINING_SHIPS: MiningShipData[] = [
  { model: 'MISC Prospector',      miningCapacitySCU: 48,  lasers: 1 },
  { model: 'ARGO MOLE',            miningCapacitySCU: 96,  lasers: 3 },
  { model: 'RSI Arrastra',         miningCapacitySCU: 512, lasers: 3 },
  { model: 'Greycat ROC',          miningCapacitySCU: 8,   lasers: 1 },
]

export function getShipCapacity(model: string): number {
  return MINING_SHIPS.find((s) => s.model === model)?.miningCapacitySCU ?? 32
}