import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = await request.json()

    if (!orderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET
    if (!key_secret) {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 })
    }

    // 1. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body.toString())
      .digest('hex')

    const isAuthentic = expectedSignature === razorpay_signature

    if (!isAuthentic) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // 2. Signature is valid. Use Admin client to bypass RLS and update order status.
    const supabaseAdmin = createAdminClient()

    // Create a 6-digit delivery security code
    const securityCode = Math.floor(100000 + Math.random() * 900000).toString()

    const { error: orderError } = await supabaseAdmin
      .from('orders')
      .update({ 
        payment_status: 'PAID',
        status: 'CONFIRMED',
        security_code_hash: securityCode // In a real app, hash this. We'll store it plain for MVP demo or hash it and send via SMS. Storing plain for prototyping since delivery needs to verify.
      })
      .eq('id', orderId)
      .eq('razorpay_order_id', razorpay_order_id)

    if (orderError) {
      console.error('Failed to update order status:', orderError)
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
    }

    // 3. Record payment in payments table
    await supabaseAdmin.from('payments').insert({
      order_id: orderId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      amount: 0, // In real app, fetch from razorpay API. Or fetch order total.
      status: 'CAPTURED'
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
