import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {AuctionFeedItem} from 'server/router/feed/validation'
import { Clock, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatNumber } from 'utils'
import Link from "next/link"
import { trpc } from "@/trpc"
import { useState } from "react"
import { useTimer } from "@/hooks/use-timer.hook"
import AuctionHeart from "../auction-heart"


type AuctionCardProps = {item: AuctionFeedItem}

const AuctionCard = ({item}: AuctionCardProps) => {
  const time = useTimer(item.end_time)

  const [{amount, count}, setState] = useState({
    amount: item.amount,
    count: item.bid_count
  })

  trpc.bids.listenToBidAdded.useSubscription({auctionIds: item.id, ignoreMe: false}, {
    onData: (data) => {
      setState((prev) => ({
        amount:data.amount,
        count: prev.count + 1
      }))
    }
  })

  const imageUrl = item.assets[0]

  return (
    <Card className="flex flex-col">
      <CardHeader className="p-0">
        <img
          src={imageUrl.url}
          alt={item.name}
          width={imageUrl.width}
          height={imageUrl.height}
          className="w-full h-40 object-cover rounded-t-lg"
        />
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-lg mb-2">
          <Link href={`/auctions/${item.slug}`}>{item.name}</Link>
        </CardTitle>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1 text-green-600" />
            <span className="font-semibold">{formatNumber(amount, item.currency)}</span>
          </div>
          <Badge variant="secondary">{`${count} bids`}</Badge>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-1" />
          <span suppressHydrationWarning={true}>{`${time} left`}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <Link href={`/auctions/${item.slug}`}>
          <Button className="w-full">Place Bid</Button>
        </Link>
        <AuctionHeart id={item.id} />
      </CardFooter>
    </Card>
  )
}


export default AuctionCard
