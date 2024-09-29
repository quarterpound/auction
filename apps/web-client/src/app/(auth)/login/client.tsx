'use client'

import { Form, FormControl, FormItem, FormLabel } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppState } from "@/store"
import { trpc } from "@/trpc"
import { setCookie } from "cookies-next"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginValidation } from "server/router/auth/validation"
import { toast } from "sonner"
import { z } from "zod"
import { redirectToHome } from "../actions"

export type LoginValidation = z.infer<typeof loginValidation>

const LoginForm = () => {
  const setInitialState = useAppState(state => state.setInitialState)

  const loginMutation = trpc.auth.login.useMutation()

  const form = useForm<LoginValidation>({
    values: {
      username: '',
      password: ''
    },
    resolver: zodResolver(loginValidation)
  })

  const handleSubmit = async (data: LoginValidation) => {
    const { user, token } = await loginMutation.mutateAsync(data)

    setCookie('authorization', token, {
      maxAge: 60 * 7 * 24
    });

    toast.success("Welcome back!")

    setInitialState({
      authUser: user,
      hasPendingAuctions: user._count.Post !== 0,
      isAuthLoading: false,
      hasMadeBids: user._count.Bids !== 0,
      favorites: user.UserFavorites
    })

    redirectToHome()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="w-[350px]">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              Login
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <FormItem>
              <FormLabel>Email or phone number</FormLabel>
              <FormControl>
                <Input {...form.register('username')} placeholder="example@example.com"  />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type='password' {...form.register('password')}  />
              </FormControl>
            </FormItem>
          </CardContent>
          <CardFooter>
            <Button disabled={loginMutation.isPending} className="w-full">Login</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

export default LoginForm
