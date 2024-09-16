'use server'

import { trpcVanillaClient } from "@/trpc"
import { RegisterValidation } from "./validation"
import { cookies } from "next/headers"

export const register = async (data: RegisterValidation) => {
  const {user, token} = await trpcVanillaClient.auth.register.mutate(data)

  cookies().set('authorization', token);

  return user
}
