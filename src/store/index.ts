import { create } from 'zustand'
import type {
  Operation, Player, Ship, Rock, RefineryJob,
  CargoSale, Expense, SplitMethod, PayoutEntry,
} from '@/types'
import {
  dbAddShip, dbUpdateShip, dbRemoveShip,
  dbAddPlayer, dbUpdatePlayer, dbRemovePlayer,
  dbAddRock, dbUpdateRock, dbRemoveRock,
  dbAddRefineryJob, dbUpdateRefineryJob, dbRemoveRefineryJob,
  dbAddSale, dbRemoveSale,
  dbAddExpense, dbRemoveExpense,
  dbUpdateOperation,
} from '@/api/sync'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function emptyOperation(): Operation {
  return {
    id: '',
    name: 'New Operation',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    splitMethod: 'equal',
    ships: [],
    players: [],
    rocks: [],
    refineryJobs: [],
    sales: [],
    expenses: [],
    notes: '',
  }
}

// ─── Store interface ──────────────────────────────────────────────────────────

interface MojoStore {
  operation: Operation
  operationId: string  // Supabase operation UUID

  // Setup
  setOperationId: (id: string) => void

  // Operation
  setOperationName: (name: string) => void
  setSplitMethod: (method: SplitMethod) => void
  setNotes: (notes: string) => void
  resetOperation: () => void

  // Ships
  addShip: (ship: Omit<Ship, 'id' | 'crewIds'>) => Promise<void>
  updateShip: (id: string, patch: Partial<Ship>) => Promise<void>
  removeShip: (id: string) => Promise<void>

  // Players
  addPlayer: (player: Omit<Player, 'id' | 'joinedAt' | 'payoutStatus'>) => Promise<void>
  updatePlayer: (id: string, patch: Partial<Player>) => Promise<void>
  removePlayer: (id: string) => Promise<void>
  assignPlayerToShip: (playerId: string, shipId: string | null) => Promise<void>
  markPlayerPaid: (playerId: string) => void

  // Rocks
  addRock: (rock: Omit<Rock, 'id' | 'scoutedAt'>) => Promise<void>
  updateRock: (id: string, patch: Partial<Rock>) => Promise<void>
  removeRock: (id: string) => Promise<void>

  // Refinery
  addRefineryJob: (job: Omit<RefineryJob, 'id'>) => Promise<void>
  updateRefineryJob: (id: string, patch: Partial<RefineryJob>) => Promise<void>
  removeRefineryJob: (id: string) => Promise<void>

  // Sales
  addSale: (sale: Omit<CargoSale, 'id' | 'soldAt'>) => Promise<void>
  removeSale: (id: string) => Promise<void>

  // Expenses
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>
  removeExpense: (id: string) => Promise<void>

  // Computed
  getPayouts: () => PayoutEntry[]
  getTotalRevenue: () => number
  getTotalExpenses: () => number
  getNetProfit: () => number
  getEstimatedRevenue: () => number
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useMojoStore = create<MojoStore>()((set, get) => ({
  operation: emptyOperation(),
  operationId: '',

  setOperationId: (id) => set({ operationId: id }),

  // ── Operation ──
  setOperationName: (name) => {
    set((s) => ({ operation: { ...s.operation, name } }))
    const id = get().operationId
    if (id) dbUpdateOperation(id, { name }).catch(console.error)
  },

  setSplitMethod: (splitMethod) => {
    set((s) => ({ operation: { ...s.operation, splitMethod } }))
    const id = get().operationId
    if (id) dbUpdateOperation(id, { split_method: splitMethod }).catch(console.error)
  },

  setNotes: (notes) => {
    set((s) => ({ operation: { ...s.operation, notes } }))
    const id = get().operationId
    if (id) dbUpdateOperation(id, { notes }).catch(console.error)
  },

  resetOperation: () => set({ operation: emptyOperation(), operationId: '' }),

  // ── Ships ──
  addShip: async (ship) => {
    const operationId = get().operationId
    if (!operationId) return
    const data = await dbAddShip(operationId, ship)
    set((s) => ({
      operation: {
        ...s.operation,
        ships: [...s.operation.ships, { ...ship, id: data.id, crewIds: [] }],
      }
    }))
  },

  updateShip: async (id, patch) => {
    set((s) => ({
      operation: {
        ...s.operation,
        ships: s.operation.ships.map((sh) => sh.id === id ? { ...sh, ...patch } : sh),
      }
    }))
    await dbUpdateShip(id, patch).catch(console.error)
  },

  removeShip: async (id) => {
    set((s) => ({
      operation: {
        ...s.operation,
        ships: s.operation.ships.filter((sh) => sh.id !== id),
        players: s.operation.players.map((p) => p.shipId === id ? { ...p, shipId: null } : p),
      }
    }))
    await dbRemoveShip(id).catch(console.error)
  },

  // ── Players ──
  addPlayer: async (player) => {
    const operationId = get().operationId
    if (!operationId) return
    const data = await dbAddPlayer(operationId, {
      handle:         player.handle,
      operation_role: player.operationRole,
      ship_role:      player.shipRole,
      ship_id:        player.shipId,
      status:         player.status,
      share_weight:   player.shareWeight ?? 1,
    })
    set((s) => ({
      operation: {
        ...s.operation,
        players: [...s.operation.players, {
          ...player,
          id:           data.id,
          joinedAt:     Date.now(),
          payoutStatus: 'pending',
          shareWeight:  player.shareWeight ?? 1,
        }],
      }
    }))
  },

  updatePlayer: async (id, patch) => {
    set((s) => ({
      operation: {
        ...s.operation,
        players: s.operation.players.map((p) => p.id === id ? { ...p, ...patch } : p),
      }
    }))
    const dbPatch: Record<string, unknown> = {}
    if (patch.status)        dbPatch.status         = patch.status
    if (patch.operationRole) dbPatch.operation_role  = patch.operationRole
    if (patch.shipRole)      dbPatch.ship_role       = patch.shipRole
    if (patch.shipId !== undefined) dbPatch.ship_id  = patch.shipId
    if (patch.shareWeight)   dbPatch.share_weight    = patch.shareWeight
    if (patch.payoutStatus)  dbPatch.payout_status   = patch.payoutStatus
    if (Object.keys(dbPatch).length > 0) {
      await dbUpdatePlayer(id, dbPatch).catch(console.error)
    }
  },

  removePlayer: async (id) => {
    set((s) => ({
      operation: {
        ...s.operation,
        players: s.operation.players.filter((p) => p.id !== id),
        ships: s.operation.ships.map((sh) => ({
          ...sh,
          crewIds: sh.crewIds.filter((cid) => cid !== id),
        })),
      }
    }))
    await dbRemovePlayer(id).catch(console.error)
  },

  assignPlayerToShip: async (playerId, shipId) => {
    set((s) => ({
      operation: {
        ...s.operation,
        players: s.operation.players.map((p) =>
          p.id === playerId ? { ...p, shipId } : p
        ),
      }
    }))
    await dbUpdatePlayer(playerId, { ship_id: shipId }).catch(console.error)
  },

  markPlayerPaid: (playerId) => {
    set((s) => ({
      operation: {
        ...s.operation,
        players: s.operation.players.map((p) =>
          p.id === playerId
            ? { ...p, payoutStatus: p.payoutStatus === 'paid' ? 'pending' : 'paid', paidAt: Date.now() }
            : p
        ),
      }
    }))
    const player = get().operation.players.find((p) => p.id === playerId)
    if (player) {
      dbUpdatePlayer(playerId, {
        payout_status: player.payoutStatus === 'paid' ? 'pending' : 'paid',
      }).catch(console.error)
    }
  },

  // ── Rocks ──
  addRock: async (rock) => {
    const operationId = get().operationId
    if (!operationId) return
    const data = await dbAddRock(operationId, {
      location:           rock.location,
      scouted_by:         rock.scoutedBy,
      ores:               rock.ores,
      status:             rock.status,
      assigned_miner_id:  rock.assignedMinerId,
      notes:              rock.notes,
    })
    set((s) => ({
      operation: {
        ...s.operation,
        rocks: [{ ...rock, id: data.id, scoutedAt: Date.now() }, ...s.operation.rocks],
      }
    }))
  },

  updateRock: async (id, patch) => {
    set((s) => ({
      operation: {
        ...s.operation,
        rocks: s.operation.rocks.map((r) => r.id === id ? { ...r, ...patch } : r),
      }
    }))
    const dbPatch: Record<string, unknown> = {}
    if (patch.status)             dbPatch.status            = patch.status
    if (patch.assignedMinerId !== undefined) dbPatch.assigned_miner_id = patch.assignedMinerId
    if (patch.notes !== undefined) dbPatch.notes            = patch.notes
    if (patch.ores)               dbPatch.ores              = patch.ores
    if (Object.keys(dbPatch).length > 0) {
      await dbUpdateRock(id, dbPatch).catch(console.error)
    }
  },

  removeRock: async (id) => {
    set((s) => ({
      operation: {
        ...s.operation,
        rocks: s.operation.rocks.filter((r) => r.id !== id),
      }
    }))
    await dbRemoveRock(id).catch(console.error)
  },

  // ── Refinery ──
  addRefineryJob: async (job) => {
    const operationId = get().operationId
    if (!operationId) return
    const data = await dbAddRefineryJob(operationId, {
      material_id:         job.materialId,
      material_name:       job.materialName,
      quantity_scu:        job.quantitySCU,
      method:              job.method,
      station_id:          job.stationId,
      station_name:        job.stationName,
      status:              job.status,
      started_at:          new Date(job.startedAt).toISOString(),
      ends_at:             new Date(job.endsAt).toISOString(),
      fee_paid:            job.feePaid,
      paid_by_player_id:   job.paidByPlayerId,
      yield_multiplier:    job.yieldMultiplier,
      estimated_value_auec: job.estimatedValueAUEC,
    })
    set((s) => ({
      operation: {
        ...s.operation,
        refineryJobs: [...s.operation.refineryJobs, { ...job, id: data.id }],
      }
    }))
  },

  updateRefineryJob: async (id, patch) => {
    set((s) => ({
      operation: {
        ...s.operation,
        refineryJobs: s.operation.refineryJobs.map((j) => j.id === id ? { ...j, ...patch } : j),
      }
    }))
    const dbPatch: Record<string, unknown> = {}
    if (patch.status) dbPatch.status = patch.status
    if (Object.keys(dbPatch).length > 0) {
      await dbUpdateRefineryJob(id, dbPatch).catch(console.error)
    }
  },

  removeRefineryJob: async (id) => {
    set((s) => ({
      operation: {
        ...s.operation,
        refineryJobs: s.operation.refineryJobs.filter((j) => j.id !== id),
      }
    }))
    await dbRemoveRefineryJob(id).catch(console.error)
  },

  // ── Sales ──
  addSale: async (sale) => {
    const operationId = get().operationId
    if (!operationId) return
    const data = await dbAddSale(operationId, {
      material_id:       sale.materialId,
      material_name:     sale.materialName,
      quantity_scu:      sale.quantitySCU,
      price_per_scu:     sale.pricePerSCU,
      terminal_id:       sale.terminalId,
      terminal_name:     sale.terminalName,
      sold_by_player_id: sale.soldByPlayerId,
    })
    set((s) => ({
      operation: {
        ...s.operation,
        sales: [...s.operation.sales, { ...sale, id: data.id, soldAt: Date.now() }],
      }
    }))
  },

  removeSale: async (id) => {
    set((s) => ({
      operation: {
        ...s.operation,
        sales: s.operation.sales.filter((sale) => sale.id !== id),
      }
    }))
    await dbRemoveSale(id).catch(console.error)
  },

  // ── Expenses ──
  addExpense: async (expense) => {
    const operationId = get().operationId
    if (!operationId) return
    const data = await dbAddExpense(operationId, {
      description:       expense.description,
      amount_auec:       expense.amountAUEC,
      paid_by_player_id: expense.paidByPlayerId,
      category:          expense.category,
    })
    set((s) => ({
      operation: {
        ...s.operation,
        expenses: [...s.operation.expenses, { ...expense, id: data.id, createdAt: Date.now() }],
      }
    }))
  },

  removeExpense: async (id) => {
    set((s) => ({
      operation: {
        ...s.operation,
        expenses: s.operation.expenses.filter((e) => e.id !== id),
      }
    }))
    await dbRemoveExpense(id).catch(console.error)
  },

  // ── Computed ──
  getTotalRevenue: () => {
    const { sales } = get().operation
    return Math.round(sales.reduce((sum, s) => sum + s.pricePerSCU * s.quantitySCU, 0))
  },

  getTotalExpenses: () => {
    const { expenses, refineryJobs } = get().operation
    const expTotal = expenses.reduce((sum, e) => sum + e.amountAUEC, 0)
    const refFees  = refineryJobs.reduce((sum, j) => sum + j.feePaid, 0)
    return Math.round(expTotal + refFees)
  },

  getNetProfit: () => {
    const { getTotalRevenue, getTotalExpenses } = get()
    return Math.max(0, getTotalRevenue() - getTotalExpenses())
  },

  getEstimatedRevenue: () => {
    const { sales, refineryJobs } = get().operation
    const sold     = sales.reduce((sum, s) => sum + s.pricePerSCU * s.quantitySCU, 0)
    const refining = refineryJobs
      .filter((j) => j.status !== 'done')
      .reduce((sum, j) => sum + j.estimatedValueAUEC, 0)
    return Math.round(sold + refining)
  },

  getPayouts: () => {
    const { players, splitMethod } = get().operation
    const net      = get().getNetProfit()
    const expenses = get().operation.expenses
    const refFees  = get().operation.refineryJobs

    if (players.length === 0) return []

    const getFraction = (player: Player): number => {
      if (splitMethod === 'equal') return 1 / players.length
      if (splitMethod === 'custom_weights') {
        const total = players.reduce((s, p) => s + (p.shareWeight || 1), 0)
        return (player.shareWeight || 1) / total
      }
      const roleWeights: Record<string, number> = {
        scout: 20, miner: 35, raw_hauler: 20, refine_hauler: 25,
      }
      const total = players.reduce((s, p) => s + (roleWeights[p.operationRole] ?? 20), 0)
      return (roleWeights[player.operationRole] ?? 20) / total
    }

    const holder = players.find((p) => p.operationRole === 'refine_hauler') ?? players[0]

    return players.map((player) => {
      const fraction    = getFraction(player)
      const profitShare = Math.round(net * fraction)
      const expReimburse = expenses
        .filter((e) => e.paidByPlayerId === player.id)
        .reduce((s, e) => s + e.amountAUEC, 0)
      const refReimburse = refFees
        .filter((j) => j.paidByPlayerId === player.id)
        .reduce((s, j) => s + j.feePaid, 0)
      const expenseReimbursement = Math.round(expReimburse + refReimburse)
      const totalReceive = profitShare + expenseReimbursement
      return {
        player,
        profitShare,
        expenseReimbursement,
        totalReceive,
        isRevenueHolder: player.id === holder?.id,
      } satisfies PayoutEntry
    })
  },
}))
