import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ArrowLeft, CheckCircle2, Clock, MapPin, Package, ShieldCheck } from 'lucide-react'

export const metadata = {
  title: 'Order Details | HungryBuds',
}

export default async function OrderDetailsPage(props: { params: Promise<{ orderId: string }> }) {
  const params = await props.params
  const { orderId } = params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?returnTo=/orders/${orderId}`)
  }

  // Fetch order with related data
  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      hotels (name),
      profiles (name, phone, hostel, room_number)
    `)
    .eq('id', orderId)
    .eq('user_id', user.id) // Security: Ensure user owns this order
    .single()

  if (!order) {
    notFound()
  }

  // Fetch items
  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)

  // Status mapping
  const isActive = !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.status)
  
  const statusSteps = [
    { key: 'PENDING_PAYMENT', label: 'Payment Pending' },
    { key: 'PAID', label: 'Paid' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PREPARING', label: 'Preparing' },
    { key: 'READY', label: 'Ready' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' }
  ]

  const currentStatusIndex = statusSteps.findIndex(s => s.key === order.status)

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <div className="mb-6">
        <Button variant="ghost" asChild className="-ml-4 mb-4 text-muted-foreground">
          <Link href="/orders"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders</Link>
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order #{order.id.slice(0, 8)}</h1>
            <p className="text-muted-foreground mt-1">
              Placed on {format(new Date(order.created_at), 'MMMM d, yyyy • h:mm a')}
            </p>
          </div>
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-sm inline-flex items-center w-fit">
            <Clock className="h-4 w-4 mr-2" />
            {order.status.replace(/_/g, ' ')}
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        
        {/* SECURITY CODE (Only if active) */}
        {isActive && order.security_code_hash && (
          <Card className="border-emerald-500 bg-emerald-50 shadow-sm overflow-hidden">
            <div className="bg-emerald-500 text-white text-center py-2 text-sm font-bold tracking-widest uppercase">
              Secure Delivery Code
            </div>
            <CardContent className="p-6 text-center">
              <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
              <div className="text-5xl font-black text-slate-800 tracking-widest mb-2">
                {order.security_code_hash}
              </div>
              <p className="text-emerald-700 font-medium max-w-md mx-auto">
                Show this code to the delivery partner to receive your order. Do not share it with anyone else.
              </p>
            </CardContent>
          </Card>
        )}

        {/* STATUS TIMELINE */}
        {!['CANCELLED', 'REFUNDED'].includes(order.status) && (
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l-2 border-slate-100 ml-3 md:ml-4 space-y-8 mt-4">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStatusIndex
                  const isCurrent = index === currentStatusIndex
                  
                  // Don't show steps that happen before PAID if we are past it, simplify UI
                  if (index === 0 && currentStatusIndex > 0) return null

                  return (
                    <div key={step.key} className="relative pl-8">
                      <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 
                        ${isCompleted ? 'bg-primary border-primary' : 'bg-white border-slate-300'}
                        ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                      />
                      <div className={`font-semibold ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.label}
                      </div>
                      {isCurrent && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {step.key === 'CONFIRMED' && 'The hotel has confirmed your order.'}
                          {step.key === 'PREPARING' && 'Your food is being prepared.'}
                          {step.key === 'OUT_FOR_DELIVERY' && 'A delivery partner is on the way!'}
                          {step.key === 'DELIVERED' && 'Enjoy your meal!'}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ORDER DETAILS */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-primary" /> 
                {/* @ts-ignore */}
                {order.hotels?.name}
              </h3>
              <div className="space-y-3">
                {items?.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">{item.quantity}x</span> {item.food_name}
                    </div>
                    <span className="font-medium text-slate-700">₹{item.subtotal}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee</span>
                <span>₹{order.delivery_fee}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 text-slate-900">
                <span>Total</span>
                <span className="text-primary">₹{order.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DELIVERY INFO */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground block mb-1">Name</span>
                {/* @ts-ignore */}
                <span className="font-medium">{order.profiles?.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Phone</span>
                {/* @ts-ignore */}
                <span className="font-medium">{order.profiles?.phone}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Hostel</span>
                {/* @ts-ignore */}
                <span className="font-medium">{order.profiles?.hostel}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Room</span>
                {/* @ts-ignore */}
                <span className="font-medium">{order.profiles?.room_number}</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
