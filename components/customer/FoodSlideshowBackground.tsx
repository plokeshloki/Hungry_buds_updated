'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const FOOD_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1920&auto=format&fit=crop',
    alt: 'Royal Biryani & Spiced Curries',
  },
  {
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1920&auto=format&fit=crop',
    alt: 'Crispy Gourmet Burgers & Fries',
  },
  {
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1920&auto=format&fit=crop',
    alt: 'Fresh Stonebaked Pizza',
  },
  {
    url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=1920&auto=format&fit=crop',
    alt: 'Crispy Golden Masala Dosa',
  },
  {
    url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=1920&auto=format&fit=crop',
    alt: 'Sizzling Asian Noodle Bowl',
  },
]

export function FoodSlideshowBackground() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FOOD_SLIDES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none">
      {FOOD_SLIDES.map((slide, index) => {
        const isActive = index === currentIndex
        return (
          <div
            key={slide.url}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            } transition-transform duration-7000`}
          >
            <Image
              src={slide.url}
              alt={slide.alt}
              fill
              priority={index === 0}
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
        )
      })}

      {/* Aesthetic Overlay to ensure text readability and glassmorphic depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/92 to-[#f8f9fa] backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50/40 via-transparent to-red-50/30 opacity-70" />
    </div>
  )
}
