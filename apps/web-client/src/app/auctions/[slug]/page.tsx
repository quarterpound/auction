import { Separator } from "@/components/ui/separator"
import { trpcVanillaClient } from "@/trpc"
import ReactMarkdown from 'react-markdown'
import BidManager from "./bid-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AuctionHeart from "@/components/molecules/auction-heart"

interface SingleAuctionProps {
  params: {
    slug: string
  }
}

export const dynamic = 'force-dynamic'

export const generateMetadata = async ({params: {slug}}: SingleAuctionProps) => {
  const auction = await trpcVanillaClient.auctions.findMetadataBySlug.query({slug})
  return {
    title: auction.name,
    description: auction.description,
  }
}

const SingleAuction = async ({params: {slug}}: SingleAuctionProps) => {

    const auction = await trpcVanillaClient.auctions.findBySlug.query({slug})
    const image = auction.AssetOnPost?.[0]?.asset

    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold mb-8">{auction.name}</h1>
          <div className="hidden md:block">
            <AuctionHeart id={auction.id} count={auction._count.UserFavorites} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <img
              src={image.url}
              width={image.width}
              height={image.height}
              alt={auction.name}
              className="w-full h-auto object-cover rounded-lg shadow-lg"
            />
          </div>
          <div className="space-y-6">
            <BidManager
              auction={auction}
              bids={auction.bids}
            />
          </div>
        </div>
        <Separator className="my-8" />
        <Card>
          <CardHeader>
            <CardTitle>Product description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <ReactMarkdown>{auction.description}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>
    )

}

export default SingleAuction
