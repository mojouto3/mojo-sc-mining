import { supabase } from '@/lib/supabase'

// Generate a random 6-char invite code
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

// Create a new operation in Supabase
export async function createOperation(name: string) {
  const invite_code = generateInviteCode()
  const { data, error } = await supabase
    .from('operations')
    .insert({ name, invite_code })
    .select()
    .single()

  if (error) throw error
  return data
}

// Find operation by invite code
export async function findOperation(invite_code: string) {
  const { data, error } = await supabase
    .from('operations')
    .select('*')
    .eq('invite_code', invite_code.toUpperCase())
    .single()

  if (error) return null
  return data
}

// Update operation fields
export async function updateOperation(id: string, patch: Record<string, unknown>) {
  const { error } = await supabase
    .from('operations')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// Join operation — add player to Supabase
export async function joinOperation(
  operation_id: string,
  handle: string,
  operation_role: string = 'miner',
  is_fleet_manager: boolean = false,
) {
  const { data, error } = await supabase
    .from('players')
    .insert({ operation_id, handle, operation_role, is_fleet_manager })
    .select()
    .single()

  if (error) throw error
  return data
}

// Load full operation state from Supabase
export async function loadOperation(operation_id: string) {
  const [
    { data: operation },
    { data: players },
    { data: ships },
    { data: rocks },
    { data: refineryJobs },
    { data: sales },
    { data: expenses },
  ] = await Promise.all([
    supabase.from('operations').select('*').eq('id', operation_id).single(),
    supabase.from('players').select('*').eq('operation_id', operation_id),
    supabase.from('ships').select('*').eq('operation_id', operation_id),
    supabase.from('rocks').select('*').eq('operation_id', operation_id),
    supabase.from('refinery_jobs').select('*').eq('operation_id', operation_id),
    supabase.from('sales').select('*').eq('operation_id', operation_id),
    supabase.from('expenses').select('*').eq('operation_id', operation_id),
  ])

  return { operation, players, ships, rocks, refineryJobs, sales, expenses }
}