import React from 'react'
import type { Payload } from 'payload'
import Link from 'next/link'

export default async function SEOHealth({ payload }: { payload: Payload }) {
  const [totalArticles, missingSEO] = await Promise.all([
    payload.count({ collection: 'articles', where: { _status: { equals: 'published' } } }),
    payload.count({ 
      collection: 'articles', 
      where: { 
        and: [
          { _status: { equals: 'published' } },
          {
            or: [
              { 'seo.metaTitle': { exists: false } },
              { 'seo.metaDescription': { exists: false } },
              { 'seo.ogImage': { exists: false } }
            ]
          }
        ]
      } 
    })
  ])

  const total = totalArticles.totalDocs
  const missing = missingSEO.totalDocs
  const healthy = total - missing
  const healthPct = total > 0 ? Math.round((healthy / total) * 100) : 100

  return (
    <div className="sciconnect-widget">
      <div className="sciconnect-widget__header">
        <h2 className="sciconnect-widget__title">SEO Health</h2>
      </div>
      
      <div className="sciconnect-widget__content" style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: healthPct > 80 ? 'var(--theme-success-500, #10b981)' : 'var(--theme-warning-500, #f59e0b)', lineHeight: 1 }}>
            {healthPct}%
          </div>
          <div style={{ color: 'var(--theme-elevation-600)', fontSize: '0.85rem' }}>
            Optimization<br/>Score
          </div>
        </div>

        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--theme-elevation-150)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${healthPct}%`, height: '100%', backgroundColor: healthPct > 80 ? 'var(--theme-success-500, #10b981)' : 'var(--theme-warning-500, #f59e0b)', borderRadius: '4px' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--theme-elevation-800)' }}>
            <span>SEO Ready</span>
            <span style={{ fontWeight: 600 }}>{healthy}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: missing > 0 ? 'var(--theme-error-500, #ef4444)' : 'var(--theme-elevation-800)' }}>
            <span>Needs Attention</span>
            <span style={{ fontWeight: 600 }}>{missing}</span>
          </div>
        </div>

        {missing > 0 && (
          <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
            <Link href="/admin/collections/articles" className="sciconnect-dashboard-section__link">
              View issues →
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
