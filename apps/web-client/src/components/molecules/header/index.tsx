import { Button } from "@/components/ui/button"
import Logo from "./logo"
import { Plus } from "lucide-react"
import Link from "next/link"
import AuthButtons from "./auth"

const Header = () => {
  return (
    <header className="bg-background">
      <div className="bg-muted px-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-end h-10">
            <AuthButtons />
          </div>
        </div>
      </div>
      <div className="border-b px-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <Logo />
              </Link>
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/products" className="text-foreground hover:text-primary transition-colors">
                  Products
                </Link>
                <Link href="/services" className="text-foreground hover:text-primary transition-colors">
                  Services
                </Link>
                <Link href="/about" className="text-foreground hover:text-primary transition-colors">
                  About
                </Link>
                <Link href="/contact" className="text-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </nav>
            </div>
            <div className="flex items-center">
              <Link href={'/new'}>
                <Button className="hidden sm:flex">
                  <Plus className="mr-2 h-4 w-4" />
                  Create
                </Button>
              </Link>
              <Button className="sm:hidden" variant="ghost" size="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
                <span className="sr-only">Open main menu</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
