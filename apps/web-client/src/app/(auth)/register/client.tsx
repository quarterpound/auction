'use client'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppState } from "@/store"
import { Checkbox } from "@/components/ui/checkbox"
import { zodResolver } from "@hookform/resolvers/zod"
import { trpc } from "@/trpc"
import { setCookie } from 'cookies-next';
import { registerValidation } from "server/router/auth/validation"
import { z } from "zod"
import { redirectToEmailVerify } from "../actions"

export type RegisterValidation = z.infer<typeof registerValidation>

const RegisterForm = () => {
  const setInitialState = useAppState(state => state.setInitialState)
  const registerMutation = trpc.auth.register.useMutation()

  const form = useForm<RegisterValidation>({
    values: {
      name: '',
      email: '',
      password: '',
      acceptTerms: false,
      addToAudiences: false
    },
    resolver: zodResolver(registerValidation)
  })

  const handleSubmit = async (data: RegisterValidation) => {
    const { user, token }  = await registerMutation.mutateAsync(data)

    setCookie('authorization', token, {
      maxAge: 60 * 7 * 24
    });

    setInitialState({
      authUser: user,
      hasPendingAuctions: false,
      isAuthLoading: false,
      hasMadeBids: false,
      favorites: [],
    })

    redirectToEmailVerify()
  }

  return (
    <Form {...form}>
      <form className="w-[350px] block" onSubmit={form.handleSubmit(handleSubmit)}>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              <h1>Register</h1>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input {...form.register('name')} placeholder="Ali Gasimzade"  />
              </FormControl>
              <FormMessage>
                {form.formState.errors.name?.message}
              </FormMessage>
            </FormItem>
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...form.register('email')} placeholder="example@example.com"  />
              </FormControl>
              <FormMessage>
                {form.formState.errors.email?.message}
              </FormMessage>
            </FormItem>
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type='password' {...form.register('password')}  />
              </FormControl>
              <FormMessage>
                {form.formState.errors.password?.message}
              </FormMessage>
            </FormItem>
            <FormField
              control={form.control}
              name="addToAudiences"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox onCheckedChange={field.onChange} checked={field.value} />
                    </FormControl>
                    <FormLabel className="p-0 m-0" style={{ marginTop: 0 }}>Receive news and updates</FormLabel>
                  </div>
                  <div>
                    <FormMessage className="block">
                      {form.formState.errors.addToAudiences?.message}
                    </FormMessage>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox onCheckedChange={field.onChange} checked={field.value} />
                    </FormControl>
                    <FormLabel className="p-0 m-0 text-foreground" style={{ marginTop: 0 }}>Accept terms and conditions</FormLabel>
                  </div>
                  <div>
                    <FormMessage className="block">
                      {form.formState.errors.acceptTerms?.message}
                    </FormMessage>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button className="w-full" disabled={registerMutation.isPending}>Register</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

export default RegisterForm
