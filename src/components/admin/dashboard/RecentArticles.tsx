import React from 'react'
import type { Payload } from 'payload'
import Link from 'next/link'

export default async function RecentArticles({ payload }: { payload: Payload }) {
  const articlesRes = await payload.find({
    collection: 'articles',
    sort: '-updatedAt',
    limit: 5,
    depth: 1, // To get author name and category names
  })

  return (
    <div className="sciconnect-dashboard-section" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="sciconnect-dashboard-section__header" style={{ padding: '20px 24px 0 24px' }}>
        <h2 className="sciconnect-dashboard-section__title">Recent Articles</h2>
        <Link href="/admin/collections/articles" className="sciconnect-dashboard-section__link">
          View all →
        </Link>
      </div>

      <div className="sciconnect-table-wrapper" style={{ padding: '0 24px 20px 24px' }}>
        {articlesRes.docs.length === 0 ? (
          <div className="sciconnect-empty-state">
            <p>No articles found. Start writing your first piece!</p>
            <Link href="/admin/collections/articles/create" className="sciconnect-btn sciconnect-btn--primary">
              Create Article
            </Link>
          </div>
        ) : (
          <table className="sciconnect-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Author</th>
                <th>Category</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {articlesRes.docs.map((doc: any) => {
                const authorName = doc.author?.name || 'Unknown'
                const primaryCategory = doc.categories?.[0]?.name || 'Uncategorized'
                const statusBadge = doc._status === 'published' 
                  ? 'sciconnect-badge--published' 
                  : 'sciconnect-badge--draft'

                const dateStr = doc.updatedAt 
                  ? new Date(doc.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'Unknown'

                return (
                  <tr key={doc.id}>
                    <td style={{ maxWidth: '300px' }}>
                      <Link href={`/admin/collections/articles/${doc.id}`} className="sciconnect-table__title-link" style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.title || 'Untitled Article'}
                      </Link>
                    </td>
                    <td>
                      <span className={`sciconnect-badge ${statusBadge}`}>
                        {doc._status || 'draft'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--theme-elevation-600)' }}>{authorName}</td>
                    <td style={{ color: 'var(--theme-elevation-600)' }}>{primaryCategory}</td>
                    <td className="sciconnect-table__date">{dateStr}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
