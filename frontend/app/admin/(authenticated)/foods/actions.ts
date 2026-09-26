'use server'

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

import { requireAdmin } from "@/lib/auth-utils"

export async function toggleFoodStatus(formData: FormData) {
  await requireAdmin()
  const id = formData.get('id') as string
  const currentState = formData.get('currentState') === 'true'

  const supabase = createAdminClient()
  
  await supabase
    .from('foods')
    .update({ is_available: !currentState })
    .eq('id', id)

  revalidatePath('/admin/foods')
  revalidatePath('/hotels') // Ensure hotel menus are refreshed
}
