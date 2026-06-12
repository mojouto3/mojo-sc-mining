import type { UEXCommodityPrice, UEXTerminal, UEXRefineryMethod } from '@/types'

const BASE = 'https://uexcorp.space/api/2.0'
const CACHE_TTL_PRICES = 5 * 60 * 1000      // 5 min — prices change often
const CACHE_TTL_STATIC = 60 * 60 * 1000     // 1 hour — stations/methods rarely change

// ─── Simple in-memory cache ───────────────────────────────────────────────────

const cache = new Map<string, { data: unknown; expiresAt: number }>()

async function get<T>(endpoint: string, ttl: number): Promise<T> {
  const cached = cache.get(endpoint)
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data as T
  }

  const res = await fetch(`${BASE}/${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) throw new Error(`UEX API error: ${res.status} ${endpoint}`)

  const json = await res.json()
  // UEX API wraps data in { data: [...] }
  const data = json.data ?? json

  cache.set(endpoint, { data, expiresAt: Date.now() + ttl })
  return data as T
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/** Live sell prices for all mining commodities at all terminals */
export async function fetchRawPrices(): Promise<UEXCommodityPrice[]> {
  return get<UEXCommodityPrice[]>('commodities_raw_prices_all', CACHE_TTL_PRICES)
}

/** Live refined commodity sell prices */
export async function fetchCommodityPrices(): Promise<UEXCommodityPrice[]> {
  return get<UEXCommodityPrice[]>('commodities_prices_all', CACHE_TTL_PRICES)
}

/** All terminals (TDD, refinery, etc.) */
export async function fetchTerminals(): Promise<UEXTerminal[]> {
  return get<UEXTerminal[]>('terminals', CACHE_TTL_STATIC)
}

/** Refinery methods (Cormack, Dinyan, etc.) with yield/cost/time modifiers */
export async function fetchRefineryMethods(): Promise<UEXRefineryMethod[]> {
  return get<UEXRefineryMethod[]>('refineries_methods', CACHE_TTL_STATIC)
}

/** Best sell price for a commodity across all terminals */
export async function getBestSellPrice(
  commodityName: string
): Promise<{ terminalName: string; stationName: string; pricePerSCU: number } | null> {
  try {
    const prices = await fetchCommodityPrices()
    const matches = prices
      .filter(
        (p) =>
          p.commodity_name?.toLowerCase() === commodityName.toLowerCase() &&
          p.price_sell > 0
      )
      .sort((a, b) => b.price_sell - a.price_sell)

    if (matches.length === 0) return null

    const best = matches[0]
    return {
      terminalName: best.terminal_name,
      stationName: best.station_name,
      pricePerSCU: best.price_sell,
    }
  } catch {
    return null
  }
}

/** Top N sell locations for a commodity */
export async function getTopSellLocations(
  commodityName: string,
  limit = 5
): Promise<{ terminalName: string; stationName: string; pricePerSCU: number }[]> {
  try {
    const prices = await fetchCommodityPrices()
    return prices
      .filter(
        (p) =>
          p.commodity_name?.toLowerCase() === commodityName.toLowerCase() &&
          p.price_sell > 0
      )
      .sort((a, b) => b.price_sell - a.price_sell)
      .slice(0, limit)
      .map((p) => ({
        terminalName: p.terminal_name,
        stationName: p.station_name,
        pricePerSCU: p.price_sell,
      }))
  } catch {
    return []
  }
}

/** Clear cache (e.g. force refresh) */
export function clearCache(): void {
  cache.clear()
}
