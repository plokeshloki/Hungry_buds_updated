'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addDeliveryPerson } from './actions'

const addDeliverySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type AddDeliveryForm = z.infer<typeof addDeliverySchema>

export default function AddDeliveryForm() {
  const [isPending, setIsPending] = useState(false)

  const form = useForm<AddDeliveryForm>({
    resolver: zodResolver(addDeliverySchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
    },
  })

  const onSubmit = async (data: AddDeliveryForm) => {
    setIsPending(true)
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('email', data.email)
      formData.append('phone', data.phone)
      formData.append('password', data.password)
      
      const result = await addDeliveryPerson(formData)
      
      if (result.success) {
        toast.success('Delivery person added successfully')
        form.reset()
      } else {
        toast.error(result.error || 'Failed to add delivery person')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" placeholder="John Doe" {...form.register('name')} />
        {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="delivery@example.com" {...form.register('email')} />
        {form.formState.errors.email && <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" type="tel" placeholder="9876543210" {...form.register('phone')} />
        {form.formState.errors.phone && <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Temporary Password</Label>
        <Input id="password" type="password" {...form.register('password')} />
        {form.formState.errors.password && <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Add Personnel
      </Button>
    </form>
  )
}
