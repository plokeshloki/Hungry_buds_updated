'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldCheck, Info, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Script from 'next/script'

interface CheckoutClientProps {
  profile: any
  deliveryFee: number
  isOrderingOpen: boolean
  isPaymentConfigured: boolean
}

export function CheckoutClient({ profile, deliveryFee, isOrderingOpen, isPaymentConfigured }: CheckoutClientProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { items, getSubtotal, clearCart } = useCartStore()

  useEffect(() => {
    setMounted(true)
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items.length, router])

  if (!mounted || items.length === 0) return null

  const subtotal = getSubtotal()
  const total = subtotal + deliveryFee

  const handleCheckout = async () => {
    if (!isOrderingOpen) {
      toast.error("Ordering is currently closed.")
      return
    }

    if (!isPaymentConfigured) {
      toast.error("Payments are currently unavailable.")
      return
    }

    setIsProcessing(true)
    try {
      // 1. Call secure backend to create order & Razorpay intent
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          hotel_id: items[0].hotel_id,
          subtotal,
          deliveryFee,
          total
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: data.razorpayOrder.amount,
        currency: data.razorpayOrder.currency,
        name: "HostelBites",
        description: `Order from ${items[0].hotel_name}`,
        order_id: data.razorpayOrder.id,
        handler: async function (response: any) {
          // This is a preliminary frontend callback. 
          // The actual verified success is handled by the backend webhook or server-side verification.
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: data.order.id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            })
            
            if (verifyRes.ok) {
              clearCart()
              router.push(`/orders/${data.order.id}`)
              toast.success("Payment successful!")
            } else {
              toast.error("Payment verification failed. Please contact support.")
              router.push(`/orders/${data.order.id}`)
            }
          } catch (err) {
            toast.error("Error verifying payment.")
          }
        },
        prefill: {
          name: profile.name || "",
          email: profile.email || "",
          contact: profile.phone || ""
        },
        theme: {
          color: "#10b981" // primary emerald color
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false)
            toast.info("Payment cancelled.")
          }
        }
      }

      // @ts-ignore
      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        setIsProcessing(false)
        toast.error("Payment failed: " + response.error.description)
      })
      rzp.open()

    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "An error occurred during checkout")
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CUSTOMER DETAILS */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={profile.name || ''} readOnly className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={profile.phone || ''} readOnly className="bg-slate-50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hostel</Label>
                  <Input value={profile.hostel || ''} readOnly className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label>Room Number</Label>
                  <Input value={profile.room_number || ''} readOnly className="bg-slate-50" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                Need to change this? <Link href="/profile/edit" className="text-primary hover:underline">Edit your profile</Link>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.quantity}x {item.name}</span>
                    <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PAYMENT SUMMARY */}
        <div className="space-y-6">
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 text-sm mb-6 pb-6 border-b border-dashed">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">₹{deliveryFee.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex justify-between font-bold text-xl mb-8">
                <span>Total</span>
                <span className="text-primary">₹{total.toFixed(2)}</span>
              </div>

              {!isOrderingOpen && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm mb-6 flex items-start gap-2">
                  <Info className="h-5 w-5 mt-0.5 shrink-0" />
                  <span>Orders are currently paused by the administrator.</span>
                </div>
              )}

              {!isPaymentConfigured && isOrderingOpen && (
                <div className="bg-orange-50 text-orange-700 p-4 rounded-lg text-sm mb-6 flex items-start gap-2">
                  <Info className="h-5 w-5 mt-0.5 shrink-0" />
                  <span>Online payment is currently unavailable. The payment service has not been configured yet.</span>
                </div>
              )}

              <Button 
                onClick={handleCheckout}
                disabled={!isOrderingOpen || !isPaymentConfigured || isProcessing}
                className="w-full rounded-full h-12 text-lg relative"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Preparing secure payment...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5 mr-2" />
                    Proceed to Secure Payment
                  </>
                )}
              </Button>
              
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> 100% Secure Encrypted Payment
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
