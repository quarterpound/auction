'use server'

import { cookies } from "next/headers"

export const setJwtCookie = async (jwt: string) => {
  cookies().set('authorization', jwt)
}
