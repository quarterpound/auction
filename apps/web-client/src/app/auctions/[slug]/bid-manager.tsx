'use client'

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAppState } from "@/store"
import { trpc } from "@/trpc"
import { zodResolver } from "@hookform/resolvers/zod"
import { Prisma } from "@prisma/client"
import dayjs from "dayjs"
import { User } from "lucide-react"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { CreateBidValidation } from "server/router/bids/validation"
import { formatNumber } from "utils"
import { z } from "zod"

export type BidWithUser = Prisma.BidGetPayload<{
  include: {
    author: true,
  },
}>

interface BidManagerProps {
  bids: BidWithUser[]
  currency: string
  id: number
  amount: number
  increment: number
}

const BidManager = ({id, bids, amount, increment, currency}: BidManagerProps) => {
  const authUser = useAppState(state => state.authUser)
  console.log(authUser)
  const ctx = trpc.useUtils();

  const bidsQuery = trpc.auctions.findBidsByAuctionId.useQuery({id}, {
    initialData: bids,
  })

  const bidMutation = trpc.bids.create.useMutation({
    onMutate: async ({amount, id}) => {
      if (!authUser) return;

      await ctx.auctions.findBidsByAuctionId.cancel();
      const previous = ctx.auctions.findBidsByAuctionId.getData({id})
      ctx.auctions.findBidsByAuctionId.setData({id}, (prev) => [
        {id: -1, amount, author: authUser, userId: authUser.id, createdAt: new Date(), postId: id,},
        ...(prev ?? []).slice(0, 4),
      ])

      return { previous };
    },
    onError: (err, n, t) => {
      ctx.auctions.findBidsByAuctionId.setData({id}, t?.previous)
    },
    onSettled: () => {
      ctx.auctions.findBidsByAuctionId.invalidate({id});
    },
  })

  const lastAmount = bidsQuery.data?.[0]?.amount ?? amount

  const validator = useMemo(() => z.object({id: z.number(), amount: z.coerce.number().min(lastAmount + increment)}), [lastAmount, increment])

  const form = useForm<CreateBidValidation>({
    values: {
      amount: lastAmount + increment,
      id
    },
    resolver: zodResolver(validator)
  })

  const handleSubmit = (data: CreateBidValidation) => {
    bidMutation.mutateAsync({
      amount: data.amount,
      id: data.id
    })
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-grow">
              <Label htmlFor="amount" className="text-lg">Your Bid</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter bid amount"
                min={amount + increment}
                step="1"
                className="text-lg"
                {...form.register('amount')}
              />
            </div>
            <Button type="submit" size="lg" className="self-end">Place Bid</Button>
          </div>
        </form>
      </Form>
      <Separator />
      <div>
        <h3 className="text-xl font-semibold mb-2">Recent Bids</h3>
        <ul className="space-y-2">
          {bidsQuery.data.map((bid) => (
            <li key={bid.id} className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
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
