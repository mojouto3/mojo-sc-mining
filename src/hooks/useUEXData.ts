import { useState, useEffect, useCallback } from 'react'
import {
  fetchRefineryMethods,
  fetchTerminals,
  fetchCommodityPrices,
  clearCache,
} from '@/api/uex'
import type { UEXRefineryMethod, UEXTerminal, UEXCommodityPrice } from '@/types'

interface UEXData {
  refineryMethods: UEXRefineryMethod[]
  terminals: UEXTerminal[]
  commodityPrices: UEXCommodityPrice[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  refresh: () => void
}

export function useUEXData(): UEXData {
  const [refineryMethods, setRefineryMethods] = useState<UEXRefineryMethod[]>([])
  const [terminals, setTerminals] = useState<UEXTerminal[]>([])
  const [commodityPrices, setCommodityPrices] = useState<UEXCommodityPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => {
    clearCache()
    setTick((t) => t + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([
      fetchRefineryMethods(),
      fetchTerminals(),
      fetchCommodityPrices(),
    ])
      .then(([methods, terms, prices]) => {
        if (cancelled) return
        setRefineryMethods(methods)
        setTerminals(terms)
        setCommodityPrices(prices)
        setLastUpdated(new Date())
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load UEX data')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [tick])

  // Auto-refresh prices every 5 minutes
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  return { refineryMethods, terminals, commodityPrices, loading, error, lastUpdated, refresh }
}
