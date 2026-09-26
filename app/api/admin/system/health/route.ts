import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/roles'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const { authorized } = await isAdmin()

  if (!authorized) {
    return NextResponse.json(
      { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 403 }
    )
  }

  // Use Admin client for safe backend health checks that bypass RLS where necessary, 
  // although standard client could be used for simple DB ping.
  const supabase = createAdminClient()

  // 1. Check Database Health (minimal query)
  let dbStatus = 'UNAVAILABLE'
  try {
    const { error } = await supabase.from('system_settings').select('id').limit(1)
    if (!error) {
      dbStatus = 'OPERATIONAL'
    } else {
      console.error('DB Health check error:', error)
      dbStatus = 'DEGRADED' // Or unavailable based on error
    }
  } catch (err) {
    dbStatus = 'UNAVAILABLE'
  }

  // 2. Check Auth Configuration (minimal query)
  let authStatus = 'UNAVAILABLE'
  try {
    const { error } = await supabase.auth.admin.listUsers({ perPage: 1 })
    if (!error) {
      authStatus = 'OPERATIONAL'
    } else {
      authStatus = 'DEGRADED'
    }
  } catch (err) {
    authStatus = 'UNAVAILABLE'
  }

  // 3. Check Storage Configuration
  let storageStatus = 'UNAVAILABLE'
  try {
    const { error } = await supabase.storage.listBuckets()
    if (!error) {
      storageStatus = 'OPERATIONAL'
    } else {
      storageStatus = 'DEGRADED'
    }
  } catch (err) {
    storageStatus = 'UNAVAILABLE'
  }

  // Overall Supabase Status
  const supabaseStatus = 
    [dbStatus, authStatus, storageStatus].every(s => s === 'OPERATIONAL') 
      ? 'OPERATIONAL' 
      : 'DEGRADED'

  // 4. Check Razorpay Configuration
  const rzpKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  const rzpSecret = process.env.RAZORPAY_KEY_SECRET
  const rzpWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

  const isRzpConfigured = !!(rzpKeyId && rzpSecret)
  const isRzpWebhookConfigured = !!rzpWebhookSecret

  // In a real scenario, you could safely ping a Razorpay API endpoint without creating an order
  // For now, if keys exist, we'll mark as OPERATIONAL but note it's mostly a config check
  const razorpayStatus = isRzpConfigured ? 'OPERATIONAL' : 'NOT_CONFIGURED'

  // 5. Check System Settings (Ordering/Payments flags)
  let orderingEnabled = false
  let paymentsEnabled = false
  let maintenanceMode = false

  try {
    const { data } = await supabase.from('system_settings').select('*').limit(1).single()
    if (data) {
      orderingEnabled = data.ordering_enabled && !data.manual_order_pause
      paymentsEnabled = data.payments_enabled
      maintenanceMode = data.maintenance_mode
    }
  } catch (e) {
    // Ignore, defaults remain
  }

  // 6. Webhook Status (mocked/basic for now unless we track in DB)
  // To track webhook health, we would query the `audit_logs` or a dedicated webhook log table.
  const webhookStatus = isRzpWebhookConfigured ? 'OPERATIONAL' : 'NOT_CONFIGURED'

  const overallStatus = 
    (dbStatus === 'OPERATIONAL' && razorpayStatus === 'OPERATIONAL') 
    ? 'OPERATIONAL' 
    : 'DEGRADED'

  return NextResponse.json({
    success: true,
    data: {
      application: {
        status: 'OPERATIONAL', // Since the API is responding
        maintenanceMode
      },
      supabase: {
        status: supabaseStatus,
        database: dbStatus,
        auth: authStatus,
        storage: storageStatus
      },
      razorpay: {
        status: razorpayStatus,
        configured: isRzpConfigured,
        environment: rzpKeyId?.startsWith('rzp_test_') ? 'test' : 'live'
      },
      webhook: {
        status: webhookStatus,
        configured: isRzpWebhookConfigured
      },
      ordering: {
        status: orderingEnabled ? 'OPERATIONAL' : 'UNAVAILABLE',
        enabled: orderingEnabled
      },
      payments: {
        status: paymentsEnabled ? 'OPERATIONAL' : 'UNAVAILABLE',
        enabled: paymentsEnabled
      },
      overall: {
        status: overallStatus
      },
      checkedAt: new Date().toISOString()
    }
  })
}
