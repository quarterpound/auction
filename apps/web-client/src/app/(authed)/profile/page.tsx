'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAppState } from "@/store"
import { ProfileUpdateValidation } from 'server/router/profile/validation'
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { trpc } from "@/trpc"
import { toast } from "sonner"

const Profile = () => {
  const { authUser, setInitialState, favorites, hasMadeBids, hasPendingAuctions } = useAppState()
  const updateProfileMutation = trpc.profile.update.useMutation({
    onSuccess: (data) => {
      setInitialState({
        authUser: data,
        isAuthLoading: false,
        hasPendingAuctions,
        favorites,
        hasMadeBids,
      })
      toast.success('Profile saved successfully')
    }
  })

  const form = useForm<ProfileUpdateValidation>({
    values: authUser ? {
      name: authUser.name ?? '',
      email: authUser.email ?? '',
      phone: authUser.phone ?? '',
      password: null
    } : {
      name: '',
      email: '',
      phone: '',
      password: null
    }
  })

  const handleSubmit = (data: ProfileUpdateValidation) => {
    updateProfileMutation.mutate(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>{`Make changes to your profile here. Click save when you're done.`}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-2">
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...form.register('name')} />
                </FormControl>
                <FormMessage>
                  {form.formState.errors.name?.message}
                </FormMessage>
              </FormItem>
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...form.register('email')} />
                </FormControl>
                <FormMessage>
                  {form.formState.errors.email?.message}
                </FormMessage>
              </FormItem>
            </div>
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...form.register('phone')} />
              </FormControl>
              <FormMessage>
                {form.formState.errors.phone?.message}
              </FormMessage>
            </FormItem>
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input {...form.register('password')} />
              </FormControl>
              <FormDescription>
                Change if you want to reset your password
              </FormDescription>
              <FormMessage>
                {form.formState.errors.password?.message}
              </FormMessage>
            </FormItem>
          </CardContent>
          <CardFooter>
            <Button className="ml-auto min-w-[120px]" disabled={!form.formState.isDirty || updateProfileMutation.isPending}>Save</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

export default Profile
