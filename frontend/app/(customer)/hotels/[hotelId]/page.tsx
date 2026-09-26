import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Clock, Info } from "lucide-react"
import { FoodCard } from "@/components/customer/FoodCard"

export const metadata = {
  title: 'Hotel Menu | HostelBites',
}

export default async function HotelMenuPage(props: { params: Promise<{ hotelId: string }> }) {
  const params = await props.params
  const { hotelId } = params
  const supabase = await createClient()

  // Fetch hotel details
  const { data: hotel } = await supabase
    .from('hotels')
    .select('*')
    .eq('id', hotelId)
    .single()

  if (!hotel) {
    notFound()
  }

  // Fetch categories for this hotel
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('hotel_id', hotelId)
    .order('name')

  // Fetch foods for this hotel
  const { data: foods } = await supabase
    .from('foods')
    .select('*')
    .eq('hotel_id', hotelId)
    .order('name')

  // Group foods by category
  const foodsByCategory = categories?.map(cat => ({
    ...cat,
    foods: foods?.filter(f => f.category_id === cat.id) || []
  })).filter(cat => cat.foods.length > 0) || []

  // Uncategorized foods
  const uncategorizedFoods = foods?.filter(f => !f.category_id) || []

  return (
    <div className="flex flex-col gap-8 pb-24">
      {/* HEADER */}
      <div className="relative h-64 md:h-80 w-full rounded-3xl overflow-hidden bg-slate-100 mb-4">
        {hotel.image_url ? (
          <Image src={hotel.image_url} alt={hotel.name} fill className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-300">
            <MapPin className="h-16 w-16" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        <div className="absolute top-4 left-4 z-10">
          <Button variant="secondary" size="icon" className="rounded-full bg-white/90 hover:bg-white" asChild>
            <Link href="/hotels"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${hotel.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}>
              {hotel.is_active ? 'Accepting Orders' : 'Currently Closed'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">{hotel.name}</h1>
          {hotel.description && (
            <p className="text-white/80 max-w-2xl line-clamp-2">{hotel.description}</p>
          )}
        </div>
      </div>

      {!hotel.is_active && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start gap-3">
          <Info className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold">This hotel is currently unavailable</h3>
            <p className="text-sm">You cannot add items from this hotel to your cart right now. Please check back later or choose another hotel.</p>
          </div>
        </div>
      )}

      {/* CATEGORY NAVIGATION */}
      {foodsByCategory.length > 0 && (
        <div className="sticky top-16 z-30 bg-gray-50/95 backdrop-blur-md py-4 -mx-4 px-4 sm:mx-0 sm:px-0 border-b">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button variant="secondary" className="rounded-full shrink-0" asChild>
              <a href="#all">All Items</a>
            </Button>
            {foodsByCategory.map(cat => (
              <Button key={cat.id} variant="outline" className="rounded-full shrink-0 bg-white" asChild>
                <a href={`#category-${cat.id}`}>{cat.name}</a>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* FOOD LIST */}
      <div id="all" className="space-y-12">
        {foodsByCategory.map(cat => (
          <div key={cat.id} id={`category-${cat.id}`} className="scroll-mt-36">
            <h2 className="text-2xl font-bold mb-6 tracking-tight">{cat.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {cat.foods.map(food => (
                <FoodCard 
                  key={food.id} 
                  food={{...food, is_available: food.is_available && hotel.is_active}} 
                  hotelName={hotel.name} 
                />
              ))}
            </div>
          </div>
        ))}

        {uncategorizedFoods.length > 0 && (
          <div id="category-uncategorized" className="scroll-mt-36">
            <h2 className="text-2xl font-bold mb-6 tracking-tight">
              {foodsByCategory.length > 0 ? 'Other Items' : 'Menu'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {uncategorizedFoods.map(food => (
                <FoodCard 
                  key={food.id} 
                  food={{...food, is_available: food.is_available && hotel.is_active}} 
                  hotelName={hotel.name} 
                />
              ))}
            </div>
          </div>
        )}

        {(!foods || foods.length === 0) && (
          <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl bg-white">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">No items found</h3>
            <p>This hotel hasn't added any menu items yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
