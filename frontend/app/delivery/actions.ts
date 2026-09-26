'use server'

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

import { requireDeliveryOrAdmin } from "@/lib/auth-utils"

export async function verifyAndDeliverOrder(formData: FormData) {
  const user = await requireDeliveryOrAdmin()
  const shortOrderId = formData.get('orderId') as string
  const securityCode = formData.get('securityCode') as string

  if (!shortOrderId || !securityCode) {
    return { error: 'Please provide both Order ID and Security Code.' }
  }

  const supabase = createAdminClient()

  // 1. Find the order by matching the start of the UUID
  const { data: orders, error: searchError } = await supabase
    .from('orders')
    .select('id, status, security_code_hash')
    .ilike('id', `${shortOrderId}%`)
    .limit(1)

  if (searchError || !orders || orders.length === 0) {
    return { error: 'Order not found. Check the ID.' }
  }

  const order = orders[0]

  if (order.status === 'DELIVERED') {
    return { error: 'Order is already marked as delivered.' }
  }

  if (['CANCELLED', 'REFUNDED'].includes(order.status)) {
    return { error: 'Order was cancelled or refunded.' }
  }

  // 2. Verify security code
  if (order.security_code_hash !== securityCode) {
    return { error: 'Invalid Security Code. Please try again.' }
  }

  // 3. Update order status to DELIVERED
  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: 'DELIVERED' })
    .eq('id', order.id)

  if (updateError) {
    return { error: 'Failed to update order status.' }
  }

  // 4. Log verification
  const { data: { user } } = await supabase.auth.getUser()
  
  await supabase.from('delivery_verifications').insert({
    order_id: order.id,
    verified_by: user?.id || null, // Assuming the delivery person is logged in
    status: 'SUCCESS'
  })

  revalidatePath('/delivery')
  return { success: true, message: 'Order successfully verified and delivered!' }
}
