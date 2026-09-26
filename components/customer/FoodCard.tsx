'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Food {
  id: string
  hotel_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
}

interface FoodCardProps {
  food: Food
  hotelName: string
}

export function FoodCard({ food, hotelName }: FoodCardProps) {
  const { items, addItem, clearCart } = useCartStore()
  const [showWarning, setShowWarning] = useState(false)

  const handleAdd = () => {
    if (!food.is_available) return

    const existingHotelId = items.length > 0 ? items[0].hotel_id : null
    
    if (existingHotelId && existingHotelId !== food.hotel_id) {
      setShowWarning(true)
      return
    }

    addToCart()
  }

  const addToCart = () => {
    addItem({
      id: food.id,
      hotel_id: food.hotel_id,
      hotel_name: hotelName,
      name: food.name,
      price: food.price,
      quantity: 1,
      image_url: food.image_url || undefined
    })
    toast.success(`Added ${food.name} to cart`)
  }

  const handleClearAndAdd = () => {
    clearCart()
    addToCart()
    setShowWarning(false)
  }

  return (
    <>
      <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
        <div className="aspect-[4/3] bg-slate-100 relative shrink-0">
          {food.image_url ? (
            <Image src={food.image_url} alt={food.name} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-300">
              <Search className="h-8 w-8" />
            </div>
          )}
          {!food.is_available && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
              <div className="bg-black text-white px-3 py-1 font-bold text-sm rounded-sm">
                SOLD OUT
              </div>
            </div>
          )}
        </div>
        <CardContent className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-lg mb-1">{food.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 flex-1 mb-4">
            {food.description}
          </p>
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
            <span className="font-bold text-xl">₹{food.price}</span>
            <Button 
              size="sm" 
              className="rounded-full px-4 h-9" 
              disabled={!food.is_available}
              onClick={handleAdd}
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start a new order?</AlertDialogTitle>
            <AlertDialogDescription>
              Your cart contains items from another hotel. Clear your existing cart and add this item?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAndAdd} className="bg-primary">
              Clear Cart & Add
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
