import { Card, CardContent } from "@/components/ui/card"
import { trpc } from "@/trpc"
import { Prisma } from "@prisma/client"
import dayjs from "dayjs"
import Link from "next/link"
import { useState } from "react"
import { formatNumber } from "utils"

interface AuctionLineItemProps {
  item: Prisma.PostGetPayload<{
    include: {
      _count: {
        select: {
          Bids: true,
        },
      },
      AssetOnPost: {
        include: {
          asset: true,
        }
      },
      Bids: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
        select: {
          id: true,
          userId: true,
          amount: true,
        }
      }
    }
  }>
}

const AuctionLineItem = ({item}: AuctionLineItemProps) => {
  const [{amount, total}, setState] = useState({
    amount: item.Bids[0].amount ?? item.priceMin,
    total: item._count.Bids
  })

  trpc.bids.listenToBidAdded.useSubscription({auctionIds: item.id}, {
    onData: (bid) => {
      setState((prev) => (
        {
          amount: bid.amount,
          total: prev.total + 1,
        }
      ))
    }
  })

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-2 items-center grid-cols-[50px_auto]">
          <img
            src={item.AssetOnPost[0].asset.url}
            className="object-cover w-[50px] h-[50px] rounded"
          />
          <div className="h-[50px] flex items-center justify-between">
            <div>
              <Link href={`/auctions/${item.slug}`} className="font-semibold text-foreground">{item.name}</Link>
              <p className="text-sm text-muted-foreground">{`Ends on: ${dayjs(item.endTime).format('DD MMM YYYY HH:mm')}`}</p>
            </div>
            <div>
              <p className="text-lg font-bold">{formatNumber(amount, item.currency)}</p>
              <p className="text-muted-foreground text-sm">{`Total bids: ${total}`}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AuctionLineItem
