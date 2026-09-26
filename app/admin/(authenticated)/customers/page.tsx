import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export const metadata = {
  title: 'Customers | HungryBuds Admin',
}

export default async function CustomersPage() {
  const supabase = createAdminClient()

  const { data: customersData, error } = await supabase
    .from('profiles')
    .select(`
      id, name, phone, hostel, room_number, created_at,
      orders (
        id, status, total, created_at
      )
    `)
    .eq('role', 'CUSTOMER')

  if (error) {
    console.error("Failed to fetch customers:", error)
  }

  const activeStatuses = ['PAID', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY']

  // Process data to calculate active orders, total orders, total spent
  const processedCustomers = (customersData || []).map((customer: any) => {
    const orders = customer.orders || []
    
    // Sort orders by created_at descending
    orders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const activeOrders = orders.filter((o: any) => activeStatuses.includes(o.status))
    const hasActiveOrder = activeOrders.length > 0
    const totalSpent = orders
      .filter((o: any) => o.status === 'DELIVERED')
      .reduce((sum: number, o: any) => sum + o.total, 0)

    return {
      ...customer,
      activeOrders,
      totalOrders: orders.length,
      totalSpent,
      hasActiveOrder,
      lastOrderAt: orders.length > 0 ? orders[0].created_at : null
    }
  })

  // Sort: Customers with active orders first, then by last order date, then by creation date
  processedCustomers.sort((a, b) => {
    if (a.hasActiveOrder && !b.hasActiveOrder) return -1
    if (!a.hasActiveOrder && b.hasActiveOrder) return 1
    
    if (a.lastOrderAt && b.lastOrderAt) {
      return new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime()
    }
    if (a.lastOrderAt) return -1
    if (b.lastOrderAt) return 1
    
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">Manage your customers and view their order history.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
          <CardDescription>
            A complete list of registered customers. Sorted by active orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg bg-white overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name / Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Orders</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No customers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  processedCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="font-bold">{customer.name || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground">{customer.phone || 'No phone'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{customer.hostel || 'Not set'}</div>
                        <div className="text-sm text-muted-foreground">
                          {customer.room_number ? `Room ${customer.room_number}` : ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.hasActiveOrder ? (
                          <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
                            {customer.activeOrders.length} Active Order{customer.activeOrders.length > 1 ? 's' : ''}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50">
                            Idle
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-medium">{customer.totalOrders}</div>
                        {customer.lastOrderAt && (
                          <div className="text-[10px] text-muted-foreground">
                            Last: {format(new Date(customer.lastOrderAt), 'MMM d')}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-bold text-primary">₹{customer.totalSpent.toFixed(2)}</div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
