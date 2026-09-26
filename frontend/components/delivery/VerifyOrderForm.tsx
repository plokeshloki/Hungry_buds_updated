'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { verifyAndDeliverOrder } from '@/app/delivery/actions'
import { Loader2, CheckCircle2 } from 'lucide-react'

export function VerifyOrderForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(formData: FormData) {
    setIsSubmitting(true)
    const result = await verifyAndDeliverOrder(formData)
    setIsSubmitting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(result.message)
      // Reset form
      const form = document.getElementById('verify-form') as HTMLFormElement
      if (form) form.reset()
    }
  }

  return (
    <form id="verify-form" action={onSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground mb-6">
        Enter the first 8 characters of the Order ID and the 6-digit security code provided by the customer to mark the order as Delivered.
      </p>
      
      <div className="space-y-2">
        <Label htmlFor="orderId">Order ID (First 8 chars)</Label>
        <Input 
          id="orderId" 
          name="orderId" 
          placeholder="e.g. 1a2b3c4d" 
          maxLength={8}
          required 
          className="font-mono uppercase"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="securityCode">6-Digit Security Code</Label>
        <Input 
          id="securityCode" 
          name="securityCode" 
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="000000" 
          required 
          className="font-mono text-xl tracking-widest text-center h-14"
        />
      </div>
      
      <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-lg rounded-xl bg-emerald-600 hover:bg-emerald-700">
        {isSubmitting ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <CheckCircle2 className="mr-2 h-5 w-5" />
        )}
        Verify & Deliver
      </Button>
    </form>
  )
}
