'use client'
import { Gavel, Package, User } from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

const Menu = () => {
  let pathname = usePathname()
  pathname = pathname.slice(1)

  return (
    <Card>
      <CardContent className="p-4">
        <nav className="space-y-2">
          <Link href={'/profile'}>
            <Button
              variant={pathname === 'profile' ? 'default' : 'ghost'}
              className="w-full justify-start"
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
          </Link>
          <Link href={'/my-auctions'}>
            <Button
              variant={pathname === 'my-auctions' ? 'default' : 'ghost'}
              className="w-full justify-start"
            >
              <Package className="mr-2 h-4 w-4" />
              Your Auctions
            </Button>
          </Link>
          <Link href={'/bids'}>
            <Button
              variant={pathname === 'bids' ? 'default' : 'ghost'}
              className="w-full justify-start"
            >
              <Gavel className="mr-2 h-4 w-4" />
              Your Bids
            </Button>
          </Link>
        </nav>
      </CardContent>
    </Card>
  )
}

export default Menu
