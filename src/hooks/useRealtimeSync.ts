import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useMojoStore } from '@/store'
import { loadOperation } from '@/api/operations'

export function useRealtimeSync(operationId: string) {
  const store = useMojoStore.getState()

  useEffect(() => {
  console.log('useRealtimeSync operationId:', operationId)
  if (!operationId) return

    // Load full state on mount
    loadOperation(operationId).then(({ operation, players, ships, rocks, refineryJobs, sales, expenses }) => {
      if (!operation) return
      useMojoStore.setState((s) => ({
        operation: {
          ...s.operation,
          id:           operation.id,
          name:         operation.name,
          splitMethod:  operation.split_method as any,
          notes:        operation.notes ?? '',
          players:      (players ?? []).map(mapPlayer),
          ships:        (ships ?? []).map(mapShip),
          rocks:        (rocks ?? []).map(mapRock),
          refineryJobs: (refineryJobs ?? []).map(mapRefineryJob),
          sales:        (sales ?? []).map(mapSale),
          expenses:     (expenses ?? []).map(mapExpense),
        }
      }))
    })

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`operation:${operationId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ships', filter: `operation_id=eq.${operationId}` },
        () => reloadTable('ships', operationId))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `operation_id=eq.${operationId}` },
        () => reloadTable('players', operationId))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rocks', filter: `operation_id=eq.${operationId}` },
        () => reloadTable('rocks', operationId))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'refinery_jobs', filter: `operation_id=eq.${operationId}` },
        () => reloadTable('refineryJobs', operationId))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales', filter: `operation_id=eq.${operationId}` },
        () => reloadTable('sales', operationId))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `operation_id=eq.${operationId}` },
        () => reloadTable('expenses', operationId))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'operations', filter: `id=eq.${operationId}` },
        () => reloadTable('operation', operationId))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [operationId])
}

// Reload a single table and update store
async function reloadTable(table: string, operationId: string) {
  console.log('reloadTable triggered:', table)
  const data = await loadOperation(operationId)
  console.log('reloadTable data:', table, data)
  useMojoStore.setState((s) => ({
    operation: {
      ...s.operation,
      ...(table === 'ships'        && { ships:        (data.ships ?? []).map(mapShip) }),
      ...(table === 'players'      && { players:      (data.players ?? []).map(mapPlayer) }),
      ...(table === 'rocks'        && { rocks:        (data.rocks ?? []).map(mapRock) }),
      ...(table === 'refineryJobs' && { refineryJobs: (data.refineryJobs ?? []).map(mapRefineryJob) }),
      ...(table === 'sales'        && { sales:        (data.sales ?? []).map(mapSale) }),
      ...(table === 'expenses'     && { expenses:     (data.expenses ?? []).map(mapExpense) }),
      ...(table === 'operation'    && data.operation && {
        name:        data.operation.name,
        splitMethod: data.operation.split_method as any,
        notes:       data.operation.notes ?? '',
      }),
    }
  }))
}

// ─── Mappers (Supabase → TypeScript types) ───────────────────────────────────

function mapPlayer(p: any) {
  return {
    id:            p.id,
    handle:        p.handle,
    isFleetManager: p.is_fleet_manager ?? false,
    operationRole: p.operation_role,
    shipRole:      p.ship_role,
    shipId:        p.ship_id ?? null,
    status:        p.status,
    shareWeight:   p.share_weight,
    payoutStatus:  p.payout_status,
    paidAt:        p.paid_at ? new Date(p.paid_at).getTime() : undefined,
    joinedAt:      new Date(p.joined_at).getTime(),
  }
}

function mapShip(s: any) {
  return {
    id:       s.id,
    name:     s.name,
    model:    s.model,
    type:     s.type,
    status:   s.status,
    location: s.location,
    crewIds:  [],
  }
}

function mapRock(r: any) {
  return {
    id:              r.id,
    location:        r.location,
    scoutedBy:       r.scouted_by,
    ores:            r.ores ?? [],
    status:          r.status,
    assignedMinerId: r.assigned_miner_id ?? null,
    notes:           r.notes ?? '',
    scoutedAt:       new Date(r.scouted_at).getTime(),
  }
}

function mapRefineryJob(j: any) {
  return {
    id:                 j.id,
    materialId:         j.material_id,
    materialName:       j.material_name,
    quantitySCU:        j.quantity_scu,
    method:             j.method,
    stationId:          j.station_id,
    stationName:        j.station_name,
    status:             j.status,
    startedAt:          new Date(j.started_at).getTime(),
    endsAt:             new Date(j.ends_at).getTime(),
    feePaid:            j.fee_paid,
    paidByPlayerId:     j.paid_by_player_id ?? '',
    yieldMultiplier:    j.yield_multiplier,
    estimatedValueAUEC: j.estimated_value_auec,
  }
}

function mapSale(s: any) {
  return {
    id:             s.id,
    materialId:     s.material_id,
    materialName:   s.material_name,
    quantitySCU:    s.quantity_scu,
    pricePerSCU:    s.price_per_scu,
    terminalId:     s.terminal_id,
    terminalName:   s.terminal_name,
    soldByPlayerId: s.sold_by_player_id ?? '',
    soldAt:         new Date(s.sold_at).getTime(),
  }
}

function mapExpense(e: any) {
  return {
    id:              e.id,
    description:     e.description,
    amountAUEC:      e.amount_auec,
    paidByPlayerId:  e.paid_by_player_id ?? '',
    category:        e.category,
    createdAt:       new Date(e.created_at).getTime(),
  }
}