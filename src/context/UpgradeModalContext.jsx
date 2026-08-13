import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const UpgradeModalContext = createContext(null)

export function UpgradeModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)

  const openUpgradeModal = useCallback(() => setIsOpen(true), [])
  const closeUpgradeModal = useCallback(() => setIsOpen(false), [])

  const value = useMemo(() => ({ isOpen, openUpgradeModal, closeUpgradeModal }), [isOpen, openUpgradeModal, closeUpgradeModal])

  return <UpgradeModalContext.Provider value={value}>{children}</UpgradeModalContext.Provider>
}

export function useUpgradeModal() {
  const ctx = useContext(UpgradeModalContext)
  if (!ctx) {
    throw new Error('useUpgradeModal must be used within an UpgradeModalProvider')
  }
  return ctx
}
