import { useState } from 'react'
import { Diamond, Plus, LogIn, AlertCircle } from 'lucide-react'
import { createOperation, findOperation, joinOperation } from '@/api/operations'

interface Props {
  onJoined: (operationId: string, playerId: string, inviteCode: string) => void
}

export function LandingView({ onJoined }: Props) {
  const [mode, setMode]             = useState<'home' | 'create' | 'join'>('home')
  const [opName, setOpName]         = useState('')
  const [handle, setHandle]         = useState('')
  const [role, setRole]             = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  async function handleCreate() {
    if (!opName.trim() || !handle.trim() || !role) return
    setLoading(true)
    setError('')
    try {
      const op = await createOperation(opName.trim())
      const player = await joinOperation(op.id, handle.trim(), role, true)
      localStorage.setItem('mojo_session', JSON.stringify({
        operationId: op.id,
        playerId: player.id,
        inviteCode: op.invite_code,
      }))
      onJoined(op.id, player.id, op.invite_code)
    } catch {
      setError('Failed to create operation. Try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    if (!inviteCode.trim() || !handle.trim() || !role) return
    setLoading(true)
    setError('')
    try {
      const op = await findOperation(inviteCode.trim())
      if (!op) {
        setError('Invalid invite code. Check and try again.')
        return
      }
      const player = await joinOperation(op.id, handle.trim(), role)
      localStorage.setItem('mojo_session', JSON.stringify({
        operationId: op.id,
        playerId: player.id,
        inviteCode: op.invite_code,
      }))
      onJoined(op.id, player.id, op.invite_code)
    } catch {
      setError('Failed to join operation. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const roleSelect = (
    <div>
      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Your role</label>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full bg-slate-900 border border-slate-800 text-sm text-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500 cursor-pointer"
      >
        <option value="" disabled>Select your role...</option>
        <option value="scout">Scout</option>
        <option value="miner">Miner</option>
        <option value="raw_hauler">Raw Hauler</option>
        <option value="refine_hauler">Refine Hauler</option>
      </select>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#020817' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
            <Diamond className="w-8 h-8 text-amber-500 animate-spin-slow" />
          </div>
          <h1 className="font-mono text-2xl font-bold tracking-widest text-white uppercase">
            Mojo <span className="text-amber-500">Mining</span>
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">SC Cooperative Operations</p>
        </div>

        {/* Home */}
        {mode === 'home' && (
          <div className="space-y-3">
            <button
              onClick={() => setMode('create')}
              className="w-full flex items-center gap-3 px-5 py-4 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 rounded-xl transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div className="text-left">
                <div className="text-sm font-bold text-amber-400">Create Operation</div>
                <div className="text-xs text-slate-500 font-mono">Start a new mining session as leader</div>
              </div>
            </button>

            <button
              onClick={() => setMode('join')}
              className="w-full flex items-center gap-3 px-5 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all cursor-pointer"
            >
              <LogIn className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <div className="text-left">
                <div className="text-sm font-bold text-slate-300">Join Operation</div>
                <div className="text-xs text-slate-500 font-mono">Enter invite code from your leader</div>
              </div>
            </button>
          </div>
        )}

        {/* Create */}
        {mode === 'create' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Operation name</label>
              <input
                autoFocus
                type="text"
                placeholder='e.g. "Lyria Weekend Run"'
                value={opName}
                onChange={(e) => setOpName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-sm text-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500 placeholder-slate-600"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Your in-game handle</label>
              <input
                type="text"
                placeholder="e.g. StarMinerX"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-sm text-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500 placeholder-slate-600"
              />
            </div>
            {roleSelect}

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={!opName.trim() || !handle.trim() || !role || loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-mono font-bold text-sm uppercase tracking-wide rounded-xl transition-all cursor-pointer"
            >
              {loading ? 'Creating...' : 'Create & Start'}
            </button>
            <button onClick={() => { setMode('home'); setError(''); setRole('') }}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 font-mono transition-colors cursor-pointer">
              ← Back
            </button>
          </div>
        )}

        {/* Join */}
        {mode === 'join' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Invite code</label>
              <input
                autoFocus
                type="text"
                placeholder="e.g. MJ4X9K"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full bg-slate-900 border border-slate-800 text-lg text-amber-400 font-mono text-center tracking-widest rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500 placeholder-slate-700 uppercase"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Your in-game handle</label>
              <input
                type="text"
                placeholder="e.g. StarMinerX"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-sm text-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500 placeholder-slate-600"
              />
            </div>
            {roleSelect}

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handleJoin}
              disabled={inviteCode.length !== 6 || !handle.trim() || !role || loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-mono font-bold text-sm uppercase tracking-wide rounded-xl transition-all cursor-pointer"
            >
              {loading ? 'Joining...' : 'Join Operation'}
            </button>
            <button onClick={() => { setMode('home'); setError(''); setRole('') }}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 font-mono transition-colors cursor-pointer">
              ← Back
            </button>
          </div>
        )}

      </div>
    </div>
  )
}