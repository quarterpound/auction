import Feed from "@/components/molecules/feed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { trpcVanillaClient } from "@/trpc";

export const dynamic = 'force-dynamic'

export default async function Home() {
  const initialData = await trpcVanillaClient.feed.all.query({cursor: 0})
  const categories = await trpcVanillaClient.category.all.query({take: 10})

  return <div className="grid gap-8 container mx-auto">
    <h1 className="text-3xl font-bold">Live auctions</h1>
    <div className="items-start grid md:grid-cols-[2fr_6fr] container mx-auto gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Live auctions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-1">
            {
              categories.map((item) => (
                <div className="grid" key={item.id}>
                  <Link href={`/auctions/${item.slug}`} className="font-medium text-sm">
                    <h2>{`${item.name} (${item.children.reduce((a, b) => a + b._count.post, 0)})`}</h2>
                  </Link>
                  <ul key={item.id} className="ml-5">
                    {
                      item.children.map(child => (
                        <li key={child.id}>
                          <Link className="text-sm" href={`/auctions/${item.slug}/${child.slug}`}>
                            <h3>{`${child.name} (${child._count.post})`}</h3>
                          </Link>
                        </li>
                      ))
                    }
                  </ul>
                </div>
              ))
            }
          </div>
        </CardContent>
      </Card>
      <Feed initialData={initialData} />
    </div>
  </div>
}
