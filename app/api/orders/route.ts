import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Razorpay from 'razorpay'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { items, hotel_id, subtotal, deliveryFee, total } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // 1. Authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Enforce System Health Settings (Ordering Status)
    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .single()

    if (settings && !settings.is_ordering_open) {
      return NextResponse.json({ error: 'New orders are temporarily unavailable.' }, { status: 503 })
    }

    // 3. Verify Razorpay is configured
    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const key_secret = process.env.RAZORPAY_KEY_SECRET

    if (!key_id || !key_secret) {
      return NextResponse.json({ error: 'Payment gateway is not configured.' }, { status: 500 })
    }

    const rzp = new Razorpay({ key_id, key_secret })

    // 4. Verify prices and stock from DB (Server is authoritative)
    const foodIds = items.map((i: any) => i.id)
    const { data: dbFoods } = await supabase
      .from('foods')
      .select('id, price, stock, is_available')
      .in('id', foodIds)

    if (!dbFoods || dbFoods.length !== items.length) {
      return NextResponse.json({ error: 'Some items are no longer available.' }, { status: 400 })
    }

    let calculatedSubtotal = 0
    for (const item of items) {
      const dbFood = dbFoods.find(f => f.id === item.id)
      if (!dbFood) return NextResponse.json({ error: `Item ${item.name} not found.` }, { status: 400 })
      if (!dbFood.is_available) return NextResponse.json({ error: `Item ${item.name} is sold out.` }, { status: 400 })
      
      calculatedSubtotal += dbFood.price * item.quantity
    }

    // Use server's delivery fee
    const serverDeliveryFee = settings?.delivery_fee || 0
    const calculatedTotal = calculatedSubtotal + serverDeliveryFee

    // 5. Create Order in DB securely using Service Role to prevent tampering
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabaseAdmin = createAdminClient()

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user.id,
        hotel_id: hotel_id,
        status: 'PENDING_PAYMENT',
        subtotal: calculatedSubtotal,
        delivery_fee: serverDeliveryFee,
        total: calculatedTotal
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('Order creation error:', orderError)
      return NextResponse.json({ error: 'Failed to create order.' }, { status: 500 })
    }

    // 6. Create Order Items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      food_id: item.id,
      food_name: item.name,
      unit_price: dbFoods.find(f => f.id === item.id)?.price || item.price,
      quantity: item.quantity,
      subtotal: (dbFoods.find(f => f.id === item.id)?.price || item.price) * item.quantity
    }))

    const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItems)
    
    if (itemsError) {
      console.error('Order items creation error:', itemsError)
      return NextResponse.json({ error: 'Failed to add order items.' }, { status: 500 })
    }

    // 7. Create Razorpay Intent
    const rzpOrder = await rzp.orders.create({
      amount: Math.round(calculatedTotal * 100), // in paise
      currency: 'INR',
      receipt: order.id.toString(),
      notes: {
        orderId: order.id,
        userId: user.id
      }
    })

    // Update order with razorpay ID
    await supabaseAdmin.from('orders').update({ razorpay_order_id: rzpOrder.id }).eq('id', order.id)

    return NextResponse.json({ 
      success: true, 
      order, 
      razorpayOrder: rzpOrder 
    })

  } catch (error: any) {
    console.error('Order API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
