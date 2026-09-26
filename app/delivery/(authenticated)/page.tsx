import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, PackageCheck } from "lucide-react"
import { VerifyOrderForm } from "@/components/delivery/VerifyOrderForm"

export const metadata = {
  title: 'Delivery Hub | HostelBites',
}

export default async function DeliveryDashboard() {
  // Using admin client because delivery personnel need to see all active orders.
  // In a strict RLS environment, we'd use a service role or specific RLS policies for role='DELIVERY'
  const supabase = createAdminClient()

  // Fetch active orders for delivery
  const { data: orders } = await supabase
    .from('orders')
    .select('*, hotels(name), profiles(name, phone, hostel, room_number)')
    .in('status', ['READY', 'OUT_FOR_DELIVERY'])
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Delivery Hub</h1>
        <p className="text-muted-foreground">Active orders ready for pickup and delivery.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Active Deliveries</h2>
          
          {!orders || orders.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-xl bg-white">
              <PackageCheck className="h-10 w-10 text-slate-300 mx-auto mb-4" />
              <p className="font-medium text-slate-500">No active orders right now.</p>
            </div>
          ) : (
            orders.map(order => (
              <Card key={order.id} className="overflow-hidden border-none shadow-sm">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-bold text-lg">Order #{order.id.slice(0, 8)}</div>
                      {/* @ts-ignore */}
                      <div className="text-sm text-primary font-semibold">{order.hotels?.name}</div>
                    </div>
                    <Badge className={order.status === 'READY' ? 'bg-orange-500' : 'bg-blue-500'}>
                      {order.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg space-y-2 text-sm mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        {/* @ts-ignore */}
                        <div className="font-medium text-slate-900">{order.profiles?.hostel} - Room {order.profiles?.room_number}</div>
                        {/* @ts-ignore */}
                        <div className="text-slate-600">{order.profiles?.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                      {/* @ts-ignore */}
                      <a href={`tel:${order.profiles?.phone}`} className="text-primary hover:underline font-medium">
                        {/* @ts-ignore */}
                        {order.profiles?.phone}
                      </a>
                    </div>
                  </div>

                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="md:border-l md:pl-6 space-y-4">
          <h2 className="text-xl font-bold mb-4">Verify Delivery</h2>
          <Card className="border-primary/20 bg-primary/5 shadow-sm">
            <CardContent className="p-6">
              <VerifyOrderForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
