'use client'

import { trpc } from "@/trpc"
import { FeedResultValidation } from "server/router/feed/validation"
import AuctionCard from "../auction-card"
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

  return (
    <div className="grid md:grid-cols-4 gap-5 container mx-auto">
      {feedQuery.data?.pages.flatMap(item => item.data).map(item => (
        <AuctionCard item={item} key={item.id}/>
      ))}
    </div>
  )
}

export default Feed
