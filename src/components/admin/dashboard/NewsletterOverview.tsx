import React from 'react'
import type { Payload } from 'payload'
import Link from 'next/link'

export default async function NewsletterOverview({ payload }: { payload: Payload }) {
  const [
    totalSubscribers,
    activeSubscribers,
    pendingSubscribers,
    unsubscribed,
    sentDeliveries,
    failedDeliveries
  ] = await Promise.all([
    payload.count({ collection: 'subscribers' }),
    payload.count({ collection: 'subscribers', where: { status: { equals: 'active' } } }),
    payload.count({ collection: 'subscribers', where: { status: { equals: 'pending' } } }),
    payload.count({ collection: 'subscribers', where: { status: { equals: 'unsubscribed' } } }),
    payload.count({ collection: 'newsletter-deliveries', where: { status: { equals: 'sent' } } }),
    payload.count({ collection: 'newsletter-deliveries', where: { status: { equals: 'failed' } } }),
  ])

  return (
    <div className="sciconnect-widget">
      <div className="sciconnect-widget__header">
        <h2 className="sciconnect-widget__title">Newsletter</h2>
        <Link href="/admin/collections/subscribers" className="sciconnect-dashboard-section__link">
          Manage →
        </Link>
      </div>
      
      <div className="sciconnect-widget__content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--theme-elevation-150)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--theme-elevation-1000)', lineHeight: 1 }}>
            {totalSubscribers.totalDocs}
          </div>
          <div style={{ color: 'var(--theme-elevation-600)', fontSize: '0.85rem' }}>
            Total<br/>Subscribers
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
          <div>
            <div style={{ color: 'var(--theme-elevation-500)', marginBottom: '4px' }}>Active</div>
            <div style={{ fontWeight: 600, color: 'var(--theme-success-500, #10b981)' }}>{activeSubscribers.totalDocs}</div>
          </div>
          <div>
            <div style={{ color: 'var(--theme-elevation-500)', marginBottom: '4px' }}>Pending</div>
            <div style={{ fontWeight: 600, color: 'var(--theme-warning-500, #f59e0b)' }}>{pendingSubscribers.totalDocs}</div>
          </div>
          <div>
            <div style={{ color: 'var(--theme-elevation-500)', marginBottom: '4px' }}>Unsubscribed</div>
            <div style={{ fontWeight: 600, color: 'var(--theme-elevation-800)' }}>{unsubscribed.totalDocs}</div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--theme-elevation-150)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--theme-elevation-800)' }}>
            <strong>Deliveries:</strong> {sentDeliveries.totalDocs} sent, {failedDeliveries.totalDocs > 0 ? <span style={{ color: 'var(--theme-error-500, #ef4444)' }}>{failedDeliveries.totalDocs} failed</span> : '0 failed'}
          </div>
        </div>

      </div>
    </div>
  )
}
