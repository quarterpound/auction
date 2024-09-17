import { FormatMoney } from 'format-money-js'

export const formatNumber = (amount: number, currency: string) => {
  // return new Intl.NumberFormat('az-AZ', { currency, maximumFractionDigits: 2, minimumFractionDigits: 2, currencyDisplay: 'narrowSymbol', style: 'currency' }).format(amount)
  return new FormatMoney({
   decimals: 2,
    symbol: currency,
  }).from(amount)?.toString()
}
