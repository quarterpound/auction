'use server'

import { redirect } from "next/navigation"

export const redirectToHome = async (next?: string) => {
  redirect(next ?? '/')
}

export const redirectToEmailVerify = async () => {
  redirect('/verify-email')
}
