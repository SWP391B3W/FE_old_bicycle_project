export function normalizeCurrencyDigits(value: string | number | null | undefined): string {
  return String(value ?? '').replace(/[^\d]/g, '')
}

export function formatCurrencyInput(value: string | number | null | undefined): string {
  const digits = normalizeCurrencyDigits(value)

  if (!digits) {
    return ''
  }

  return Number(digits).toLocaleString('vi-VN')
}

export function parseCurrencyInput(value: string | number | null | undefined): number | null {
  const digits = normalizeCurrencyDigits(value)

  if (!digits) {
    return null
  }

  const parsedValue = Number(digits)
  return Number.isFinite(parsedValue) ? parsedValue : null
}

export function formatPriceDisplay(price: number): string {
  if (!Number.isFinite(price) || price < 0) {
    return '—'
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price)
}
