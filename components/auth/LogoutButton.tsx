'use client'

import { LogOut } from 'lucide-react'
import { logout } from '@/app/actions'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button type="submit" variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </form>
  )
}
