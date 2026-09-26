'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { Truck, LogOut, CheckSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/actions'

interface DeliveryLayoutProps {
  children: ReactNode
}

export function DeliveryLayout({ children }: DeliveryLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile-first Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/delivery" className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg text-primary tracking-tight">Delivery</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Link href="/delivery/verify">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <CheckSquare className="h-4 w-4 mr-2" />
                Verify Code
              </Button>
            </Link>
            <form action={logout}>
              <Button type="submit" variant="ghost" size="icon" className="hover:text-red-500 hover:bg-red-50">
                <LogOut className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-3xl">
        {children}
      </main>
    </div>
  )
}
