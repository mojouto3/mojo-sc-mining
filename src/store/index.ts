import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Operation, Player, Ship, Rock, RefineryJob,
  CargoSale, Expense, SplitMethod, PayoutEntry,
} from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function newOperation(): Operation {
  return {
    id: uid(),
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

  // Operation
  setOperationName: (name: string) => void
  setSplitMethod: (method: SplitMethod) => void
  setNotes: (notes: string) => void
  resetOperation: () => void

  // Ships
  addShip: (ship: Omit<Ship, 'id' | 'crewIds'>) => string
  updateShip: (id: string, patch: Partial<Ship>) => void
  removeShip: (id: string) => void

  // Players
  addPlayer: (player: Omit<Player, 'id' | 'joinedAt' | 'payoutStatus'>) => string
  updatePlayer: (id: string, patch: Partial<Player>) => void
  removePlayer: (id: string) => void
  assignPlayerToShip: (playerId: string, shipId: string | null) => void
  markPlayerPaid: (playerId: string) => void

  // Rocks
  addRock: (rock: Omit<Rock, 'id' | 'scoutedAt'>) => string
  updateRock: (id: string, patch: Partial<Rock>) => void
  removeRock: (id: string) => void

  // Refinery
  addRefineryJob: (job: Omit<RefineryJob, 'id'>) => string
  updateRefineryJob: (id: string, patch: Partial<RefineryJob>) => void
  removeRefineryJob: (id: string) => void

  // Sales
  addSale: (sale: Omit<CargoSale, 'id' | 'soldAt'>) => string
  removeSale: (id: string) => void

  // Expenses
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => string
  removeExpense: (id: string) => void

  // Computed
  getPayouts: () => PayoutEntry[]
  getTotalRevenue: () => number
  getTotalExpenses: () => number
  getNetProfit: () => number
  getEstimatedRevenue: () => number  // includes in-progress refinery
}

// ─── Store implementation ─────────────────────────────────────────────────────

export const useMojoStore = create<MojoStore>()(
  persist(
    (set, get) => ({
      operation: newOperation(),

      // ── Operation ──
      setOperationName: (name) =>
        set((s) => ({ operation: { ...s.operation, name, updatedAt: Date.now() } })),

      setSplitMethod: (splitMethod) =>
        set((s) => ({ operation: { ...s.operation, splitMethod, updatedAt: Date.now() } })),

      setNotes: (notes) =>
        set((s) => ({ operation: { ...s.operation, notes, updatedAt: Date.now() } })),

      resetOperation: () => set({ operation: newOperation() }),

      // ── Ships ──
      addShip: (ship) => {
        const id = uid()
        set((s) => ({
          operation: {
            ...s.operation,
            ships: [...s.operation.ships, { ...ship, id, crewIds: [] }],
            updatedAt: Date.now(),
          },
        }))
        return id
      },

      updateShip: (id, patch) =>
        set((s) => ({
          operation: {
            ...s.operation,
            ships: s.operation.ships.map((sh) => (sh.id === id ? { ...sh, ...patch } : sh)),
            updatedAt: Date.now(),
          },
        })),

      removeShip: (id) =>
        set((s) => ({
          operation: {
            ...s.operation,
            ships: s.operation.ships.filter((sh) => sh.id !== id),
            // unassign players from removed ship
            players: s.operation.players.map((p) =>
              p.shipId === id ? { ...p, shipId: null } : p
            ),
            updatedAt: Date.now(),
          },
        })),

      // ── Players ──
      addPlayer: (player) => {
        const id = uid()
        set((s) => ({
          operation: {
            ...s.operation,
            players: [
              ...s.operation.players,
              { ...player, id, joinedAt: Date.now(), payoutStatus: 'pending', shareWeight: player.shareWeight ?? 1 },
            ],
            // if shipId provided, add to ship crewIds
            ships: player.shipId
              ? s.operation.ships.map((sh) =>
                  sh.id === player.shipId
                    ? { ...sh, crewIds: [...sh.crewIds, id] }
                    : sh
                )
              : s.operation.ships,
            updatedAt: Date.now(),
          },
        }))
        return id
      },

      updatePlayer: (id, patch) =>
        set((s) => ({
          operation: {
            ...s.operation,
            players: s.operation.players.map((p) => (p.id === id ? { ...p, ...patch } : p)),
            updatedAt: Date.now(),
          },
        })),

      removePlayer: (id) =>
        set((s) => ({
          operation: {
            ...s.operation,
            players: s.operation.players.filter((p) => p.id !== id),
            ships: s.operation.ships.map((sh) => ({
              ...sh,
              crewIds: sh.crewIds.filter((cid) => cid !== id),
            })),
            updatedAt: Date.now(),
          },
        })),

      assignPlayerToShip: (playerId, shipId) =>
        set((s) => {
          const player = s.operation.players.find((p) => p.id === playerId)
          const oldShipId = player?.shipId
          return {
            operation: {
              ...s.operation,
              players: s.operation.players.map((p) =>
                p.id === playerId ? { ...p, shipId } : p
              ),
              ships: s.operation.ships.map((sh) => {
                if (sh.id === oldShipId) {
                  return { ...sh, crewIds: sh.crewIds.filter((id) => id !== playerId) }
                }
                if (sh.id === shipId) {
                  return { ...sh, crewIds: [...sh.crewIds, playerId] }
                }
                return sh
              }),
              updatedAt: Date.now(),
            },
          }
        }),

      markPlayerPaid: (playerId) =>
        set((s) => ({
          operation: {
            ...s.operation,
            players: s.operation.players.map((p) =>
              p.id === playerId
                ? { ...p, payoutStatus: p.payoutStatus === 'paid' ? 'pending' : 'paid', paidAt: Date.now() }
                : p
            ),
            updatedAt: Date.now(),
          },
        })),

      // ── Rocks ──
      addRock: (rock) => {
        const id = uid()
        set((s) => ({
          operation: {
            ...s.operation,
            rocks: [{ ...rock, id, scoutedAt: Date.now() }, ...s.operation.rocks],
            updatedAt: Date.now(),
          },
        }))
        return id
      },

      updateRock: (id, patch) =>
        set((s) => ({
          operation: {
            ...s.operation,
            rocks: s.operation.rocks.map((r) => (r.id === id ? { ...r, ...patch } : r)),
            updatedAt: Date.now(),
          },
        })),

      removeRock: (id) =>
        set((s) => ({
          operation: {
            ...s.operation,
            rocks: s.operation.rocks.filter((r) => r.id !== id),
            updatedAt: Date.now(),
          },
        })),

      // ── Refinery ──
      addRefineryJob: (job) => {
        const id = uid()
        set((s) => ({
          operation: {
            ...s.operation,
            refineryJobs: [...s.operation.refineryJobs, { ...job, id }],
            updatedAt: Date.now(),
          },
        }))
        return id
      },

      updateRefineryJob: (id, patch) =>
        set((s) => ({
          operation: {
            ...s.operation,
            refineryJobs: s.operation.refineryJobs.map((j) =>
              j.id === id ? { ...j, ...patch } : j
            ),
            updatedAt: Date.now(),
          },
        })),

      removeRefineryJob: (id) =>
        set((s) => ({
          operation: {
            ...s.operation,
            refineryJobs: s.operation.refineryJobs.filter((j) => j.id !== id),
            updatedAt: Date.now(),
          },
        })),

      // ── Sales ──
      addSale: (sale) => {
        const id = uid()
        set((s) => ({
          operation: {
            ...s.operation,
            sales: [...s.operation.sales, { ...sale, id, soldAt: Date.now() }],
            updatedAt: Date.now(),
          },
        }))
        return id
      },

      removeSale: (id) =>
        set((s) => ({
          operation: {
            ...s.operation,
            sales: s.operation.sales.filter((sale) => sale.id !== id),
            updatedAt: Date.now(),
          },
        })),

      // ── Expenses ──
      addExpense: (expense) => {
        const id = uid()
        set((s) => ({
          operation: {
            ...s.operation,
            expenses: [...s.operation.expenses, { ...expense, id, createdAt: Date.now() }],
            updatedAt: Date.now(),
          },
        }))
        return id
      },

      removeExpense: (id) =>
        set((s) => ({
          operation: {
            ...s.operation,
            expenses: s.operation.expenses.filter((e) => e.id !== id),
            updatedAt: Date.now(),
          },
        })),

      // ── Computed ──
      getTotalRevenue: () => {
        const { sales } = get().operation
        return Math.round(sales.reduce((sum, s) => sum + s.pricePerSCU * s.quantitySCU, 0))
      },

      getTotalExpenses: () => {
        const { expenses, refineryJobs } = get().operation
        const expTotal = expenses.reduce((sum, e) => sum + e.amountAUEC, 0)
        const refFees = refineryJobs.reduce((sum, j) => sum + j.feePaid, 0)
        return Math.round(expTotal + refFees)
      },

      getNetProfit: () => {
        const { getTotalRevenue, getTotalExpenses } = get()
        return Math.max(0, getTotalRevenue() - getTotalExpenses())
      },

      getEstimatedRevenue: () => {
        const { sales, refineryJobs } = get().operation
        const sold = sales.reduce((sum, s) => sum + s.pricePerSCU * s.quantitySCU, 0)
        const refining = refineryJobs
          .filter((j) => j.status !== 'done')
          .reduce((sum, j) => sum + j.estimatedValueAUEC, 0)
        return Math.round(sold + refining)
      },

      getPayouts: () => {
        const { players, splitMethod } = get().operation
        const net = get().getNetProfit()
        const expenses = get().operation.expenses
        const refFees = get().operation.refineryJobs

        if (players.length === 0) return []

        // Calculate each player's share fraction
        const getFraction = (player: Player): number => {
          if (splitMethod === 'equal') {
            return 1 / players.length
          }
          if (splitMethod === 'custom_weights') {
            const total = players.reduce((s, p) => s + (p.shareWeight || 1), 0)
            return (player.shareWeight || 1) / total
          }
          // role_based — default weights per operation role
          const roleWeights: Record<string, number> = {
            scout: 20,
            miner: 35,
            raw_hauler: 20,
            refine_hauler: 25,
          }
          const total = players.reduce(
            (s, p) => s + (roleWeights[p.operationRole] ?? 20), 0
          )
          return (roleWeights[player.operationRole] ?? 20) / total
        }

        // Revenue holder = first refine_hauler or first player
        const holder = players.find((p) => p.operationRole === 'refine_hauler') ?? players[0]

        return players.map((player) => {
          const fraction = getFraction(player)
          const profitShare = Math.round(net * fraction)

          // Reimburse expenses paid by this player
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
    }),
    {
      name: 'mojo-mining-v1',
    }
  )
)
