'use client'

import { trpc } from "@/trpc"
import { FeedResultValidation } from "server/router/feed/validation"
import AuctionCard from "../auction-card"
import { Prisma } from "@prisma/client"
import { useAppState } from "@/store"
import { Button } from "@/components/ui/button"

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
  categoryId?: string | null
}

const Feed = ({initialData, categoryId}: FeedProps) => {
  const feedSortOrder = useAppState(state => state.feedSortOrder)

  const feedQuery = trpc.feed.all.useInfiniteQuery({orderBy: feedSortOrder, max: 9, categoryId},     {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: {
      pageParams: [0],
      pages: [initialData],
    },
    refetchOnMount: true,
  })

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 container mx-auto">
      {feedQuery.data?.pages.flatMap(item => item.data).map(item => (
        <AuctionCard item={item} key={item.id}/>
      ))}
      {
        feedQuery.hasNextPage && (
          <div className="md:col-span-2 mx-auto lg:col-span-3 2xl:col-span-4">
            <Button
              disabled={feedQuery.isFetchingNextPage}
              className="w-[120px]"
              variant={'outline'}
              onClick={() => feedQuery.fetchNextPage()}
            >
              Load more
            </Button>
          </div>
        )
      }
    </div>
  )
}

export default Feed
