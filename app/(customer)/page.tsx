import Image from "next/image"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, MapPin, Search } from "lucide-react"

export default async function Home() {
  const supabase = createAdminClient()

  // Fetch active hotels
  const { data: hotels } = await supabase
    .from('hotels')
    .select('*')
    .eq('is_active', true)
    .limit(3)

  // Fetch some popular/random active foods
  const { data: foods } = await supabase
    .from('foods')
    .select('*, hotels(name)')
    .eq('is_available', true)
    .limit(4)

  return (
    <div className="flex flex-col gap-16 pb-16">
      
      {/* SECTION 1: HERO */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-[#fdfaf8] px-6 py-28 sm:px-12 sm:py-36 lg:px-16 flex flex-col items-center text-center mx-2 mt-4 shadow-sm">
        <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl mb-6 font-serif">
          Good food, delivered to <br className="hidden sm:block" /> your hostel.
        </h1>
        <p className="max-w-xl text-lg text-slate-600 mb-10">
          Order from your favourite local hotels and get your meal without leaving campus. Fast, fresh, and reliable.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="rounded-full px-8 bg-[#d84f4b] hover:bg-[#c74140] text-white">
            <Link href="/hotels">Browse Food <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-8 bg-white text-slate-700 border-slate-200 hover:bg-slate-50">
            <Link href="/orders">View Orders</Link>
          </Button>
        </div>
      </section>

      {/* SECTION 2: ORDERING STATUS */}
      <section className="mx-auto w-full max-w-5xl px-4">
        <div className="rounded-[1.5rem] bg-[#0ca667] text-white overflow-hidden shadow-lg p-6 sm:p-8 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-full bg-[#15b976] flex items-center justify-center">
              <Clock className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-1">Orders are OPEN</h3>
              <p className="text-emerald-50 text-sm">Order before 8:00 PM for dinner delivery.</p>
            </div>
          </div>
          <Button variant="secondary" className="hidden sm:flex rounded-full text-slate-800 bg-white hover:bg-slate-50 px-6 font-semibold">
            Order Now
          </Button>
        </div>
      </section>

      {/* SECTION 3: HOTEL DISCOVERY */}
      <section className="space-y-8 px-4 max-w-6xl mx-auto w-full mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Choose a hotel</h2>
            <p className="text-slate-500 mt-1">Discover popular restaurants delivering to campus.</p>
          </div>
          <Button variant="ghost" asChild className="hidden sm:flex text-[#d84f4b] hover:text-[#c74140] hover:bg-red-50">
            <Link href="/hotels">See all <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hotels?.map((hotel) => (
            <Link key={hotel.id} href={`/hotels/${hotel.id}`} className="group block">
              <div className="overflow-hidden rounded-2xl bg-white border shadow-sm transition-all hover:shadow-md h-full">
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                  {hotel.image_url ? (
                    <Image src={hotel.image_url} alt={hotel.name} fill className="object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                      <MapPin className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#d84f4b] transition-colors">{hotel.name}</h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{hotel.description || 'Delicious food from ' + hotel.name}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 4: POPULAR FOOD */}
      <section className="space-y-8 px-4 max-w-6xl mx-auto w-full mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Popular dishes</h2>
            <p className="text-slate-500 mt-1">What students are loving right now.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {foods?.map((food) => (
            <div key={food.id} className="overflow-hidden rounded-2xl bg-white border shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-square bg-slate-100 relative">
                {food.image_url ? (
                  <Image src={food.image_url} alt={food.name} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                    <Search className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col h-[140px]">
                <div className="text-xs font-medium text-slate-500 mb-1 truncate">
                  {/* @ts-ignore */}
                  {food.hotels?.name}
                </div>
                <h3 className="font-bold text-slate-900 mb-2 line-clamp-2" title={food.name}>{food.name}</h3>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="font-bold text-lg text-slate-900">₹{food.price}</span>
                  <Button size="sm" className="rounded-full h-8 px-4 text-xs font-bold bg-[#d84f4b] hover:bg-[#c74140] text-white" asChild>
                    <Link href={`/hotels/${food.hotel_id}`}>Add</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
