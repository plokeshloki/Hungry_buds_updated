'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const hostel = formData.get('hostel') as string
  const room_number = formData.get('room_number') as string

  const { error } = await supabase
    .from('profiles')
    .update({ 
      name, 
      phone, 
      hostel, 
      room_number,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile')
  revalidatePath('/checkout')
  return { success: true }
}
