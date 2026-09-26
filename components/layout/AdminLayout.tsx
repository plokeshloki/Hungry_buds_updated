'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Store, 
  ListOrdered, 
  Utensils, 
  LayoutDashboard, 
  Settings, 
  Users,
  Truck,
  Menu,
  X,
  FileText
} from 'lucide-react'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ListOrdered },
  { name: 'Hotels', href: '/admin/hotels', icon: Store },
  { name: 'Foods', href: '/admin/foods', icon: FileText },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Delivery', href: '/admin/delivery', icon: Truck },
  { name: 'System Health & Settings', href: '/admin/settings', icon: Settings },
]

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <div className="flex h-full flex-col bg-slate-900 text-slate-50">
      <div className="flex h-16 items-center px-6 font-bold text-xl tracking-tight border-b border-slate-800">
        Admin Portal
      </div>
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors',
                isActive 
                  ? 'bg-slate-800 text-white' 
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              )}
            >
              <item.icon className={cn(
                'mr-3 h-5 w-5 flex-shrink-0',
                isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-300'
              )} />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4">
        <LogoutButton />
      </div>
    </div>
  )
}

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/80 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 flex-col transition-transform duration-300 ease-in-out md:hidden",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <header className="sticky top-0 z-30 flex h-16 flex-shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 md:hidden">
          <Button 
            variant="ghost" 
            size="icon"
            className="-m-2.5 p-2.5 text-gray-700 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </Button>
          <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
            Admin Dashboard
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
