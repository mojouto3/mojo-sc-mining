import React from 'react'
import type { OperationRole, PlayerStatus, ShipType } from '@/types'

// ─── Role colors ──────────────────────────────────────────────────────────────

export const ROLE_COLORS: Record<OperationRole, string> = {
  scout:         'bg-sky-500/10    text-sky-400    border-sky-500/20',
  miner:         'bg-amber-500/10  text-amber-400  border-amber-500/20',
  raw_hauler:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  refine_hauler: 'bg-violet-500/10 text-violet-400  border-violet-500/20',
}

export const ROLE_LABELS: Record<OperationRole, string> = {
  scout:         'Scout',
  miner:         'Miner',
  raw_hauler:    'Raw Hauler',
  refine_hauler: 'Refine Hauler',
}

export const SHIP_TYPE_COLORS: Record<ShipType, string> = {
  scout:         'border-sky-500/30',
  mining:        'border-amber-500/30',
  raw_hauler:    'border-emerald-500/30',
  refine_hauler: 'border-violet-500/30',
}

export const STATUS_COLORS: Record<PlayerStatus, string> = {
  standby:  'bg-slate-500/10 text-slate-400 border-slate-500/20',
  scanning: 'bg-sky-500/10   text-sky-400   border-sky-500/20',
  mining:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
  swapping: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  hauling:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  refining: 'bg-violet-500/10 text-violet-400  border-violet-500/20',
  selling:  'bg-green-500/10  text-green-400   border-green-500/20',
  offline:  'bg-slate-700/20  text-slate-500   border-slate-700/20',
}

export const STATUS_LABELS: Record<PlayerStatus, string> = {
  standby:  'Standby',
  scanning: 'Scanning',
  mining:   'Mining',
  swapping: 'Swapping',
  hauling:  'Hauling',
  refining: 'Refining',
  selling:  'Selling',
  offline:  'Offline',
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

interface AvatarProps {
  handle: string
  role: OperationRole
  size?: 'sm' | 'md'
}

export function Avatar({ handle, role, size = 'md' }: AvatarProps) {
  const initials = handle.slice(0, 2).toUpperCase()
  const sz = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'
  const colors: Record<OperationRole, string> = {
    scout:         'bg-sky-500/15    text-sky-400',
    miner:         'bg-amber-500/15  text-amber-400',
    raw_hauler:    'bg-emerald-500/15 text-emerald-400',
    refine_hauler: 'bg-violet-500/15 text-violet-400',
  }
  return (
    <div className={`${sz} ${colors[role]} rounded-full flex items-center justify-center font-mono font-bold flex-shrink-0`}>
      {initials}
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode
  className?: string
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wide border ${className}`}>
      {children}
    </span>
  )
}

// ─── RoleBadge ────────────────────────────────────────────────────────────────

export function RoleBadge({ role }: { role: OperationRole }) {
  return (
    <Badge className={ROLE_COLORS[role]}>
      {ROLE_LABELS[role]}
    </Badge>
  )
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: PlayerStatus }) {
  return (
    <Badge className={STATUS_COLORS[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}

// ─── Panel ────────────────────────────────────────────────────────────────────

interface PanelProps {
  children: React.ReactNode
  className?: string
}

export function Panel({ children, className = '' }: PanelProps) {
  return (
    <div className={`bg-slate-900/80 border border-slate-700/50 rounded-xl backdrop-blur-sm ${className}`}>
      {children}
    </div>
  )
}

// ─── PanelHeader ─────────────────────────────────────────────────────────────

interface PanelHeaderProps {
  title: React.ReactNode
  subtitle?: string
  action?: React.ReactNode
}

export function PanelHeader({ title, subtitle, action }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80">
      <div>
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
          {title}
        </h3>
        {subtitle && (
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}

export function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div className={`rounded-lg p-3 border ${accent ? 'bg-amber-500/5 border-amber-500/20' : 'bg-slate-950/60 border-slate-800/60'}`}>
      <div className={`text-[10px] font-mono uppercase tracking-wider mb-1 ${accent ? 'text-amber-500/70' : 'text-slate-500'}`}>
        {label}
      </div>
      <div className={`text-lg font-black font-mono leading-none ${accent ? 'text-amber-400' : 'text-slate-200'}`}>
        {value}
      </div>
      {sub && <div className="text-[10px] text-slate-500 font-mono mt-1">{sub}</div>}
    </div>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode
  message: string
  action?: React.ReactNode
}

export function EmptyState({ icon, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed border-slate-800 rounded-xl">
      {icon && <div className="text-slate-600 mb-3">{icon}</div>}
      <p className="text-xs text-slate-500 font-sans">{message}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

// ─── Btn ──────────────────────────────────────────────────────────────────────

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

export function Btn({ variant = 'ghost', size = 'sm', className = '', ...props }: BtnProps) {
  const base = 'inline-flex items-center gap-1.5 font-mono font-bold uppercase tracking-wide rounded transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
  const sizes = { sm: 'text-[10px] px-2.5 py-1.5', md: 'text-xs px-3 py-2' }
  const variants = {
    primary: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
    ghost:   'bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300',
    danger:  'bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400',
  }
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
