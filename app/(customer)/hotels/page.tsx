import Image from "next/image"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, ArrowRight } from "lucide-react"

export const metadata = {
  title: 'Hotels | HungryBuds',
  description: 'Browse all available hotels delivering to your hostel.',
}

export default async function HotelsPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams
  const query = searchParams?.q || ''
  const supabase = createAdminClient()

  let dbQuery = supabase
    .from('hotels')
    .select('*, foods(count)')
    .eq('is_active', true)
    
  if (query) {
    dbQuery = dbQuery.ilike('name', `%${query}%`)
  }

  const { data: hotels } = await dbQuery.order('name')

  return (
    <div className="flex flex-col gap-8 pb-16 px-4 max-w-6xl mx-auto w-full pt-4">
      
      {/* HEADER & SEARCH */}
      <section className="bg-[#fdfaf8] rounded-[2rem] p-8 sm:p-12 shadow-sm border flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 font-serif text-slate-900">Available Hotels</h1>
          <p className="text-slate-600 text-lg">Find your favorite restaurants delivering today.</p>
        </div>
        
        <form className="w-full md:w-[28rem] relative" action="/hotels">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            name="q"
            defaultValue={query}
            placeholder="Search hotels..." 
            className="w-full pl-12 pr-4 h-14 rounded-full bg-white border-slate-200 focus-visible:ring-[#d84f4b] shadow-sm text-base"
          />
        </form>
      </section>

      {/* GRID */}
      {hotels && hotels.length > 0 ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
          {hotels.map((hotel) => (
            <Link key={hotel.id} href={`/hotels/${hotel.id}`} className="group block h-full">
              <div className="overflow-hidden rounded-[1.5rem] bg-white border shadow-sm transition-all hover:shadow-md hover:-translate-y-1 h-full flex flex-col">
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden shrink-0">
                  {hotel.image_url ? (
                    <Image src={hotel.image_url} alt={hotel.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                      <MapPin className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-[#0ca667] shadow-sm flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0ca667] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0ca667]"></span>
                    </span>
                    Accepting Orders
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-xl group-hover:text-[#d84f4b] transition-colors mb-2 text-slate-900">{hotel.name}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1">
                    {hotel.description || 'Enjoy delicious meals delivered straight to you.'}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                    <span className="text-xs font-semibold text-slate-400">
                      {/* @ts-ignore */}
                      {hotel.foods[0]?.count || 0} items
                    </span>
                    <span className="text-sm font-bold text-[#d84f4b] flex items-center">
                      View Menu <ArrowRight className="ml-1 h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <section className="py-24 text-center bg-white rounded-[2rem] border shadow-sm mt-4">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 text-slate-300 mb-6">
            <Search className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-bold mb-3 text-slate-900">No hotels found</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8 text-lg">
            We couldn't find any active hotels matching your search. Try different keywords or check back later.
          </p>
          {query && (
            <Button asChild variant="outline" className="rounded-full px-8 h-12 text-slate-700">
              <Link href="/hotels">Clear Search</Link>
            </Button>
          )}
        </section>
      )}
    </div>
  )
}
