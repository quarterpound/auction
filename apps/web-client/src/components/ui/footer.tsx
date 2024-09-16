import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from './input'

export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-12 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About Us</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Our Story</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">How It Works</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Testimonials</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">FAQ</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Contact Us</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Privacy Policy</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Auctions</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Current Auctions</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Past Auctions</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Create an Auction</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Newsletter</h3>
            <p className="text-sm text-gray-600">Stay updated with our latest auctions and news.</p>
            <form className="flex md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
              <Input className='bg-white' placeholder='Email' />
              <Button type="submit" size="sm">Subscribe</Button>
            </form>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">&copy; 2023 Auction Site. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">YouTube</span>
                <Youtube className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
