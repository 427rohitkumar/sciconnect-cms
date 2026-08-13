import React from 'react'
import type { Payload } from 'payload'
import Link from 'next/link'

export default async function RecentComments({ payload }: { payload: Payload }) {
  const commentsRes = await payload.find({
    collection: 'comments',
    where: {
      status: { in: ['pending', 'approved'] }
    },
    sort: '-createdAt',
    limit: 5,
    depth: 1, // Needed to get article title
  })

  return (
    <div className="sciconnect-widget">
      <div className="sciconnect-widget__header">
        <h2 className="sciconnect-widget__title">Recent Comments</h2>
        <Link href="/admin/collections/comments" className="sciconnect-dashboard-section__link">
          All comments →
        </Link>
      </div>
      
      <div className="sciconnect-widget__content">
        {commentsRes.docs.length === 0 ? (
          <div className="sciconnect-empty-state" style={{ padding: '16px' }}>
            <p style={{ fontSize: '0.85rem' }}>No comments found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {commentsRes.docs.map((doc: any) => {
              const articleTitle = doc.article?.title || 'Unknown Article'
              const timeAgo = doc.createdAt 
                ? new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : ''

              return (
                <div key={doc.id} style={{ display: 'flex', gap: '12px' }}>
                  {doc.avatarUrl ? (
                    <img src={doc.avatarUrl} alt={doc.initials} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--theme-elevation-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: 'var(--theme-elevation-800)' }}>
                      {doc.initials || 'U'}
                    </div>
                  )}
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                      <Link href={`/admin/collections/comments/${doc.id}`} className="sciconnect-table__title-link" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {doc.name}
                      </Link>
                      <span style={{ fontSize: '0.75rem', color: 'var(--theme-elevation-500)' }}>{timeAgo}</span>
                    </div>
                    
                    <div style={{ fontSize: '0.8rem', color: 'var(--theme-elevation-700)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      "{doc.content}"
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--theme-elevation-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                        on <i>{articleTitle}</i>
                      </span>
                      {doc.status === 'pending' && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--theme-warning-500, #f59e0b)', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
