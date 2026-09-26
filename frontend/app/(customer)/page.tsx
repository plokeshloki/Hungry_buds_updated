import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Clock, ShieldCheck, MapPin, Search } from "lucide-react"
import { APP_CONFIG } from "@/lib/constants"

export default async function Home() {
  const supabase = await createClient()

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

  // Fetch ordering status from system settings (if exists, else mock OPEN for now)
  const isOrderingOpen = true; 

  return (
    <div className="flex flex-col gap-16 pb-16">
      
      {/* SECTION 1: HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-primary/5 px-6 py-24 sm:px-12 sm:py-32 lg:px-16 flex flex-col items-center text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-primary/0 to-transparent"></div>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl mb-6">
          Good food, delivered to your hostel.
        </h1>
        <p className="max-w-xl text-lg text-slate-600 mb-10">
          Order from your favourite local hotels and get your meal without leaving campus. Fast, fresh, and reliable.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link href="/hotels">Browse Food <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-8 bg-white/50 backdrop-blur-sm">
            <Link href="/orders">View Orders</Link>
          </Button>
        </div>
      </section>

      {/* SECTION 2: ORDERING STATUS */}
      <section className="mx-auto w-full max-w-4xl">
        <Card className="border-none shadow-md bg-gradient-to-r from-emerald-500 to-emerald-600 text-white overflow-hidden">
          <CardContent className="p-6 sm:p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Orders are OPEN</h3>
                <p className="text-emerald-50 font-medium">Order before 8:00 PM for dinner delivery.</p>
              </div>
            </div>
            <Button variant="secondary" className="hidden sm:flex rounded-full text-emerald-700 hover:text-emerald-800">
              Order Now
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* SECTION 3: HOTEL DISCOVERY */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Choose a hotel</h2>
            <p className="text-muted-foreground mt-1">Discover popular restaurants delivering to campus.</p>
          </div>
          <Button variant="ghost" asChild className="hidden sm:flex">
            <Link href="/hotels">See all <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hotels?.map((hotel) => (
            <Link key={hotel.id} href={`/hotels/${hotel.id}`} className="group block">
              <Card className="overflow-hidden border-none shadow-sm transition-all hover:shadow-md h-full">
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                  {hotel.image_url ? (
                    <Image src={hotel.image_url} alt={hotel.name} fill className="object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                      <MapPin className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
                    Open
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{hotel.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{hotel.description || 'Delicious food from ' + hotel.name}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
          {(!hotels || hotels.length === 0) && (
            <div className="col-span-3 text-center py-12 text-muted-foreground border border-dashed rounded-xl">
              No hotels available right now.
            </div>
          )}
        </div>
      </section>

      {/* SECTION 4: POPULAR FOOD */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Popular dishes</h2>
            <p className="text-muted-foreground mt-1">What students are loving right now.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {foods?.map((food) => (
            <Card key={food.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-square bg-slate-100 relative">
                {food.image_url ? (
                  <Image src={food.image_url} alt={food.name} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                    <Search className="h-8 w-8" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="text-xs font-medium text-muted-foreground mb-1 truncate">
                  {/* @ts-ignore */}
                  {food.hotels?.name}
                </div>
                <h3 className="font-bold mb-2 truncate" title={food.name}>{food.name}</h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="font-bold text-lg">₹{food.price}</span>
                  <Button size="sm" className="rounded-full h-8 px-4 text-xs font-bold" asChild>
                    <Link href={`/hotels/${food.hotel_id}`}>Add</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* SECTION 5: HOW IT WORKS */}
      <section className="py-12 border-t">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center max-w-5xl mx-auto">
          {[
            { step: '1', title: 'Choose your hotel', desc: 'Browse available restaurants near your campus.' },
            { step: '2', title: 'Add your food', desc: 'Select your favorite dishes and add them to cart.' },
            { step: '3', title: 'Pay securely', desc: 'Checkout safely using our integrated payment system.' },
            { step: '4', title: 'Collect your order', desc: 'Show your secure delivery code to collect.' },
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary mb-6 shadow-sm">
                {s.step}
              </div>
              <h3 className="font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: TRUST */}
      <section className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-center text-white">
        <ShieldCheck className="h-16 w-16 mx-auto mb-6 text-emerald-400" />
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Secure & Verified Orders</h2>
        <p className="max-w-2xl mx-auto text-slate-300 text-lg">
          We use unique delivery codes for every order. Your food is securely handed over only to you, ensuring a safe and reliable campus delivery experience.
        </p>
      </section>

    </div>
  )
}
