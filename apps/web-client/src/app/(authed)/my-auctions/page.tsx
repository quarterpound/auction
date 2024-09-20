'use client'

import AuctionLineItem from "@/components/molecules/auction-line-item"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/trpc"
import Link from "next/link"

const Page = () => {

  const {data, isLoading} = trpc.profile.auctions.useQuery({})

  return <Card>
    <CardHeader>
      <CardTitle>My Auctions</CardTitle>
      <CardDescription>Monitor your auctions</CardDescription>
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
            <Link href={'/new'}>
              <Button>Create an auction</Button>
            </Link>
          </div>
        )
      }
      {
        data?.map(item => (
          <AuctionLineItem item={item} key={item.id}/>
        ))
      }
    </CardContent>
  </Card>
}

export default Page
