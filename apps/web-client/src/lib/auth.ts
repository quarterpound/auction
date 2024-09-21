import { trpcVanillaClient } from "@/trpc";
import { cookies } from "next/headers";

export const auth = async () => {
  try {
    return await trpcVanillaClient.auth.me.query(undefined, {
      context: {
        authorization: cookies().get('authorization')?.value
      },
    })
  } catch (error) {
    return null
  }
}
