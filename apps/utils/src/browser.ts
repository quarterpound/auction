import { FormatMoney } from 'format-money-js'

export const formatNumber = (amount: number, currency: string) => {
  const currencySymbol = currency === 'USD' ? '$' : '€'
  return new FormatMoney({
   decimals: 2,
    symbol: currencySymbol,
  }).from(amount)?.toString()
}
