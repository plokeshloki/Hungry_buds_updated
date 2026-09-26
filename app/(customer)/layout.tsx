import { ReactNode } from 'react'
import { CustomerLayout } from '@/components/layout/CustomerLayout'
import { createClient } from '@/lib/supabase/server'

export default async function Layout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <CustomerLayout user={user}>
      {children}
    </CustomerLayout>
  )
}

