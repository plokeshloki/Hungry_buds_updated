'use server'

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

import { requireAdmin } from "@/lib/auth-utils"

const VALID_TRANSITIONS: Record<string, string[]> = {
  'CONFIRMED': ['PREPARING', 'CANCELLED'],
  'PREPARING': ['READY', 'CANCELLED'],
  'READY': ['OUT_FOR_DELIVERY', 'CANCELLED'],
  // Admin shouldn't manually jump to DELIVERED, but can if needed for manual override.
  'OUT_FOR_DELIVERY': ['DELIVERED', 'CANCELLED']
}

export async function updateOrderStatus(formData: FormData) {
  const adminUser = await requireAdmin()
  
  const id = formData.get('id') as string
  const status = formData.get('status') as string

  const supabase = createAdminClient()
  
  // Get current order to validate transition
  const { data: order } = await supabase.from('orders').select('status').eq('id', id).single()
  
  if (!order) {
    throw new Error('Order not found')
  }

  const allowedNext = VALID_TRANSITIONS[order.status] || []
  if (!allowedNext.includes(status)) {
    throw new Error(`Invalid state transition from ${order.status} to ${status}`)
  }

  await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)

  // Log the action using the authenticated admin's ID
  await supabase.from('audit_logs').insert({
    actor_id: adminUser?.id,
    action: 'UPDATE_ORDER_STATUS',
    entity_type: 'ORDER',
    entity_id: id,
    details: { old_status: order.status, new_status: status }
  })

  revalidatePath('/admin/orders')
  revalidatePath('/admin/dashboard')
}
