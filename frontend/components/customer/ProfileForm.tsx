'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { updateProfile } from '@/app/(customer)/profile/actions'
import { Loader2 } from 'lucide-react'

interface ProfileFormProps {
  profile: {
    name?: string | null
    phone?: string | null
    hostel?: string | null
    room_number?: string | null
  }
  email: string
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(formData: FormData) {
    setIsSubmitting(true)
    const result = await updateProfile(formData)
    setIsSubmitting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Profile updated successfully')
    }
  }

  return (
    <Card className="border-none shadow-md">
      <CardContent className="p-6 sm:p-8">
        <form action={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} disabled className="bg-slate-50 text-slate-500" />
            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" defaultValue={profile.name || ''} placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" defaultValue={profile.phone || ''} placeholder="9876543210" required />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="hostel">Hostel Name / Block</Label>
              <Input id="hostel" name="hostel" defaultValue={profile.hostel || ''} placeholder="Block A" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room_number">Room Number</Label>
              <Input id="room_number" name="room_number" defaultValue={profile.room_number || ''} placeholder="101" required />
            </div>
          </div>
          
          <div className="pt-4 border-t flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="rounded-full px-8">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
