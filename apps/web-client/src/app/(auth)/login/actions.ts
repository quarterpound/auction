'use server'

import { trpcVanillaClient } from "@/trpc"
import { LoginValidation } from "./validation"
import { cookies } from "next/headers"

export const login = async(data: LoginValidation) => {
  const res = await trpcVanillaClient.auth.login.mutate(data)

  cookies().set('authorization', res.token);

  return res.user
}
