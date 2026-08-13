import React from 'react'
import type { Payload } from 'payload'

export default async function EngagementKPIs({ payload }: { payload: Payload }) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const dateStr = thirtyDaysAgo.toISOString()

  const [
    totalSubscribers,
    recentSubscribers,
    activeSubscribers,
    pendingComments,
    approvedComments,
    sentNewsletters
  ] = await Promise.all([
    payload.count({ collection: 'subscribers' }),
    payload.count({ collection: 'subscribers', where: { createdAt: { greater_than_equal: dateStr } } }),
    payload.count({ collection: 'subscribers', where: { status: { equals: 'active' } } }),
    payload.count({ collection: 'comments', where: { status: { equals: 'pending' } } }),
    payload.count({ collection: 'comments', where: { status: { equals: 'approved' } } }),
    payload.count({ collection: 'newsletter-deliveries', where: { status: { equals: 'sent' } } }),
  ])

  return (
    <div className="sciconnect-grid-row sciconnect-grid-row--6">
      <div className="sciconnect-kpi-card">
        <div className="sciconnect-kpi-card__header">
          <span className="sciconnect-kpi-card__icon">👥</span>
          Subscribers
        </div>
        <div className="sciconnect-kpi-card__value">{totalSubscribers.totalDocs}</div>
        <div className="sciconnect-kpi-card__meta">
          {recentSubscribers.totalDocs > 0 ? `${recentSubscribers.totalDocs} new this month` : '0 new this month'}
        </div>
      </div>

      <div className="sciconnect-kpi-card">
        <div className="sciconnect-kpi-card__header">
          <span className="sciconnect-kpi-card__icon">🔥</span>
          Active Subscribers
        </div>
        <div className="sciconnect-kpi-card__value">{activeSubscribers.totalDocs}</div>
        <div className="sciconnect-kpi-card__meta">Verified emails</div>
      </div>

      <div className="sciconnect-kpi-card">
        <div className="sciconnect-kpi-card__header">
          <span className="sciconnect-kpi-card__icon">💬</span>
          Pending Comments
        </div>
        <div className="sciconnect-kpi-card__value" style={{ color: pendingComments.totalDocs > 0 ? 'var(--theme-error-500, #ef4444)' : 'inherit' }}>
          {pendingComments.totalDocs}
        </div>
        <div className="sciconnect-kpi-card__meta">
          {pendingComments.totalDocs > 0 ? 'Needs attention' : 'All caught up'}
        </div>
      </div>

      <div className="sciconnect-kpi-card">
        <div className="sciconnect-kpi-card__header">
          <span className="sciconnect-kpi-card__icon">✔️</span>
          Approved Comments
        </div>
        <div className="sciconnect-kpi-card__value">{approvedComments.totalDocs}</div>
        <div className="sciconnect-kpi-card__meta">Live discussions</div>
      </div>

      <div className="sciconnect-kpi-card">
        <div className="sciconnect-kpi-card__header">
          <span className="sciconnect-kpi-card__icon">✉️</span>
          Newsletter Sent
        </div>
        <div className="sciconnect-kpi-card__value">{sentNewsletters.totalDocs}</div>
        <div className="sciconnect-kpi-card__meta">Total deliveries</div>
      </div>
      
      {/* Empty block to fill 6-col grid perfectly or add another metric */}
      <div className="sciconnect-kpi-card" style={{ opacity: 0.5 }}>
        <div className="sciconnect-kpi-card__header">
          <span className="sciconnect-kpi-card__icon">🚀</span>
          More Analytics
        </div>
        <div className="sciconnect-kpi-card__value">-</div>
        <div className="sciconnect-kpi-card__meta">Check Data Studio App</div>
      </div>
    </div>
  )
}
