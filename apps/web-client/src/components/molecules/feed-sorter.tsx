'use client'

import { useAppState } from "@/store"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { FeedValidation } from "server/router/feed/validation"
import { ArrowDownAZ, Clock, TrendingDown, TrendingUp } from "lucide-react"

const FeedSorter = () => {
  const { feedSortOrder, setFeedSortOrder } = useAppState()

  return (
    <Select value={feedSortOrder ?? ''} onValueChange={(e) => setFeedSortOrder(e as FeedValidation['orderBy'])}>
      <SelectTrigger className="w-[250px]">
        <SelectValue placeholder={"Sort"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ending-soonest">
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            <span>Ending soon</span>
          </div>
        </SelectItem>
        <SelectItem value="ending-latest">
          <div className="flex items-center">
            <ArrowDownAZ className="mr-2 h-4 w-4" />
            <span>Ending last</span>
          </div>
        </SelectItem>
        <SelectItem value="lowest-price">
          <div className="flex items-center">
            <TrendingDown className="mr-2 h-4 w-4" />
            <span>Lowest price</span>
          </div>
        </SelectItem>
        <SelectItem value="highest-price">
          <div className="flex items-center">
            <TrendingUp className="mr-2 h-4 w-4" />
            <span>Highest price</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

export default FeedSorter
