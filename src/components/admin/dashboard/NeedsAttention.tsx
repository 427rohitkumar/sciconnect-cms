import React from 'react'
import type { Payload } from 'payload'
import Link from 'next/link'

export default async function NeedsAttention({ payload }: { payload: Payload }) {
  const [
    pendingComments,
    failedNewsletters,
    missingSEOArticles,
  ] = await Promise.all([
    payload.count({ collection: 'comments', where: { status: { equals: 'pending' } } }),
    payload.count({ collection: 'newsletter-deliveries', where: { status: { equals: 'failed' } } }),
    payload.count({ 
      collection: 'articles', 
      where: { 
        or: [
          { 'seo.metaTitle': { exists: false } },
          { 'seo.metaDescription': { exists: false } }
        ] 
      } 
    })
  ])

  const issues = []

  if (pendingComments.totalDocs > 0) {
    issues.push({
      id: 'comments',
      text: `${pendingComments.totalDocs} comments awaiting moderation`,
      link: '/admin/collections/comments?where[or][0][and][0][status][equals]=pending',
      action: 'Review'
    })
  }

  if (failedNewsletters.totalDocs > 0) {
    issues.push({
      id: 'newsletters',
      text: `${failedNewsletters.totalDocs} newsletter deliveries failed`,
      link: '/admin/collections/newsletter-deliveries?where[or][0][and][0][status][equals]=failed',
      action: 'View'
    })
  }

  if (missingSEOArticles.totalDocs > 0) {
    issues.push({
      id: 'seo',
      text: `${missingSEOArticles.totalDocs} articles missing SEO metadata`,
      link: '/admin/collections/articles',
      action: 'Fix'
    })
  }

  return (
    <div className="sciconnect-dashboard-section" style={{ borderLeft: issues.length > 0 ? '4px solid var(--theme-error-500, #ef4444)' : '1px solid var(--theme-elevation-200)' }}>
      <div className="sciconnect-dashboard-section__header">
        <h2 className="sciconnect-dashboard-section__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {issues.length > 0 ? '⚠️ Needs Attention' : 'Needs Attention'}
        </h2>
      </div>
      
      {issues.length === 0 ? (
        <div style={{ color: 'var(--theme-success-500, #10b981)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
          <span>✓</span> Everything looks good
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {issues.map(issue => (
            <div key={issue.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--theme-error-50, rgba(239, 68, 68, 0.05))', borderRadius: '6px', border: '1px solid var(--theme-error-100, rgba(239, 68, 68, 0.1))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--theme-elevation-800)' }}>
                <span style={{ color: 'var(--theme-error-500, #ef4444)' }}>⚠</span>
                {issue.text}
              </div>
              <Link href={issue.link} className="sciconnect-btn sciconnect-btn--secondary" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                {issue.action}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
