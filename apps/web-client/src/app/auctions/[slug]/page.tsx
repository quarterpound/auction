import { Separator } from "@/components/ui/separator"
import { trpcVanillaClient } from "@/trpc"
import ReactMarkdown from 'react-markdown'
import BidManager from "./bid-manager"

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
    const image = auction.AssetOnPost?.[0]?.asset.url ?? '/placeholder.svg'

    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8">{auction.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img
              src={image}
              alt={auction.name}
              className="w-full h-auto object-cover rounded-lg shadow-lg"
            />
          </div>
          <div className="space-y-6">
            <BidManager 
              auction={auction}
              bids={auction.Bids}
            />
          </div>
        </div>
        <Separator className="my-8" />
        <div className="prose max-w-none">
          <ReactMarkdown>{auction.description}</ReactMarkdown>
        </div>
      </div>
    )

}

export default SingleAuction
