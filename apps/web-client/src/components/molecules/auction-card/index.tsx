import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {AuctionFeedItem} from 'server/router/feed/validation'
import { Clock, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Timer from "@/components/ui/timer"
import { formatNumber } from 'utils'
import Link from "next/link"


type AuctionCardProps = {item: AuctionFeedItem}

const AuctionCard = ({item}: AuctionCardProps) => {
  return (
    <Card className="flex flex-col">
      <CardHeader className="p-0">
        <img
          src={'/placeholder.svg'}
          alt={item.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-lg mb-2">{item.name}</CardTitle>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1 text-green-600" />
            <span className="font-semibold">{formatNumber(item.amount, item.currency)}</span>
          </div>
          <Badge variant="secondary">{`${item.bid_count} bids`}</Badge>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-1" />
          <span><Timer data={item.end_time} /> left</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/auctions/${item.slug}`}>
          <Button className="w-full">Place Bid</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}


export default AuctionCard
