'use client'

import { trpc } from "@/trpc"
import { FeedResultValidation } from "server/router/feed/validation"
import AuctionCard from "../auction-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Prisma } from "@prisma/client"
import { keepPreviousData } from "@tanstack/react-query"

export type Category = Prisma.CategoryGetPayload<{
  include: {
    _count: {
      select: {
        post: true,
      }
    },
    children: {
      include: {
        _count: {
          select: {
            post: true,
          }
        }
      },
      take: 10
    },
  }
}>

type FeedProps = {
  initialData: FeedResultValidation
  categories: Category[]
}

const Feed = ({initialData, categories}: FeedProps) => {

  const feedQuery = trpc.feed.all.useInfiniteQuery({orderBy: null},     {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: {
      pageParams: [0],
      pages: [initialData],
    }
  })

  const filtersQuery = trpc.category.all.useQuery(undefined, {
    initialData: categories,
    placeholderData: keepPreviousData

  })


  return (
    <div className="items-start grid md:grid-cols-[2fr_6fr] container mx-auto gap-8 pt-10">
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
      <div className="grid md:grid-cols-3 gap-5 container mx-auto">
        {feedQuery.data?.pages.flatMap(item => item.data).map(item => (
          <AuctionCard item={item} key={item.id}/>
        ))}
      </div>
    </div>
  )
}

export default Feed
