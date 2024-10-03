import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useAppState } from "@/store"
import { trpc } from "@/trpc"
import { Prisma } from "@prisma/client"
import dayjs from "dayjs"
import Link from "next/link"
import { useState } from "react"
import { formatNumber } from "utils"
import { Badge } from "../ui/badge"
import Image from 'next/image'

interface AuctionBidItem {
  item: Prisma.PostGetPayload<{
    include: {
      AssetOnPost: {
        include: {
          asset: true,
        }
      },
      category: {
        include: {
          parent: true
        }
      },
      Bids: {
        take: 1,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          userId: true,
          amount: true,
        }
      }
    },
  }>
}

const AuctionBidItem = ({item}: AuctionBidItem) => {
  const { authUser } = useAppState()

  const [bid, setState] = useState({
    amount: item.Bids[0].amount,
    userId: item.Bids[0].userId,
  })

  trpc.bids.listenToBidAdded.useSubscription({auctionIds: item.id}, {
    onData: (bid) => {
      setState(bid)
    }
  })

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-2 items-center grid-cols-[50px_auto]">
          <Image
            src={item.AssetOnPost[0].asset.url}
            width={item.AssetOnPost[0].asset.width}
            height={item.AssetOnPost[0].asset.height}
            alt={item.name}
            className="object-cover w-[50px] h-[50px] rounded"
          />
          <div className="h-[50px] flex items-center justify-between">
            <div>
              <Link href={`/auctions/${item.category?.parent?.slug}/${item.category?.slug}/${item.slug}`} className="font-semibold text-foreground">{item.name}</Link>
              <p className="text-sm text-muted-foreground">{`Ends on: ${dayjs(item.endTime).format('DD MMM YYYY HH:mm')}`}</p>
            </div>
            <div>
              <p className="text-lg font-bold">{formatNumber(bid.amount, item.currency)}</p>
              <Badge
                className={cn({
                  'bg-green-600': bid.userId === authUser?.id
                })}
                variant={bid.userId !== authUser?.id ? 'destructive' : undefined}
              >{bid.userId === authUser?.id ? 'Top bidder' : 'Outbid'}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AuctionBidItem
