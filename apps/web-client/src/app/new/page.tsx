import { trpcVanillaClient } from "@/trpc"
import AuctionForm from "./auction-form"

export const metadata = {
  title: 'New ad'
}

export const dynamic = 'force-dynamic'

const New = async () => {

  const data = await trpcVanillaClient.category.all.query({take: 100})

  return (
    <div className="grid gap-8 max-w-xl mx-auto">
      <div className="bg-zinc-100 mx-auto w-full">
        <h1 className="text-foreground text-lg px-8 font-bold py-4">ELAN YERLƏŞDİRMƏK</h1>
      </div>
      <div className="container mx-auto grid gap-8  md:px-0 px-8">
        <AuctionForm categories={data} />
      </div>
    </div>
  )
}

export default New
