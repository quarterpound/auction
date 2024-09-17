import Feed from "@/components/molecules/feed";
import { trpcVanillaClient } from "@/trpc";

export default async function Home() {
  const initialData = await trpcVanillaClient.feed.all.query({cursor: 1})
  const categories = await trpcVanillaClient.category.all.query()

  return <Feed initialData={initialData} categories={categories} />
}
