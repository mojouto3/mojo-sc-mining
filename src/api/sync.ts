import { supabase } from '@/lib/supabase'

// ─── Ships ────────────────────────────────────────────────────────────────────

export async function dbAddShip(operationId: string, ship: {
  name: string; model: string; type: string; status: string; location: string
}) {
  const { data, error } = await supabase
    .from('ships')
    .insert({ operation_id: operationId, ...ship })
    .select().single()
  if (error) throw error
  return data
}

export async function dbUpdateShip(id: string, patch: Record<string, unknown>) {
  const { error } = await supabase.from('ships').update(patch).eq('id', id)
  if (error) throw error
}

export async function dbRemoveShip(id: string) {
  const { error } = await supabase.from('ships').delete().eq('id', id)
  if (error) throw error
}

// ─── Players ──────────────────────────────────────────────────────────────────

export async function dbAddPlayer(operationId: string, player: {
  handle: string; operation_role: string; ship_role: string;
  ship_id: string | null; status: string; share_weight: number
}) {
  const { data, error } = await supabase
    .from('players')
    .insert({ operation_id: operationId, ...player })
    .select().single()
  if (error) throw error
  return data
}

export async function dbUpdatePlayer(id: string, patch: Record<string, unknown>) {
  const { error } = await supabase.from('players').update(patch).eq('id', id)
  if (error) throw error
}

export async function dbRemovePlayer(id: string) {
  const { error } = await supabase.from('players').delete().eq('id', id)
  if (error) throw error
}

// ─── Rocks ────────────────────────────────────────────────────────────────────

export async function dbAddRock(operationId: string, rock: {
  location: string; scouted_by: string; ores: unknown[];
  status: string; assigned_miner_id: string | null; notes: string
}) {
  const { data, error } = await supabase
    .from('rocks')
    .insert({ operation_id: operationId, ...rock })
    .select().single()
  if (error) throw error
  return data
}

export async function dbUpdateRock(id: string, patch: Record<string, unknown>) {
  const { error } = await supabase.from('rocks').update(patch).eq('id', id)
  if (error) throw error
}

export async function dbRemoveRock(id: string) {
  const { error } = await supabase.from('rocks').delete().eq('id', id)
  if (error) throw error
}

// ─── Refinery jobs ────────────────────────────────────────────────────────────

export async function dbAddRefineryJob(operationId: string, job: {
  material_id: string; material_name: string; quantity_scu: number;
  method: string; station_id: string; station_name: string;
  status: string; started_at: string; ends_at: string;
  fee_paid: number; paid_by_player_id: string;
  yield_multiplier: number; estimated_value_auec: number
}) {
  const { data, error } = await supabase
    .from('refinery_jobs')
    .insert({ operation_id: operationId, ...job })
    .select().single()
  if (error) throw error
  return data
}

export async function dbUpdateRefineryJob(id: string, patch: Record<string, unknown>) {
  const { error } = await supabase.from('refinery_jobs').update(patch).eq('id', id)
  if (error) throw error
}

export async function dbRemoveRefineryJob(id: string) {
  const { error } = await supabase.from('refinery_jobs').delete().eq('id', id)
  if (error) throw error
}

// ─── Sales ────────────────────────────────────────────────────────────────────

export async function dbAddSale(operationId: string, sale: {
  material_id: string; material_name: string; quantity_scu: number;
  price_per_scu: number; terminal_id: string; terminal_name: string;
  sold_by_player_id: string
}) {
  const { data, error } = await supabase
    .from('sales')
    .insert({ operation_id: operationId, ...sale })
    .select().single()
  if (error) throw error
  return data
}

export async function dbRemoveSale(id: string) {
  const { error } = await supabase.from('sales').delete().eq('id', id)
  if (error) throw error
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export async function dbAddExpense(operationId: string, expense: {
  description: string; amount_auec: number;
  paid_by_player_id: string; category: string
}) {
  const { data, error } = await supabase
    .from('expenses')
    .insert({ operation_id: operationId, ...expense })
    .select().single()
  if (error) throw error
  return data
}

export async function dbRemoveExpense(id: string) {
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw error
}

// ─── Operation ────────────────────────────────────────────────────────────────

export async function dbUpdateOperation(id: string, patch: Record<string, unknown>) {
  const { error } = await supabase
    .from('operations')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}