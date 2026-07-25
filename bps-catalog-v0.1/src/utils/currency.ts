import type { CurrencyCode } from '../types'

export const CURRENCY_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 151.2,
}

export const CURRENCY_SYMBOL: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
}

export function formatMoney(amountUsd: number, currency: CurrencyCode): string {
  const converted = amountUsd * CURRENCY_RATES[currency]
  if (currency === 'JPY') {
    return `${CURRENCY_SYMBOL[currency]}${Math.round(converted).toLocaleString('en-US')}`
  }
  return `${CURRENCY_SYMBOL[currency]}${converted.toFixed(2)}`
}
