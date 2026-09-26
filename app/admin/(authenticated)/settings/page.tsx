import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { updateSettings } from "./actions"

export const metadata = {
  title: 'Platform Settings | HungryBuds Admin',
}

export default async function AdminSettingsPage() {
  const supabase = createAdminClient()

  // Ensure settings row exists
  let { data: settings } = await supabase.from('settings').select('*').single()
  
  if (!settings) {
    const { data: newSettings } = await supabase.from('settings').insert({}).select().single()
    settings = newSettings
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">Manage global platform configuration.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global Configuration</CardTitle>
          <CardDescription>
            These settings affect all users and hotels on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateSettings} className="space-y-8">
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Accept New Orders</Label>
                <p className="text-sm text-muted-foreground">
                  Turn this off in emergencies to pause all incoming orders.
                </p>
              </div>
              <Switch 
                name="is_ordering_open" 
                defaultChecked={settings.is_ordering_open}
                value="true" // HTML switch behavior
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="delivery_fee">Flat Delivery Fee (₹)</Label>
                <Input 
                  id="delivery_fee" 
                  name="delivery_fee" 
                  type="number" 
                  step="0.01" 
                  defaultValue={settings.delivery_fee} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_order_value">Minimum Order Value (₹)</Label>
                <Input 
                  id="min_order_value" 
                  name="min_order_value" 
                  type="number" 
                  step="0.01" 
                  defaultValue={settings.min_order_value} 
                  required 
                />
              </div>
            </div>
            
            <div className="pt-4 border-t flex justify-end">
              <Button type="submit">Save Settings</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
