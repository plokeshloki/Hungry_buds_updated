import { ReactNode } from 'react'
import { CustomerLayout } from '@/components/layout/CustomerLayout'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <CustomerLayout>
      {children}
    </CustomerLayout>
  )
}
