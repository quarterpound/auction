export const formatNumber = (amount: number, currency: string) => {
  return new Intl.NumberFormat('az-AZ', { currency, maximumFractionDigits: 2, minimumFractionDigits: 2, currencyDisplay: 'narrowSymbol' }).format(amount)
}
