import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)

async function verifyEmail() {
  const { data, error } = await supabase.auth.admin.updateUserById(
    '2e74ec87-c846-4cf3-aee6-2020bb2290e9',
    { email_confirm: true }
  )
  console.log("Verified:", error ? error : "Success")
}
verifyEmail()
