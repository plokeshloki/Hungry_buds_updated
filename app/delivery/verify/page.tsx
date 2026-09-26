import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function VerifyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Verify</h1>
        <p className="text-muted-foreground">This is the placeholder page for verify.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Verify Data</CardTitle>
          <CardDescription>This page is currently a placeholder and will be built out soon.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Check back later for updates.</p>
        </CardContent>
      </Card>
    </div>
  )
}
