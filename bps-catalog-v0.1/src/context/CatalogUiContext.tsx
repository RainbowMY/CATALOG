import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CurrencyCode, ShipCountry } from '../types'

interface CatalogUiState {
  currency: CurrencyCode
  setCurrency: (c: CurrencyCode) => void
  shipTo: ShipCountry
  setShipTo: (c: ShipCountry) => void
  keyword: string
  setKeyword: (k: string) => void
  /** Homepage in-page Browse button scrolled out of view */
  stickyBrowse: boolean
  setStickyBrowse: (v: boolean) => void
  /** Homepage category panel scrolled out of view */
  stickyCategories: boolean
  setStickyCategories: (v: boolean) => void
}

const CatalogUiContext = createContext<CatalogUiState | null>(null)

export function CatalogUiProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>('USD')
  const [shipTo, setShipTo] = useState<ShipCountry>('All')
  const [keyword, setKeyword] = useState('')
  const [stickyBrowse, setStickyBrowse] = useState(false)
  const [stickyCategories, setStickyCategories] = useState(false)

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      shipTo,
      setShipTo,
      keyword,
      setKeyword,
      stickyBrowse,
      setStickyBrowse,
      stickyCategories,
      setStickyCategories,
    }),
    [currency, shipTo, keyword, stickyBrowse, stickyCategories],
  )

  return <CatalogUiContext.Provider value={value}>{children}</CatalogUiContext.Provider>
}

export function useCatalogUi() {
  const ctx = useContext(CatalogUiContext)
  if (!ctx) throw new Error('useCatalogUi must be used within CatalogUiProvider')
  return ctx
}
