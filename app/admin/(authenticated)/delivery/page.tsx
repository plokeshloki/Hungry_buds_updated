import { getDeliveryPersonnel } from './actions'
import AddDeliveryForm from './AddDeliveryForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'

export default async function DeliveryPersonnelPage() {
  const personnel = await getDeliveryPersonnel()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Delivery Personnel</h1>
        <p className="text-muted-foreground">Manage your delivery staff.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Personnel</CardTitle>
              <CardDescription>Create a new delivery account.</CardDescription>
            </CardHeader>
            <CardContent>
              <AddDeliveryForm />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Current Personnel</CardTitle>
              <CardDescription>List of all active delivery staff.</CardDescription>
            </CardHeader>
            <CardContent>
              {personnel.length === 0 ? (
                <p className="text-sm text-muted-foreground">No delivery personnel found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Joined Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {personnel.map((person) => (
                      <TableRow key={person.id}>
                        <TableCell className="font-medium">{person.name}</TableCell>
                        <TableCell>{person.phone}</TableCell>
                        <TableCell>{person.created_at ? format(new Date(person.created_at), 'MMM d, yyyy') : 'Unknown'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
