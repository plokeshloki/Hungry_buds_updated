import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET is not defined')
      return NextResponse.json({ error: 'Webhook secret missing' }, { status: 500 })
    }

    if (!signature) {
      return NextResponse.json({ error: 'Missing x-razorpay-signature header' }, { status: 400 })
    }

    // 1. Verify Razorpay Webhook Signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex')

    if (expectedSignature !== signature) {
      console.error('Invalid Razorpay webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const payload = JSON.parse(rawBody)
    const event = payload.event

    // 2. Handle relevant Razorpay events
    if (event === 'payment_link.paid' || event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity
      const razorpayOrderId = paymentEntity?.order_id
      const razorpayPaymentId = paymentEntity?.id

      if (razorpayOrderId) {
        const supabaseAdmin = createAdminClient()

        // Create a 6-digit delivery security code
        const securityCode = Math.floor(100000 + Math.random() * 900000).toString()

        // Update Order Status to PAID & CONFIRMED
        const { error: orderError } = await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'PAID',
            status: 'CONFIRMED',
            security_code_hash: securityCode,
          })
          .eq('razorpay_order_id', razorpayOrderId)

        if (orderError) {
          console.error('Failed to update order via webhook:', orderError)
        } else {
          console.log(`Order with Razorpay ID ${razorpayOrderId} marked as PAID via webhook`)
        }
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error: any) {
    console.error('Razorpay Webhook Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
