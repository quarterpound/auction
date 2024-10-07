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
import { Clock, Gavel, Radio, Search, User } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { CreateBidValidation } from "server/router/bids/validation"
import { formatNumber, obfuscateName } from "utils"
import { z } from "zod"
import Price from "./price"
import _ from "lodash"
import { toast } from "sonner"
import Link from "next/link"
import TimeLeft from "./time-left"
import { useNotifications } from "@/hooks/use-notifications.hook"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
  const { outbid, bidAccepted, getPermission } = useNotifications()
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  const {id, currency, bidIncrement} = auction
  const [watching, setWatching] = useState(0)

  const authUser = useAppState(state => state.authUser)
  const hasMadeBids = useAppState(state => state.hasMadeBids)
  const setHasMadeBids = useAppState(state => state.setHasMadeBids)

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
      ctx.profile.bids.refetch();
      ctx.feed.all.invalidate()

      const previous = ctx.auctions.findBidsByAuctionId.getData({id})

      if(previous) {
        const lastBid = previous[0];

        if(lastBid && authUser && lastBid.userId === authUser?.id && data.userId !== authUser.id) {
          toast.error('You have been outbid')
          outbid(data, auction);
        }
      }

      if(data.author.id !== authUser?.id) {
        ctx.auctions.findBidsByAuctionId.setData({id}, (prev) => [
          {...data, id: `${Math.random() * 10 + new Date().getTime()}`},
          ...(prev ?? []),
        ])
      }
    }
  })

  const bidMutation = trpc.bids.create.useMutation({
    onMutate: async ({amount, id}) => {
      if (!authUser) return;

      await ctx.auctions.findBidsByAuctionId.cancel();
      const previous = ctx.auctions.findBidsByAuctionId.getData({id})
      ctx.auctions.findBidsByAuctionId.setData({id}, (prev) => [
        {id: dayjs().unix().toString(), amount, author: {...authUser, name: authUser.name ? obfuscateName(authUser.name) : null}, userId: authUser.id, createdAt: new Date(), postId: id,},
        ...(prev ?? []),
      ])

      return { previous };
    },
    onError: (err, n, t) => {
      toast.error(`Failed to place bid ${err.message}`)

      ctx.auctions.findBidsByAuctionId.setData({id}, t?.previous)
    },
    onSuccess: () => {
      bidAccepted();
      getPermission();
    },
    onSettled: () => {
      ctx.feed.all.invalidate()
      ctx.profile.auctions.refetch();
    },
  })

  const lastAmount = bidsQuery.data?.[0]?.amount ?? auction.priceMin

  const validator = useMemo(() => z.object({id: z.string(), amount: z.coerce.number().min(lastAmount + bidIncrement)}), [lastAmount, bidIncrement])

  const form = useForm<CreateBidValidation>({
    values: {
      amount: lastAmount + auction.bidIncrement,
      id: auction.id
    },
    resolver: zodResolver(validator)
  })

  const handleSubmit = (data: CreateBidValidation) => {
    if (!hasMadeBids) return setIsAlertOpen(true);

    bidMutation.mutateAsync({
      amount: data.amount,
      id: data.id
    })
  }

  return (
    <>
      <div className="space-y-6">
        <div className="grid md:flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Price amount={lastAmount} currency={currency} />
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
            <TimeLeft date={auction.endTime} />
          </div>
        </div>
        {
          !authUser && (
            <Link href={'/login'} className="block">
              <Button>Login to Bid</Button>
            </Link>
          )
        }
        {
          authUser && authUser.id !== auction.authorId && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="flex space-x-2 items-start">
                  <FormItem className="w-full">
                    <FormLabel htmlFor="amount">Bid Amount</FormLabel>
                    <FormControl>
                      <Input
                        id="amount"
                        disabled={!authUser.emailVerified}
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
                  <Button disabled={bidMutation.isPending || !authUser.emailVerified} type="submit" size="lg" className="self-end">
                    {authUser.emailVerified ? 'Place Bid' : 'Verify email'}
                  </Button>
                </div>
              </form>
            </Form>
          )
        }
        <Separator />
        <div>
          {
            !auction.pending && (
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold mb-2">Recent Bids</h2>
                <div className="flex items-center gap-1">
                  <Radio className="text-green-500 w-6 h-6" />
                  <span className="text-sm text-gray-500">
                    {`Online ${watching}`}
                  </span>
                </div>
              </div>
            )
          }
          <div className="grid gap-2">
            {
              bidsQuery.data.length !== 0 ? (
                <ul className="space-y-2">
                  {_.reverse(_.sortBy(bidsQuery.data, 'amount')).slice(0, 5).map((bid) => (
                    <li key={`${bid.id}-${bid.amount}`} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 md:min-w-[200px]">
                        <User className="h-4 w-4" />
                        <span>{bid.author.name}</span>
                      </div>
                      <span className="font-semibold">{formatNumber(bid.amount, currency)}</span>
                      <span className="hidden md:block text-sm text-gray-500">
                        {dayjs(bid.createdAt).format('MMM DD, YYYY HH:mm')}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="grid gap-3">
                  <Card className="w-full mx-auto">
                    <CardHeader className="text-center">
                      <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Gavel className="h-10 w-10 text-gray-400" />
                      </div>
                      <CardTitle className="text-2xl font-bold">No Bids Yet</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-gray-600 mb-4">
                        {"This auction has not recieved any bids yet. But we are promoting this post so that more people can see it!"}
                      </p>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                        <Search className="h-4 w-4" />
                        <span>Browse through our wide selection of auctions</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            }
          </div>
        </div>
      </div>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              The winner of this auction will be announced when the auction ends. If you are the top bidder, you will be held responsible to buy the product shown in the image and described in the description
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setHasMadeBids(true)
                bidMutation.mutateAsync({
                  amount: form.getValues().amount,
                  id: form.getValues().id
                })
              }}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default BidManager
