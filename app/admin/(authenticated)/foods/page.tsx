import { createAdminClient } from "@/lib/supabase/admin"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search } from "lucide-react"
import { toggleFoodStatus } from "./actions"

export const metadata = {
  title: 'Manage Foods | HostelBites Admin',
}

export default async function AdminFoodsPage() {
  const supabase = createAdminClient()

  const { data: foods } = await supabase
    .from('foods')
    .select('*, hotels(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Foods</h1>
          <p className="text-muted-foreground">Manage menu items, prices, and availability.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Food
        </Button>
      </div>

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Food Name</TableHead>
              <TableHead>Hotel</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!foods || foods.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No foods found.
                </TableCell>
              </TableRow>
            ) : (
              foods.map((food) => (
                <TableRow key={food.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                        {food.image_url ? (
                          <img src={food.image_url} alt={food.name} className="h-full w-full object-cover rounded" />
                        ) : (
                          <Search className="h-5 w-5" />
                        )}
                      </div>
                      {food.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {/* @ts-ignore */}
                    {food.hotels?.name}
                  </TableCell>
                  <TableCell>₹{food.price}</TableCell>
                  <TableCell>
                    <Badge variant={food.is_available ? "default" : "secondary"} className={food.is_available ? "bg-emerald-500" : ""}>
                      {food.is_available ? 'Available' : 'Out of Stock'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <form action={toggleFoodStatus}>
                      <input type="hidden" name="id" value={food.id} />
                      <input type="hidden" name="currentState" value={food.is_available ? 'true' : 'false'} />
                      <Button variant="outline" size="sm">
                        {food.is_available ? 'Mark Out of Stock' : 'Mark Available'}
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
