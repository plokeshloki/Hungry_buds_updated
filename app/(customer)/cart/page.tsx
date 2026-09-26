import { createClient } from "@/lib/supabase/server"
import { CartClient } from "@/components/cart/CartClient"

export const metadata = {
  title: 'Your Cart | HostelBites',
}

export default async function CartPage() {
  const supabase = await createClient()
  
  // Fetch delivery fee from settings
  const { data: settings } = await supabase
    .from('settings')
    .select('delivery_fee, min_order_value, is_ordering_open')
    .single()

  const deliveryFee = settings?.delivery_fee || 0
  const minOrderValue = settings?.min_order_value || 0
  const isOrderingOpen = settings?.is_ordering_open ?? true

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">Your Cart</h1>
      <CartClient 
        deliveryFee={deliveryFee} 
        minOrderValue={minOrderValue} 
        isOrderingOpen={isOrderingOpen} 
      />
    </div>
  )
}
