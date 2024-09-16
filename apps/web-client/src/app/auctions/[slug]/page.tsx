import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Timer from "@/components/ui/timer"
import { trpcVanillaClient } from "@/trpc"
import { Clock, DollarSign } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import BidManager from "./bid-manager"

interface SingleAuctionProps {
  params: {
    slug: string
  }
}

const SingleAuction = async ({params: {slug}}: SingleAuctionProps) => {

    const auction = await trpcVanillaClient.auctions.findBySlug.query({slug})
    const amount = auction.Bids[0]?.amount ?? auction.priceMin

    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8">{auction.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img
              src={'/placeholder.svg'}
              alt={auction.name}
              className="w-full h-auto object-cover rounded-lg shadow-lg"
            />
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                <span className="text-3xl font-bold">${amount}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-semibold"><Timer data={auction.endTime} /> left</span>
              </div>
            </div>
            <BidManager increment={auction.bidIncrement} id={auction.id} bids={auction.Bids} amount={amount} />
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
