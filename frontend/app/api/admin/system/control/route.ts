import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/roles'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const { authorized, user } = await isAdmin()

  if (!authorized || !user) {
    return NextResponse.json(
      { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { action, reason } = body

    const supabase = createAdminClient()

    // 1. Fetch current settings to log previous values
    const { data: currentSettings } = await supabase
      .from('system_settings')
      .select('*')
      .limit(1)
      .single()

    let updatePayload: any = { updated_by: user.id, updated_at: new Date().toISOString() }
    let logAction = ''
    let prevValue = null
    let newValue = null

    switch (action) {
      case 'PAUSE_ORDERS':
        updatePayload.manual_order_pause = true
        updatePayload.ordering_pause_reason = reason || 'Admin manually paused'
        logAction = 'ORDERING_PAUSED'
        prevValue = currentSettings?.manual_order_pause
        newValue = true
        break
      case 'RESUME_ORDERS':
        updatePayload.manual_order_pause = false
        updatePayload.ordering_pause_reason = null
        logAction = 'ORDERING_RESUMED'
        prevValue = currentSettings?.manual_order_pause
        newValue = false
        break
      case 'DISABLE_PAYMENTS':
        updatePayload.payments_enabled = false
        logAction = 'PAYMENTS_DISABLED'
        prevValue = currentSettings?.payments_enabled
        newValue = false
        break
      case 'ENABLE_PAYMENTS':
        updatePayload.payments_enabled = true
        logAction = 'PAYMENTS_ENABLED'
        prevValue = currentSettings?.payments_enabled
        newValue = true
        break
      case 'ENABLE_MAINTENANCE':
        updatePayload.maintenance_mode = true
        updatePayload.maintenance_message = reason || 'System is under maintenance.'
        logAction = 'MAINTENANCE_ENABLED'
        prevValue = currentSettings?.maintenance_mode
        newValue = true
        break
      case 'DISABLE_MAINTENANCE':
        updatePayload.maintenance_mode = false
        updatePayload.maintenance_message = null
        logAction = 'MAINTENANCE_DISABLED'
        prevValue = currentSettings?.maintenance_mode
        newValue = false
        break
      case 'DISABLE_WEBSITE':
        updatePayload.website_enabled = false
        logAction = 'WEBSITE_DISABLED'
        prevValue = currentSettings?.website_enabled
        newValue = false
        break
      case 'ENABLE_WEBSITE':
        updatePayload.website_enabled = true
        logAction = 'WEBSITE_ENABLED'
        prevValue = currentSettings?.website_enabled
        newValue = true
        break
      default:
        return NextResponse.json(
          { success: false, error: { message: 'Invalid action', code: 'INVALID_ACTION' } },
          { status: 400 }
        )
    }

    // 2. Update System Settings
    // Since there's only one row, we can just update all rows (or limit if we had an ID).
    // Let's assume there's only 1 row or update based on the ID we fetched.
    if (currentSettings) {
      const { error: updateError } = await supabase
        .from('system_settings')
        .update(updatePayload)
        .eq('id', currentSettings.id)

      if (updateError) throw updateError
    } else {
      // Fallback if settings row was somehow deleted
      const { error: insertError } = await supabase
        .from('system_settings')
        .insert(updatePayload)

      if (insertError) throw insertError
    }

    // 3. Create Audit Log
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: logAction,
      entity_type: 'SYSTEM_SETTINGS',
      details: {
        reason,
        previous_value: prevValue,
        new_value: newValue
      }
    })

    return NextResponse.json({ success: true, data: { action: logAction, updated: true } })

  } catch (error: any) {
    console.error('Control API Error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Failed to execute control action', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    )
  }
}
