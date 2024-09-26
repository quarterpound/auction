import { Card, CardContent } from "@/components/ui/card"
import { trpc } from "@/trpc"
import { Prisma } from "@prisma/client"
import dayjs from "dayjs"
import Link from "next/link"
import { useState } from "react"
import { formatNumber } from "utils"
import { Button } from "../ui/button"
import { TrashIcon } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog"
import { toast } from "sonner"

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
  const utils = trpc.useUtils()

  const [{amount, total}, setState] = useState({
    amount: item.Bids[0]?.amount ?? item.priceMin,
    total: item._count.Bids
  })

  const deleteAuctionMutation = trpc.profile.deleteAuction.useMutation({
    onSuccess: () => {
      utils.profile.auctions.invalidate()
      utils.feed.invalidate()
      toast.success('Successfully deleted the auction')
    },
    onError: () => {
      toast.success('Failed try again')
    }
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
            width={item.AssetOnPost[0].asset.width}
            height={item.AssetOnPost[0].asset.height}
            alt={item.name}
            src={item.AssetOnPost[0].asset.url}
            className="object-cover w-[50px] h-[50px] rounded"
          />
          <div className="h-[50px] flex items-center justify-between">
            <div>
              <Link href={`/auctions/${item.slug}`} className="font-semibold text-foreground">{item.name}</Link>
              <p className="text-sm text-muted-foreground">{`Ends on: ${dayjs(item.endTime).format('DD MMM YYYY HH:mm')}`}</p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-bold">{formatNumber(amount, item.currency)}</p>
                <p className="text-muted-foreground text-sm">{`Total bids: ${total}`}</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger>
                  <Button size={'icon'} variant={'outline'}>
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
                  <AlertDialogDescription>This will delete the auction and its related bids</AlertDialogDescription>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteAuctionMutation.mutate({id: item.id})}>
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AuctionLineItem
