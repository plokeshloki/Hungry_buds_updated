import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ChevronRight, Package, ListOrdered } from 'lucide-react'

export const metadata = {
  title: 'My Orders | HungryBuds',
}

export default async function OrdersPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?returnTo=/orders')
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*, hotels(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Order History</h1>
        <p className="text-muted-foreground">View your active and past orders.</p>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed rounded-3xl bg-white">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-6">
            <ListOrdered className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            You haven't placed any orders. Start exploring local hotels and treat yourself!
          </p>
          <Button asChild size="lg" className="rounded-full px-8">
            <Link href="/hotels">Browse Food</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map(order => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-none shadow-sm">
                <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        {/* @ts-ignore */}
                        {order.hotels?.name}
                      </h3>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        {format(new Date(order.created_at), 'MMM d, yyyy • h:mm a')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                    <div className="text-left sm:text-right">
                      <div className="font-bold text-lg">₹{order.total}</div>
                      <div className={`text-xs font-bold px-2 py-1 rounded-full inline-block mt-1
                        ${['DELIVERED', 'REFUNDED', 'CANCELLED'].includes(order.status) 
                          ? 'bg-slate-100 text-slate-600' 
                          : 'bg-emerald-100 text-emerald-700'}`}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
