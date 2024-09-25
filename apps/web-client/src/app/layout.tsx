import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import './globals.css';
import { cn } from "@/lib/utils";
import Provider from "@/providers";
import Header from "@/components/molecules/header";
import Footer from "@/components/ui/footer";
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: {
    default: "Online Auction Marketplace for Unique Finds | Auksiyon.az",
    template: "%s | Auksiyon.az"
  },
  description: "Discover BidSmart, the leading online auction website where you can bid on a vast selection of unique items and secure unbeatable deals. Join our vibrant community of buyers and sellers today to explore antiques, collectibles, electronics, and more. Start bidding now and win big at BidSmart!",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_CLIENT_URL}`
  }
};
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Provider>
          <Header />
          <main className="py-12 px-8">
            {children}
          </main>
          <Footer />
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
