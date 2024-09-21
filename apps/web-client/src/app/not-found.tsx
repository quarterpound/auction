import { Button } from "@/components/ui/button"
import { Gavel } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: 'Not found'
}

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="text-center">
        <Gavel className="mx-auto h-24 w-24 text-gray-400 mb-8" />
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
        <p className="text-xl text-gray-600 mb-8">
          Oops! It seems this page does not exist
        </p>
        <Button asChild size="lg">
          <Link href="/">
            Return to Home
          </Link>
        </Button>
      </div>
      <div className="mt-12 text-center">
        <p className="text-gray-600">
          Looking for something specific? Try searching our active auctions.
        </p>
        <Button variant="link" asChild className="mt-2">
          <Link href="/auctions">
            Browse Auctions
          </Link>
        </Button>
      </div>
    </div>
  )
}
