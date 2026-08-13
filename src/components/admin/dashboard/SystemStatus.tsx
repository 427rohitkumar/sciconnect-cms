import React from 'react'
import type { Payload } from 'payload'
import Link from 'next/link'

export default async function SystemStatus({ payload }: { payload: Payload }) {
  // Simple check: fetch site settings to see if it's accessible
  let dbConnected = false
  try {
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
    dbConnected = !!settings
  } catch (e) {
    dbConnected = false
  }

  // Next auth email configured? We can't safely read env vars in the browser, but since this is a Server Component, we can.
  const emailConfigured = !!process.env.RESEND_API_KEY
  const analyticsConfigured = true // Controlled by Data Studio app

  return (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '0.8rem', padding: '16px 24px', backgroundColor: 'var(--theme-elevation-50)', border: '1px solid var(--theme-elevation-200)', borderRadius: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: 'var(--theme-success-500, #10b981)' }}>●</span>
        <span style={{ color: 'var(--theme-elevation-600)' }}>CMS:</span>
        <span style={{ fontWeight: 600 }}>Operational</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: dbConnected ? 'var(--theme-success-500, #10b981)' : 'var(--theme-error-500, #ef4444)' }}>●</span>
        <span style={{ color: 'var(--theme-elevation-600)' }}>Database:</span>
        <span style={{ fontWeight: 600 }}>{dbConnected ? 'Connected' : 'Disconnected'}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: emailConfigured ? 'var(--theme-success-500, #10b981)' : 'var(--theme-warning-500, #f59e0b)' }}>●</span>
        <span style={{ color: 'var(--theme-elevation-600)' }}>Email:</span>
        <span style={{ fontWeight: 600 }}>{emailConfigured ? 'Configured' : 'Not configured'}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
        <Link href="/admin/apps/analytics" style={{ color: 'var(--theme-elevation-600)', textDecoration: 'none' }}>
          Open Analytics ↗
        </Link>
      </div>
    </div>
  )
}
