'use server'

import { redirect } from "next/navigation"

export const redirectToNewAuction = async (slug: string) => {
  return redirect(`/auctions/${slug}`)
}
