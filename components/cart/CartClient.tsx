'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Minus, Plus, ShoppingBag, Trash2, Info } from 'lucide-react'

interface CartClientProps {
  deliveryFee: number
  minOrderValue: number
  isOrderingOpen: boolean
}

export function CartClient({ deliveryFee, minOrderValue, isOrderingOpen }: CartClientProps) {
  // Use state to avoid hydration mismatch with Zustand persist
  const [mounted, setMounted] = useState(false)
  const { items, updateQuantity, removeItem, getSubtotal, clearCart } = useCartStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="animate-pulse h-64 bg-slate-100 rounded-2xl"></div>

  if (items.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-white">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Looks like you haven't added anything to your cart yet. Discover delicious food from hotels near you.
        </p>
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="/hotels">Browse Food</Link>
        </Button>
      </div>
    )
  }

  const subtotal = getSubtotal()
  const total = subtotal + deliveryFee
  const hotelName = items[0]?.hotel_name

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* ITEMS LIST */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b">
          <h2 className="text-xl font-bold">Items from <span className="text-primary">{hotelName}</span></h2>
          <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4 mr-2" /> Clear
          </Button>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden border-none shadow-sm">
              <CardContent className="p-4 sm:p-6 flex items-center gap-4 sm:gap-6">
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-xl overflow-hidden bg-slate-100">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                      <ShoppingBag className="h-8 w-8" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{item.name}</h3>
                  <div className="font-semibold text-primary mt-1">₹{item.price}</div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border rounded-full bg-slate-50">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full" 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full" 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="font-bold">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ORDER SUMMARY */}
      <div className="lg:col-span-1">
        <Card className="border-none shadow-md sticky top-24">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm mb-6 pb-6 border-b border-dashed">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item Total</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium">₹{deliveryFee.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-between font-bold text-lg mb-8">
              <span>Total To Pay</span>
              <span className="text-primary">₹{total.toFixed(2)}</span>
            </div>

            {!isOrderingOpen && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4 flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Ordering is currently closed. You cannot checkout at this time.</span>
              </div>
            )}

            {subtotal < minOrderValue && (
              <div className="bg-orange-50 text-orange-700 p-3 rounded-lg text-sm mb-4 flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Minimum order value is ₹{minOrderValue}. Add ₹{(minOrderValue - subtotal).toFixed(2)} more to checkout.</span>
              </div>
            )}

            <Button 
              asChild={isOrderingOpen && subtotal >= minOrderValue}
              disabled={!isOrderingOpen || subtotal < minOrderValue} 
              className="w-full rounded-full h-12 text-lg"
            >
              {isOrderingOpen && subtotal >= minOrderValue ? (
                <Link href="/checkout">Proceed to Checkout</Link>
              ) : (
                <span>Proceed to Checkout</span>
              )}
            </Button>
            
            <div className="mt-4 text-center">
              <Button variant="link" asChild className="text-muted-foreground">
                <Link href="/hotels">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
