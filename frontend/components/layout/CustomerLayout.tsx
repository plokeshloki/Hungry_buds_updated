'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ListOrdered, ShoppingBag, User, Utensils } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store/cart'
import { APP_CONFIG } from '@/lib/constants'
import { logout } from '@/app/actions'

interface CustomerLayoutProps {
  children: ReactNode
}

export function CustomerLayout({ children }: CustomerLayoutProps) {
  const pathname = usePathname()
  const { items } = useCartStore()
  const cartCount = items.reduce((total, item) => total + item.quantity, 0)


  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Hotels', href: '/hotels', icon: Utensils },
    { name: 'Orders', href: '/orders', icon: ListOrdered },
    { name: 'Cart', href: '/cart', icon: ShoppingBag },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0 flex flex-col">
      {/* Desktop Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-primary tracking-tight">HostelBites</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {item.name}
                {item.name === 'Cart' && cartCount > 0 && (
                  <span className="ml-1 inline-flex h-5 items-center justify-center rounded-full bg-primary px-2 text-[10px] font-bold text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Link>
            ))}
            <form action={logout} className="ml-2">
              <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500 hover:bg-red-50">
                Logout
              </Button>
            </form>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Desktop Footer */}
      <footer className="hidden md:block border-t bg-white mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-primary">{APP_CONFIG.name}</h3>
              <p className="text-sm text-muted-foreground">{APP_CONFIG.description}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href={APP_CONFIG.links.home} className="hover:text-primary transition-colors">Home</Link></li>
                <li><Link href={APP_CONFIG.links.hotels} className="hover:text-primary transition-colors">Hotels</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Customer</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href={APP_CONFIG.links.orders} className="hover:text-primary transition-colors">Orders</Link></li>
                <li><Link href={APP_CONFIG.links.profile} className="hover:text-primary transition-colors">Profile</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href={APP_CONFIG.links.terms} className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href={APP_CONFIG.links.privacy} className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100 flex justify-between items-center text-sm text-muted-foreground">
            <p>Built with ❤️ by {APP_CONFIG.credits.join(', ')}</p>
            <p>© {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16 bg-white border-t safe-area-bottom">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'relative flex flex-col items-center justify-center w-full h-full space-y-1',
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            <div className="relative">
              <item.icon className="h-5 w-5" />
              {item.name === 'Cart' && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 inline-flex h-4 items-center justify-center rounded-full bg-primary px-1.5 text-[8px] font-bold text-primary-foreground border-2 border-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
