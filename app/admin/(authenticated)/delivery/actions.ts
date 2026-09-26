'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth-utils'

const addDeliverySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export async function addDeliveryPerson(formData: FormData) {
  await requireAdmin()

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const password = formData.get('password') as string

  const parsed = addDeliverySchema.safeParse({ name, email, phone, password })
  
  if (!parsed.success) {
    return { success: false, error: 'Invalid fields provided.' }
  }

  const supabase = createAdminClient()

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    if (authError.code === 'email_exists') {
      return { success: false, error: 'A user with this email already exists.' }
    }
    return { success: false, error: authError.message }
  }

  if (authData.user) {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: authData.user.id,
      name,
      phone,
      role: 'DELIVERY',
    })

    if (profileError) {
      // Best effort cleanup if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return { success: false, error: 'Failed to set up user profile.' }
    }
  }

  revalidatePath('/admin/delivery')
  return { success: true }
}

export async function getDeliveryPersonnel() {
  await requireAdmin()
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, phone, created_at')
    .eq('role', 'DELIVERY')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching delivery personnel:', error)
    return []
  }
  return data
}
