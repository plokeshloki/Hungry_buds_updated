import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Info, Search } from "lucide-react"
import { FoodCard } from "@/components/customer/FoodCard"

export const metadata = {
  title: 'Hotel Menu | HungryBuds',
}

export default async function HotelMenuPage(props: { params: Promise<{ hotelId: string }> }) {
  const params = await props.params
  const { hotelId } = params
  const supabase = createAdminClient()

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
    <div className="flex flex-col gap-8 pb-24 px-4 max-w-6xl mx-auto w-full pt-4">
      {/* HEADER */}
      <div className="relative h-72 md:h-96 w-full rounded-[2.5rem] overflow-hidden bg-slate-100 shadow-md">
        {hotel.image_url ? (
          <Image src={hotel.image_url} alt={hotel.name} fill className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-300">
            <MapPin className="h-16 w-16" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
        <div className="absolute top-6 left-6 z-10">
          <Button variant="secondary" size="icon" className="rounded-full bg-white text-slate-800 hover:bg-slate-100 shadow-sm h-12 w-12" asChild>
            <Link href="/hotels"><ArrowLeft className="h-6 w-6" /></Link>
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 text-white z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${hotel.is_active ? 'bg-[#0ca667]' : 'bg-red-500'} shadow-sm`}>
              {hotel.is_active ? 'Accepting Orders' : 'Currently Closed'}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-3 font-serif">{hotel.name}</h1>
          {hotel.description && (
            <p className="text-slate-200 max-w-2xl line-clamp-2 text-lg">{hotel.description}</p>
          )}
        </div>
      </div>

      {!hotel.is_active && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-[1.5rem] p-6 flex items-start gap-4 shadow-sm">
          <Info className="h-6 w-6 shrink-0 mt-0.5 text-red-600" />
          <div>
            <h3 className="font-bold text-lg mb-1">This hotel is currently unavailable</h3>
            <p className="text-red-700">You cannot add items from this hotel to your cart right now. Please check back later or choose another hotel.</p>
          </div>
        </div>
      )}

      {/* CATEGORY NAVIGATION */}
      {foodsByCategory.length > 0 && (
        <div className="sticky top-16 z-30 bg-[#f9fafb]/90 backdrop-blur-xl py-4 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-slate-200/50">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <Button variant="secondary" className="rounded-full shrink-0 bg-slate-800 text-white hover:bg-slate-700 font-semibold px-6" asChild>
              <a href="#all">All Items</a>
            </Button>
            {foodsByCategory.map(cat => (
              <Button key={cat.id} variant="outline" className="rounded-full shrink-0 bg-white border-slate-200 text-slate-600 hover:text-slate-900 font-medium px-6" asChild>
                <a href={`#category-${cat.id}`}>{cat.name}</a>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* FOOD LIST */}
      <div id="all" className="space-y-16 mt-4">
        {foodsByCategory.map(cat => (
          <div key={cat.id} id={`category-${cat.id}`} className="scroll-mt-40">
            <h2 className="text-3xl font-extrabold mb-8 tracking-tight text-slate-900">{cat.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {cat.foods.map((food: any) => (
                <FoodCard 
                  key={food.id} 
                  food={{...food, is_available: food.is_available && hotel.is_active}} 
                  hotelName={hotel.name} 
                />
              ))}
            </div>
          </div>
        ))}



        {(!foods || foods.length === 0) && (
          <div className="text-center py-24 text-slate-400 border-2 border-dashed rounded-[2rem] bg-white shadow-sm">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 mb-6">
              <Search className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-700">No items found</h3>
            <p className="text-lg">This hotel hasn't added any menu items yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
