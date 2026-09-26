import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CheckoutClient } from "@/components/checkout/CheckoutClient"

export const metadata = {
  title: 'Checkout | HungryBuds',
}

export default async function CheckoutPage() {
  const supabase = await createClient()
  
  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?returnTo=/checkout')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch settings
  const { data: settings } = await supabase
    .from('settings')
    .select('delivery_fee, is_ordering_open')
    .single()

  // We should also check if Razorpay is configured (e.g. by checking if NEXT_PUBLIC_RAZORPAY_KEY_ID exists)
  const isPaymentConfigured = !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">Checkout</h1>
      <CheckoutClient 
        profile={profile || {}} 
        deliveryFee={settings?.delivery_fee || 0}
        isOrderingOpen={settings?.is_ordering_open ?? true}
        isPaymentConfigured={isPaymentConfigured}
      />
    </div>
  )
}
