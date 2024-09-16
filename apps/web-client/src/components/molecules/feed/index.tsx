'use client'

import { trpc } from "@/trpc"
import { FeedResultValidation } from "server/router/feed/validation"
import AuctionCard from "../auction-card"
import _ from 'lodash'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Category } from "@prisma/client"

type FeedProps = {
  initialData: FeedResultValidation
}

const Feed = ({initialData}: FeedProps) => {

  const feedQuery = trpc.feed.all.useInfiniteQuery({orderBy: null},     {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: {
      pageParams: [0],
      pages: [initialData],
    }
  })

  const filtersQuery = trpc.category.all.useQuery()


  return (
    <div className="items-start grid md:grid-cols-[1fr_4fr] container mx-auto gap-8 pt-10">
      <Card>
        <CardHeader>
          <CardTitle>Live auctions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-1">
            {
              filtersQuery.data?.map((item) => (
                <div className="grid" key={item.id}>
                  <Link href={`/${item.slug}`} className="font-medium text-sm">{`${item.name} (${item.children.reduce((a, b) => a + b._count.post, 0)})`}</Link>
                  <ul key={item.id} className="ml-5">
                    {
                      item.children.map(child => (
                        <li key={child.id}>
                          <Link className="text-sm" href={`/${item.slug}/${child.slug}`}>{`${child.name} (${child._count.post})`}</Link>
                        </li>
                      ))
                    }
                  </ul>
                </div>
              ))
            }
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-4 gap-5 container mx-auto">
        {feedQuery.data?.pages.flatMap(item => item.data).map(item => (
          <AuctionCard item={item} key={item.id}/>
        ))}
      </div>
    </div>
  )
}

export default Feed
