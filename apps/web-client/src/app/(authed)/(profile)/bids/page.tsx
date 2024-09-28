'use client'

import AuctionBidItem from "@/components/molecules/auction-bid-item"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/trpc"
import Link from "next/link"

const Page = () => {

  const {data, isLoading} = trpc.profile.bids.useQuery({}, {
    refetchOnMount: 'always',
  })

  return <Card>
    <CardHeader>
      <CardTitle>My Bids</CardTitle>
      <CardDescription>Monitor the auctions that you have bid on</CardDescription>
    </CardHeader>
    <CardContent className="grid gap-2">
      {
        isLoading && (
          <div className="grid gap-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-1/3" />
          </div>
        )
      }
      {
        data?.length === 0 && (
          <div className="grid gap-3">
            <Link href={'/'}>
              <Button>See auctions</Button>
            </Link>
          </div>
        )
      }
      {
        data?.map(item => (
          <AuctionBidItem item={item} key={item.id}/>
        ))
      }
    </CardContent>
  </Card>
}

export default Page
