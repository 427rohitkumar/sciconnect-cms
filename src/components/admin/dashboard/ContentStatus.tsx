import React from 'react'
import type { Payload } from 'payload'

export default async function ContentStatus({ payload }: { payload: Payload }) {
  const [
    published,
    drafts,
  ] = await Promise.all([
    payload.count({ collection: 'articles', where: { _status: { equals: 'published' } } }),
    payload.count({ collection: 'articles', where: { _status: { equals: 'draft' } } }),
  ])

  const total = published.totalDocs + drafts.totalDocs
  const pubPct = total > 0 ? (published.totalDocs / total) * 100 : 0
  const draftPct = total > 0 ? (drafts.totalDocs / total) * 100 : 0

  return (
    <div className="sciconnect-widget">
      <div className="sciconnect-widget__header">
        <h2 className="sciconnect-widget__title">Content Status</h2>
      </div>
      
      <div className="sciconnect-widget__content" style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--theme-elevation-800)' }}>Published</span>
            <span style={{ fontWeight: 600 }}>{published.totalDocs}</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--theme-elevation-150)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${pubPct}%`, height: '100%', backgroundColor: 'var(--theme-success-500, #10b981)', borderRadius: '4px' }} />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--theme-elevation-800)' }}>Draft</span>
            <span style={{ fontWeight: 600 }}>{drafts.totalDocs}</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--theme-elevation-150)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${draftPct}%`, height: '100%', backgroundColor: 'var(--theme-warning-500, #f59e0b)', borderRadius: '4px' }} />
          </div>
        </div>

      </div>
    </div>
  )
}
