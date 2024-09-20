'use client'

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useAppState } from "@/store"
import { trpc } from "@/trpc"
import { zodResolver } from "@hookform/resolvers/zod"
import { Post, Prisma } from "@prisma/client"
import dayjs from "dayjs"
import { Clock, DollarSign, User } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { CreateBidValidation } from "server/router/bids/validation"
import { formatNumber, obfuscateName } from "utils"
import { z } from "zod"
import Price from "./price"
import _ from "lodash"
import { toast } from "sonner"
import { useTimer } from "@/hooks/useTimer.hook"
import Link from "next/link"
import TimeLeft from "./time-left"

export type BidWithUser = Prisma.BidGetPayload<{
  include: {
    author: {
      select: {
        id: true,
        name: true,
      }
    },
  },
}>

interface BidManagerProps {
  bids: BidWithUser[]
  auction: Post
}

const BidManager = ({ auction, bids }: BidManagerProps) => {

  const {id, currency, bidIncrement} = auction
  const [watching, setWatching] = useState(0)

  const authUser = useAppState(state => state.authUser)
  const ctx = trpc.useUtils();

  const bidsQuery = trpc.auctions.findBidsByAuctionId.useQuery({id}, {
    initialData: bids,
  })

  trpc.auctions.listenForViewCount.useSubscription({id}, {
    onData: (data) => {
      setWatching(data)
    }
  })

  trpc.bids.listenToBidAdded.useSubscription({auctionIds: id}, {
    onData: (data) => {
      console.log('bid-added', data)

      const previous = ctx.auctions.findBidsByAuctionId.getData({id})

      if(previous) {
        const lastBid = previous[0];

        if(lastBid && authUser && lastBid.userId === authUser?.id && data.userId !== authUser.id) {
          console.log('here')
          toast.error('You have been outbid')
        }
      }

      if(data.author.id !== authUser?.id) {
        ctx.auctions.findBidsByAuctionId.setData({id}, (prev) => [
          data,
          ...(prev ?? []),
        ].slice(0, 5))
      }
    }
  })

  const bidMutation = trpc.bids.create.useMutation({
    onMutate: async ({amount, id}) => {
      if (!authUser) return;

      await ctx.auctions.findBidsByAuctionId.cancel();
      const previous = ctx.auctions.findBidsByAuctionId.getData({id})
      ctx.auctions.findBidsByAuctionId.setData({id}, (prev) => [
        {id: dayjs().unix(), amount, author: {...authUser, name: authUser.name ? obfuscateName(authUser.name) : null}, userId: authUser.id, createdAt: new Date(), postId: id,},
        ...(prev ?? []),
      ].slice(0, 5))

      return { previous };
    },
    onError: (err, n, t) => {
      toast.error(`Failed to place bid ${err.message}`)

      ctx.auctions.findBidsByAuctionId.setData({id}, t?.previous)
    },
    onSettled: () => {
      ctx.auctions.findBidsByAuctionId.invalidate({id});
    },
  })

  const lastAmount = bidsQuery.data?.[0]?.amount ?? auction.priceMin

  const validator = useMemo(() => z.object({id: z.number(), amount: z.coerce.number().min(lastAmount + bidIncrement)}), [lastAmount, bidIncrement])

  const form = useForm<CreateBidValidation>({
    values: {
      amount: lastAmount + auction.bidIncrement,
      id: auction.id
    },
    resolver: zodResolver(validator)
  })

  const handleSubmit = (data: CreateBidValidation) => {
    bidMutation.mutateAsync({
      amount: data.amount,
      id: data.id
    })
  }

  console.log(bidsQuery.data)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-6 w-6 text-green-600" />
          <Price amount={lastAmount} currency={currency} />
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-6 w-6 text-blue-600" />
          <TimeLeft date={auction.endTime} />
        </div>
      </div>
      {
        authUser ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="flex space-x-2 items-s">
                <FormItem className="w-full">
                  <FormLabel htmlFor="amount">Bid Amount</FormLabel>
                  <FormControl>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter bid amount"
                      step="1"
                      {...form.register('amount')}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.amount?.message}
                  </FormMessage>
                </FormItem>
                <Button disabled={bidMutation.isPending} type="submit" size="lg" className="self-end">Place Bid</Button>
              </div>
            </form>
          </Form>
        ) : (
          <Link href={'/login'} className="block">
            <Button>Login to Bid</Button>
          </Link>
        )
      }
      <Separator />
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold mb-2">Recent Bids</h3>
          <span className="text-sm text-gray-500">
            {`Online ${watching}`}
          </span>
        </div>
        <ul className="space-y-2">
          {_.reverse(_.sortBy(bidsQuery.data, 'createdAt')).map((bid) => (
            <li key={bid.id} className="flex justify-between items-center">
              <div className="flex items-center space-x-2 min-w-[200px]">
                <User className="h-4 w-4" />
                <span>{bid.author.name}</span>
              </div>
              <span className="font-semibold">{formatNumber(bid.amount, currency)}</span>
              <span className="text-sm text-gray-500">
                {dayjs(bid.createdAt).format('MMM d, YYYY HH:mm')}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default BidManager
