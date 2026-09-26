'use server'

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireAdmin } from "@/lib/auth-utils"

export async function updateSettings(formData: FormData) {
  await requireAdmin()
  const is_ordering_open = formData.get('is_ordering_open') === 'true' // Switch sends 'true' if checked
  const delivery_fee = parseFloat(formData.get('delivery_fee') as string)
  const min_order_value = parseFloat(formData.get('min_order_value') as string)

  const supabase = createAdminClient()
  
  // We assume there's only one row in settings, so we just update without ID constraint 
  // or we can fetch the ID first, but updating without constraint updates all rows (there should be 1).
  const { data: settings } = await supabase.from('settings').select('id').single()
  
  if (settings) {
    await supabase
      .from('settings')
      .update({ is_ordering_open, delivery_fee, min_order_value })
      .eq('id', settings.id)
  }

  revalidatePath('/admin/settings')
  revalidatePath('/checkout')
  revalidatePath('/cart')
  redirect('/admin/settings')
}
