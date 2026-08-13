import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { apiRequest, AuthRequiredError } from '../lib/apiClient'
import { PRODUCT } from '../config'

const STORAGE_KEY = 'websitegeek_webtools_subscription'

// Only used as an optimistic first paint while the real (server) status is
// still loading — Stripe, queried through the backend, is the actual source
// of truth. Never trusted on its own once `status` moves past 'loading'.
function readCachedTier() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw === 'pro' ? 'pro' : 'free'
  } catch {
    return 'free'
  }
}

function writeCachedTier(tier) {
  try {
    window.localStorage.setItem(STORAGE_KEY, tier)
  } catch {
    // localStorage unavailable — just skip the optimistic cache.
  }
}

const SubscriptionContext = createContext(null)

export function SubscriptionProvider({ children }) {
  const { user, getFreshIdToken } = useAuth()
  const [tier, setTier] = useState(readCachedTier)
  const [status, setStatus] = useState('idle')

  const refreshSubscriptionStatus = useCallback(async () => {
    if (!user) {
      setTier('free')
      setStatus('idle')
      return 'free'
    }

    setStatus('loading')
    try {
      const data = await apiRequest(`/api/subscription-status?product=${PRODUCT}`, { getFreshIdToken })
      const nextTier = data?.tier === 'pro' ? 'pro' : 'free'
      setTier(nextTier)
      setStatus('ready')
      return nextTier
    } catch (err) {
      // Never fail open to 'pro' — a network hiccup or expired token should
      // never look like an active purchase.
      setTier('free')
      setStatus(err instanceof AuthRequiredError ? 'idle' : 'error')
      return 'free'
    }
  }, [user, getFreshIdToken])

  useEffect(() => {
    writeCachedTier(tier)
  }, [tier])

  // Re-checks on sign-in, sign-out, and account switch (keyed on email so a
  // different Google account never inherits the previous one's cached tier).
  useEffect(() => {
    refreshSubscriptionStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email])

  // Dev-only local override — flips the badge for UI testing, but the next
  // refreshSubscriptionStatus() call (sign-in, page load, checkout return)
  // will overwrite it with the real server-side status.
  const devOverrideFree = useCallback(() => setTier('free'), [])

  const value = {
    tier,
    isPro: tier === 'pro',
    status,
    refreshSubscriptionStatus,
    devOverrideFree,
  }

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext)
  if (!ctx) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return ctx
}
