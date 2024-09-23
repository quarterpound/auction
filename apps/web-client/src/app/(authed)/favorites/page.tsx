'use client'

import AuctionLineItem from "@/components/molecules/auction-line-item"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/trpc"

const Page = () => {
  const { data: favorites, isLoading} = trpc.profile.favorites.useQuery({})

  return (
    <Card>
      <CardHeader>
        <CardTitle>Favorites</CardTitle>
        <CardDescription>Auctions that you have favorites</CardDescription>
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
          favorites?.map(item => (
            <AuctionLineItem item={item.post} key={item.postId}/>
          ))
        }
      </CardContent>
    </Card>
  )
}

export default Page
