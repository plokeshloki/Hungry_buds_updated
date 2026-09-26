import { ReactNode } from 'react'
import { DeliveryLayout } from '@/components/layout/DeliveryLayout'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DeliveryLayout>
      {children}
    </DeliveryLayout>
  )
}
