import { Separator } from "@/components/ui/separator"
import { trpcVanillaClient } from "@/trpc"
import ReactMarkdown from 'react-markdown'
import BidManager from "./bid-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AuctionHeart from "@/components/molecules/auction-heart"
import Gallery from "@/components/ui/gallery"
import { cookies } from "next/headers"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import Link from "next/link"
import { Metadata } from "next/types"
import { notFound } from "next/navigation"
import { EyeIcon } from "lucide-react"

interface SingleAuctionProps {
  params: {
    slug: string
  }
}

export const dynamic = 'force-dynamic'

export const generateMetadata = async ({params: {slug}}: SingleAuctionProps):Promise<Metadata> => {
  try {
    const auction = await trpcVanillaClient.auctions.findMetadataBySlug.query({slug})
    return {
      title: auction.name,
      description: auction.description,
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_CLIENT_URL}/auctions/${auction.category?.parent?.slug}/${auction.category?.slug}/${auction.slug}`
      },
      twitter: {
        title: auction.name,
        description: auction.description,
        images: auction.AssetOnPost.map(item => item.asset)
      },
      openGraph: {
        title: auction.name,
        type: 'website',
        description: auction.description,
        url: `${process.env.NEXT_PUBLIC_CLIENT_URL}/auctions/${auction.category?.parent?.slug}/${auction.category?.slug}/${auction.slug}`,
        images: auction.AssetOnPost.map(item => item.asset)
      }
    }
  } catch(e) {
    notFound()
  }
}

const SingleAuction = async ({params: {slug}}: SingleAuctionProps) => {
  const auction = await trpcVanillaClient.auctions.findBySlug.query({slug}, {
    context: {
      authorization: cookies().get('authorization')?.value
    }
  })

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": auction.name,
      "image": auction.AssetOnPost.map(item => item.asset.url),
      "description": auction.description,
      "sku": auction.slug,
      // "brand": {
      //   "@type": "Brand",
      //   "name": "Rolex"
      // },
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": auction.currency,
        "lowPrice": auction.priceMin,
        "highPrice": auction.Bids[0]?.amount ?? auction.priceMin,
        "offerCount": auction._count.Bids,
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "SaleEvent",
      "name": `Auction for ${auction.name}`,
      "startDate": auction.createdAt,
      "endDate": auction.endTime,
      "eventStatus": "https://schema.org/EventScheduled",
      "location": {
        "@type": "VirtualLocation",
        "url": `${process.env.NEXT_PUBLIC_CLIENT_URL}/auctions/${auction.category?.parent?.slug}/${auction.category?.slug}/${auction.slug}`
      },
      "offers": {
        "@type": "Offer",
        "url": `${process.env.NEXT_PUBLIC_CLIENT_URL}/auctions/${auction.category?.parent?.slug}/${auction.category?.slug}/${auction.slug}`,
        "price": auction.Bids[0]?.amount ?? auction.priceMin,
        "priceCurrency": auction.currency,
        "availability": "https://schema.org/InStock"
      }
    }
  ]


  return (
    <>
      <div className="max-w-5xl mx-auto grid gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild={true}>
                <Link href='/auctions'>Auctions</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild={true}>
                <Link href={`/auctions/${auction.category?.parent?.slug}`}>{auction.category?.parent?.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild={true}>
                <Link href={`/auctions/${auction.category?.parent?.slug}/${auction.category?.slug}`}>{auction.category?.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{auction.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold mb-8">{auction.name}</h1>
            <div className="hidden md:block">
              <AuctionHeart id={auction.id} count={auction._count.UserFavorites} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Gallery title={auction.name} images={auction.AssetOnPost.map(item => item.asset)} />
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
              <CardTitle className="flex items-center justify-between">
                <span>Product description</span>
                <div className="flex items-center gap-1">
                  <EyeIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground text-sm">{`${auction._count.postView} Views`}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <ReactMarkdown>{auction.description}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema)
      }} />
    </>
  )
}

export default SingleAuction
