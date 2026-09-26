'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ListOrdered, LogIn, LogOut, ShoppingBag, User, Utensils } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store/cart'
import { APP_CONFIG } from '@/lib/constants'
import { logout } from '@/app/actions'
import { FoodSlideshowBackground } from '@/components/customer/FoodSlideshowBackground'

interface CustomerLayoutProps {
  children: ReactNode
  user?: any
}

export function CustomerLayout({ children, user }: CustomerLayoutProps) {
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
    <div className="relative min-h-screen pb-20 md:pb-0 flex flex-col font-sans">
      {/* Dynamic Appetizing Food Background Slideshow */}
      <FoodSlideshowBackground />

      {/* Floating Glassmorphic Top Navbar */}
      <header className="sticky top-3 sm:top-4 z-50 w-full px-3 sm:px-6 pointer-events-none transition-all">
        <div className="pointer-events-auto max-w-6xl mx-auto backdrop-blur-xl bg-white/80 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-full px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group transition-transform active:scale-95">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-tr from-[#ea580c] to-[#d84f4b] flex items-center justify-center shadow-md shadow-[#d84f4b]/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-xl sm:text-2xl text-[#d84f4b] tracking-tight">
              HungryBuds
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-[#d84f4b]/10 text-[#d84f4b] font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  )}
                >
                  <item.icon className={cn('h-4 w-4', isActive ? 'text-[#d84f4b]' : 'text-slate-500')} />
                  {item.name}
                  {item.name === 'Cart' && cartCount > 0 && (
                    <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d84f4b] px-1.5 text-[10px] font-bold text-white shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )
            })}

            {/* Auth Action */}
            <div className="pl-2 ml-1 border-l border-slate-200/80">
              {user ? (
                <form action={logout}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-slate-600 hover:text-red-600 hover:bg-red-50/80 gap-1.5 font-medium"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </form>
              ) : (
                <Link href="/login">
                  <Button
                    size="sm"
                    className="rounded-full bg-gradient-to-r from-[#ea580c] to-[#d84f4b] hover:from-[#c2410c] hover:to-[#be123c] text-white shadow-md shadow-[#d84f4b]/25 font-semibold px-5 transition-all active:scale-95"
                  >
                    <LogIn className="h-4 w-4 mr-1.5" />
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile Right Action (Login / Logout / Cart quick access) */}
          <div className="flex md:hidden items-center gap-2">
            {user ? (
              <form action={logout}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 px-2.5 h-8 gap-1"
                >
                  <LogOut className="h-3.5 w-3.5 text-red-500" />
                  Logout
                </Button>
              </form>
            ) : (
              <Link href="/login">
                <Button
                  size="sm"
                  className="rounded-full bg-gradient-to-r from-[#ea580c] to-[#d84f4b] text-white text-xs font-semibold px-3.5 h-8 shadow-sm"
                >
                  <LogIn className="h-3.5 w-3.5 mr-1" />
                  Login
                </Button>
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-4">
        {children}
      </main>

      {/* Desktop Footer */}
      <footer className="hidden md:block border-t border-slate-200/60 bg-white/70 backdrop-blur-md mt-auto">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-[#ea580c] to-[#d84f4b] flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">{APP_CONFIG.name}</h3>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{APP_CONFIG.description}</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href={APP_CONFIG.links.home} className="hover:text-[#d84f4b] transition-colors">Home</Link></li>
                <li><Link href={APP_CONFIG.links.hotels} className="hover:text-[#d84f4b] transition-colors">Hotels</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Customer</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href={APP_CONFIG.links.orders} className="hover:text-[#d84f4b] transition-colors">Orders</Link></li>
                <li><Link href={APP_CONFIG.links.profile} className="hover:text-[#d84f4b] transition-colors">Profile</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href={APP_CONFIG.links.terms} className="hover:text-[#d84f4b] transition-colors">Terms of Service</Link></li>
                <li><Link href={APP_CONFIG.links.privacy} className="hover:text-[#d84f4b] transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200/60 flex justify-between items-center text-sm text-slate-500">
            <p>Built with ❤️ by {APP_CONFIG.credits.join(', ')}</p>
            <p>© {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50 flex items-center justify-around h-16 bg-white/85 backdrop-blur-xl border border-white/80 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] safe-area-bottom px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center w-full h-full py-1 transition-all',
                isActive
                  ? 'text-[#d84f4b] font-semibold scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <div className="relative">
                <item.icon className={cn('h-5 w-5', isActive ? 'text-[#d84f4b]' : 'text-slate-500')} />
                {item.name === 'Cart' && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d84f4b] px-1 text-[9px] font-bold text-white border-2 border-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
