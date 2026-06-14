// ─── Roles ────────────────────────────────────────────────────────────────────

export type ShipRole =
  | 'pilot'
  | 'laser_operator'
  | 'bag_swapper'
  | 'cargo_crew'
  | 'co_pilot'

export type OperationRole =
  | 'scout'
  | 'miner'
  | 'raw_hauler'
  | 'refine_hauler'

export type PlayerStatus =
  | 'standby'
  | 'scanning'
  | 'mining'
  | 'swapping'
  | 'hauling'
  | 'refining'
  | 'selling'
  | 'offline'

// ─── Player ───────────────────────────────────────────────────────────────────

export interface Player {
  id: string
  handle: string              // in-game name
  isFleetManager: boolean     // can manage operation settings
  shipId: string | null       // which ship they're on
  shipRole: ShipRole
  operationRole: OperationRole
  status: PlayerStatus
  joinedAt: number            // timestamp
  shareWeight: number         // for payout calculation (default 1)
  payoutStatus: 'pending' | 'paid'
  paidAt?: number
}

// ─── Ships ────────────────────────────────────────────────────────────────────

export type ShipType = 'scout' | 'mining' | 'raw_hauler' | 'refine_hauler'

export interface Ship {
  id: string
  name: string                // e.g. "Ironjaw"
  model: string               // e.g. "ARGO MOLE"
  type: ShipType
  status: 'active' | 'transit' | 'docked' | 'standby'
  location: string            // free text, e.g. "Lyria OM-1"
  crewIds: string[]           // Player ids
}

// ─── Rocks / Clusters ─────────────────────────────────────────────────────────

export type RockStatus = 'scouted' | 'en_route' | 'mining' | 'done'


export interface OreDeposit {
  materialId: string
  percentage: number
}

export interface Rock {
  id: string
  location: string
  scoutedBy: string
  ores: OreDeposit[]
  status: RockStatus
  assignedMinerId: string | null
  notes: string
  mass?: number
  scoutedAt: number
  cargoEntries?: { materialId: string; materialName: string; scu: number }[]
}

// ─── Refinery ─────────────────────────────────────────────────────────────────

export type RefineMethod =
  | 'Cormack'
  | 'Dinyan'
  | 'Ferron'
  | 'Gallow'
  | 'Pyrometric'
  | 'Electrostarolysis'
  | 'Kazen'

export type RefineryJobStatus = 'queued' | 'processing' | 'done'

export interface RefineryJob {
  id: string
  materialId: string
  materialName: string
  quantitySCU: number
  method: RefineMethod
  stationId: string
  stationName: string
  status: RefineryJobStatus
  startedAt: number
  endsAt: number
  feePaid: number             // aUEC cost
  paidByPlayerId: string
  yieldMultiplier: number     // e.g. 0.82 = 82%
  estimatedValueAUEC: number
}

// ─── Cargo / Sales ────────────────────────────────────────────────────────────

export interface CargoSale {
  id: string
  materialId: string
  materialName: string
  quantitySCU: number
  pricePerSCU: number
  terminalId: string
  terminalName: string
  soldAt: number
  soldByPlayerId: string
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export interface Expense {
  id: string
  description: string
  amountAUEC: number
  paidByPlayerId: string
  category: 'refinery' | 'fuel' | 'repair' | 'rental' | 'other'
  createdAt: number
}

// ─── Operation ────────────────────────────────────────────────────────────────

export type SplitMethod = 'equal' | 'role_based' | 'custom_weights'

export interface Operation {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  splitMethod: SplitMethod
  ships: Ship[]
  players: Player[]
  rocks: Rock[]
  refineryJobs: RefineryJob[]
  sales: CargoSale[]
  expenses: Expense[]
  notes: string
}

// ─── UEX API ──────────────────────────────────────────────────────────────────

export interface UEXCommodityPrice {
  id_commodity: number
  id_terminal: number
  commodity_name: string
  terminal_name: string
  station_name: string
  price_sell: number          // aUEC per SCU
  price_buy: number
  date_modified: number
}

export interface UEXTerminal {
  id: number
  name: string
  star_system_name: string
  planet_name: string
  space_station_name: string
  type: string                // 'commodity', 'refinery', etc.
  has_refinery: boolean
  has_trade: boolean
}

export interface UEXRefineryMethod {
  id: number
  name: string
  yield_modifier: number      // e.g. 0.82
  time_modifier: number       // e.g. 1.2 (longer = higher value)
  cost_modifier: number
}

// ─── Payout calculation ───────────────────────────────────────────────────────

export interface PayoutEntry {
  player: Player
  profitShare: number
  expenseReimbursement: number
  totalReceive: number
  isRevenueHolder: boolean    // the one who holds the aUEC after selling
}
