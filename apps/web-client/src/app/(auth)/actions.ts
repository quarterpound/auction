'use server'

import { redirect } from "next/navigation"

export const redirectToHome = async (next?: string) => {
  redirect(next ?? '/')
}

export const redirectToEmailVerify = async (next?: string) => {
  redirect('/verify-email' + (next ? `?next=${next}` : ''))
}
