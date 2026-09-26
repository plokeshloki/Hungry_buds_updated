import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">This is the placeholder page for reports.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Reports Data</CardTitle>
          <CardDescription>This page is currently a placeholder and will be built out soon.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Check back later for updates.</p>
        </CardContent>
      </Card>
    </div>
  )
}
