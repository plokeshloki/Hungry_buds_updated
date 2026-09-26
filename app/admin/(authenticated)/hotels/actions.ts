'use server'

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

import { requireAdmin } from "@/lib/auth-utils"

export async function toggleHotelStatus(formData: FormData) {
  await requireAdmin()
  const id = formData.get('id') as string
  const currentState = formData.get('currentState') === 'true'

  const supabase = createAdminClient()
  
  await supabase
    .from('hotels')
    .update({ is_active: !currentState })
    .eq('id', id)

  revalidatePath('/admin/hotels')
  revalidatePath('/hotels') // Revalidate public hotels page
}
