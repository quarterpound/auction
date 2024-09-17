import { formatNumber } from "utils"

interface PriceProps {
  amount: number
  currency: string
}

const Price = ({amount, currency}: PriceProps) => {
  return <span className="text-3xl font-bold">{formatNumber(amount, currency)}</span>
}

export default Price
