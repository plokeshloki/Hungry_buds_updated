'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SystemHealthPage() {
  const [healthData, setHealthData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const router = useRouter()

  const fetchHealth = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/system/health')
      const data = await res.json()
      if (data.success) {
        setHealthData(data.data)
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchHealth()
  }, [])

  const handleAction = async (action: string, confirmMessage: string) => {
    if (!confirm(confirmMessage)) return

    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/system/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason: 'Admin UI manual action' })
      })
      const data = await res.json()
      if (data.success) {
        await fetchHealth()
        router.refresh()
      } else {
        alert('Action failed: ' + data.error?.message)
      }
    } catch (e) {
      alert('Network error')
    }
    setActionLoading(false)
  }

  const getStatusIcon = (status: string) => {
    if (status === 'OPERATIONAL') return '🟢'
    if (status === 'DEGRADED') return '🟡'
    if (status === 'UNAVAILABLE') return '🔴'
    return '⚪'
  }

  if (loading) return <div className="p-8">Loading System Health...</div>
  if (!healthData) return <div className="p-8 text-red-500">Failed to load system health.</div>

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-8">System Health & Emergency Control</h1>

      {/* SYSTEM HEALTH DASHBOARD */}
      <section className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">SYSTEM HEALTH</h2>
          <button 
            onClick={fetchHealth}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            CHECK NOW
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between p-3 border rounded">
            <span>Application</span>
            <span>{getStatusIcon(healthData.application.status)} {healthData.application.status}</span>
          </div>
          <div className="flex justify-between p-3 border rounded">
            <span>Overall Supabase</span>
            <span>{getStatusIcon(healthData.supabase.status)} {healthData.supabase.status}</span>
          </div>
          <div className="flex justify-between p-3 border rounded">
            <span>Database</span>
            <span>{getStatusIcon(healthData.supabase.database)} {healthData.supabase.database}</span>
          </div>
          <div className="flex justify-between p-3 border rounded">
            <span>Storage</span>
            <span>{getStatusIcon(healthData.supabase.storage)} {healthData.supabase.storage}</span>
          </div>
          <div className="flex justify-between p-3 border rounded">
            <span>Razorpay</span>
            <span>{getStatusIcon(healthData.razorpay.status)} {healthData.razorpay.status}</span>
          </div>
          <div className="flex justify-between p-3 border rounded">
            <span>Webhook</span>
            <span>{getStatusIcon(healthData.webhook.status)} {healthData.webhook.status}</span>
          </div>
          <div className="flex justify-between p-3 border rounded">
            <span>Ordering</span>
            <span>{getStatusIcon(healthData.ordering.status)} {healthData.ordering.enabled ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div className="flex justify-between p-3 border rounded">
            <span>Payments</span>
            <span>{getStatusIcon(healthData.payments.status)} {healthData.payments.enabled ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Last checked: {new Date(healthData.checkedAt).toLocaleString()}
        </p>
      </section>

      {/* EMERGENCY CONTROLS */}
      <section className="bg-red-50 p-6 rounded-lg shadow border border-red-200">
        <h2 className="text-xl font-semibold text-red-700 mb-6">EMERGENCY CONTROLS</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-4 rounded shadow-sm border border-red-100">
            <h3 className="font-medium text-gray-700 mb-2">Ordering</h3>
            <p className="mb-4">{healthData.ordering.enabled ? '🟢 ENABLED' : '🔴 PAUSED'}</p>
            {healthData.ordering.enabled ? (
              <button 
                disabled={actionLoading}
                onClick={() => handleAction('PAUSE_ORDERS', 'Pause new orders? This will prevent customers from placing new orders. Existing orders will not be affected.')}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                PAUSE ORDERS
              </button>
            ) : (
              <button 
                disabled={actionLoading}
                onClick={() => handleAction('RESUME_ORDERS', 'Resume ordering?')}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                RESUME ORDERS
              </button>
            )}
          </div>

          <div className="bg-white p-4 rounded shadow-sm border border-red-100">
            <h3 className="font-medium text-gray-700 mb-2">Payments</h3>
            <p className="mb-4">{healthData.payments.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}</p>
            {healthData.payments.enabled ? (
              <button 
                disabled={actionLoading}
                onClick={() => handleAction('DISABLE_PAYMENTS', 'Disable payments? Customers will not be able to checkout.')}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
              >
                DISABLE PAYMENTS
              </button>
            ) : (
              <button 
                disabled={actionLoading}
                onClick={() => handleAction('ENABLE_PAYMENTS', 'Enable payments?')}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                ENABLE PAYMENTS
              </button>
            )}
          </div>

          <div className="bg-white p-4 rounded shadow-sm border border-red-100">
            <h3 className="font-medium text-gray-700 mb-2">Maintenance Mode</h3>
            <p className="mb-4">{healthData.application.maintenanceMode ? '🔴 ACTIVE' : '⚪ DISABLED'}</p>
            {!healthData.application.maintenanceMode ? (
              <button 
                disabled={actionLoading}
                onClick={() => handleAction('ENABLE_MAINTENANCE', 'Enable Maintenance Mode? This will redirect all customers to a maintenance screen.')}
                className="w-full px-4 py-2 bg-red-800 text-white rounded hover:bg-red-900 disabled:opacity-50"
              >
                ENABLE MAINTENANCE
              </button>
            ) : (
              <button 
                disabled={actionLoading}
                onClick={() => handleAction('DISABLE_MAINTENANCE', 'Disable Maintenance Mode?')}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
              >
                DISABLE MAINTENANCE
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
