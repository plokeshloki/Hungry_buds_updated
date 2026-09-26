import { createAdminClient } from "@/lib/supabase/admin"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Store, Plus } from "lucide-react"
import { toggleHotelStatus } from "./actions"

export const metadata = {
  title: 'Manage Hotels | HungryBuds Admin',
}

export default async function AdminHotelsPage() {
  const supabase = createAdminClient()

  const { data: hotels } = await supabase
    .from('hotels')
    .select('*, foods(count)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hotels</h1>
          <p className="text-muted-foreground">Manage restaurants and their availability.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Hotel
        </Button>
      </div>

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hotel Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Menu Items</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!hotels || hotels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No hotels found.
                </TableCell>
              </TableRow>
            ) : (
              hotels.map((hotel) => (
                <TableRow key={hotel.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                        {hotel.image_url ? (
                          <img src={hotel.image_url} alt={hotel.name} className="h-full w-full object-cover rounded" />
                        ) : (
                          <Store className="h-5 w-5" />
                        )}
                      </div>
                      {hotel.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={hotel.is_active ? "default" : "secondary"} className={hotel.is_active ? "bg-emerald-500" : ""}>
                      {hotel.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {/* @ts-ignore */}
                    {hotel.foods[0]?.count || 0} items
                  </TableCell>
                  <TableCell className="text-right">
                    <form action={toggleHotelStatus}>
                      <input type="hidden" name="id" value={hotel.id} />
                      <input type="hidden" name="currentState" value={hotel.is_active ? 'true' : 'false'} />
                      <Button variant="outline" size="sm">
                        {hotel.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
