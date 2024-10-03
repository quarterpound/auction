'use client'

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAppState } from "@/store"
import { trpc } from "@/trpc"
import { Heart } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface AuctionHeartProps {
  id: string
  count?: number,
}

const AuctionHeart = ({id, count}: AuctionHeartProps) => {
  const {favorites, setFavorites, authUser} = useAppState()
  const isFavorited = !!favorites.find(f => f.postId === id)
  const [actualCount, setActualCount] = useState(count)

  const mutation = trpc.profile.addAuctionToFavorites.useMutation({
    onSuccess: (data) => {
      if (!authUser) return;

      if(data === 'deleted') {
        setFavorites(favorites.filter(f => f.postId !== id))
        setActualCount((prev) => {
          if(prev !== undefined) {
            return prev - 1;
          }
        })
        return toast.success("Removed auction from favorites")
      }

      setFavorites([...favorites, data])
      setActualCount((prev) => {
        if(prev !== undefined) {
          return prev + 1
        }
      })
      return toast.success("Added auction to favorites")
    }
  })

  if(!authUser) {
    return <></>
  }

  return (
    <Button className="flex items-center gap-2" disabled={mutation.isPending} size={actualCount === 0 || actualCount === undefined ? 'icon' : 'default'} variant={'outline'} onClick={() => mutation.mutateAsync({id})}>
      <Heart className={cn("w-5 h-5 flex-shrink-0", {
        "fill-red-500 stroke-red-500": isFavorited,
      })} />
      {actualCount !== 0 && actualCount !== undefined && <span className="font-semibold">{`Favorited by ${actualCount} users`}</span>}
    </Button>
  )
}

export default AuctionHeart
