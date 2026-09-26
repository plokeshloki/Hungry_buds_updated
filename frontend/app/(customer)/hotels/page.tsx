import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, MapPin, ArrowRight } from "lucide-react"

export const metadata = {
  title: 'Hotels | HostelBites',
  description: 'Browse all available hotels delivering to your hostel.',
}

export default async function HotelsPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams
  const query = searchParams?.q || ''
  const supabase = await createClient()

  let dbQuery = supabase
    .from('hotels')
    .select('*, foods(count)')
    .eq('is_active', true)
    
  if (query) {
    dbQuery = dbQuery.ilike('name', `%${query}%`)
  }

  const { data: hotels } = await dbQuery.order('name')

  return (
    <div className="flex flex-col gap-8 pb-16">
      
      {/* HEADER & SEARCH */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Available Hotels</h1>
          <p className="text-muted-foreground">Find your favorite restaurants delivering today.</p>
        </div>
        
        <form className="w-full md:w-96 relative" action="/hotels">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            name="q"
            defaultValue={query}
            placeholder="Search hotels..." 
            className="w-full pl-10 pr-4 h-12 rounded-full bg-slate-50 border-slate-200 focus-visible:ring-primary"
          />
        </form>
      </section>

      {/* GRID */}
      {hotels && hotels.length > 0 ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {hotels.map((hotel) => (
            <Link key={hotel.id} href={`/hotels/${hotel.id}`} className="group block h-full">
              <Card className="overflow-hidden border-none shadow-sm transition-all hover:shadow-md h-full flex flex-col">
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden shrink-0">
                  {hotel.image_url ? (
                    <Image src={hotel.image_url} alt={hotel.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                      <MapPin className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    Accepting Orders
                  </div>
                </div>
                <CardContent className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-xl group-hover:text-primary transition-colors mb-2">{hotel.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {hotel.description || 'Enjoy delicious meals delivered straight to you.'}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                    <span className="text-xs font-semibold text-slate-500">
                      {/* @ts-ignore */}
                      {hotel.foods[0]?.count || 0} items
                    </span>
                    <span className="text-sm font-bold text-primary flex items-center">
                      View Menu <ArrowRight className="ml-1 h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      ) : (
        <section className="py-24 text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-6">
            <Search className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No hotels found</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            We couldn't find any active hotels matching your search. Try different keywords or check back later.
          </p>
          {query && (
            <Button asChild variant="outline">
              <Link href="/hotels">Clear Search</Link>
            </Button>
          )}
        </section>
      )}
    </div>
  )
}
