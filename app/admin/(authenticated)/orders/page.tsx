import { createAdminClient } from "@/lib/supabase/admin"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { updateOrderStatus } from "./actions"

export const metadata = {
  title: 'Manage Orders | HungryBuds Admin',
}

export default async function AdminOrdersPage() {
  const supabase = createAdminClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, hotels(name), profiles(name, phone, hostel, room_number)')
    .order('created_at', { ascending: false })
    .limit(50)

  // Mapping next possible states
  const nextStates: Record<string, string> = {
    'PAID': 'CONFIRMED',
    'CONFIRMED': 'PREPARING',
    'PREPARING': 'READY',
    'READY': 'OUT_FOR_DELIVERY',
    // Delivered is usually handled by delivery personnel, but admin could force it. We leave it out to enforce process.
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage active orders and transition statuses.</p>
        </div>
      </div>

      <div className="border rounded-lg bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID / Time</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Hotel / Total</TableHead>
              <TableHead>Current Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!orders || orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const nextState = nextStates[order.status]
                
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium text-xs font-mono">{order.id.slice(0, 8)}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(order.created_at), 'MMM d, h:mm a')}</div>
                    </TableCell>
                    <TableCell>
                      {/* @ts-ignore */}
                      <div className="font-medium">{order.profiles?.name}</div>
                      {/* @ts-ignore */}
                      <div className="text-xs text-muted-foreground">{order.profiles?.hostel} - {order.profiles?.room_number}</div>
                    </TableCell>
                    <TableCell>
                      {/* @ts-ignore */}
                      <div className="font-medium">{order.hotels?.name}</div>
                      <div className="text-xs font-bold text-primary">₹{order.total}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`
                        ${['DELIVERED', 'REFUNDED', 'CANCELLED'].includes(order.status) ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-700 border-blue-200'}
                      `}>
                        {order.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {nextState ? (
                        <form action={updateOrderStatus}>
                          <input type="hidden" name="id" value={order.id} />
                          <input type="hidden" name="status" value={nextState} />
                          <Button size="sm" className="bg-primary">
                            Mark {nextState.replace(/_/g, ' ')}
                          </Button>
                        </form>
                      ) : (
                        <span className="text-xs text-muted-foreground">No action</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
