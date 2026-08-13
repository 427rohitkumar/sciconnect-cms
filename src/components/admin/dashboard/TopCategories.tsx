import React from 'react'
import type { Payload } from 'payload'
import Link from 'next/link'

export default async function TopCategories({ payload }: { payload: Payload }) {
  // Fetch up to 100 recent articles to count categories
  const articlesRes = await payload.find({
    collection: 'articles',
    sort: '-createdAt',
    limit: 100,
    depth: 1, // Needed to get category names
  })

  const categoryCounts = new Map<string, { id: string, name: string, count: number }>()

  articlesRes.docs.forEach((doc: any) => {
    if (doc.categories && Array.isArray(doc.categories)) {
      doc.categories.forEach((cat: any) => {
        if (!cat || typeof cat !== 'object') return
        const id = cat.id
        if (categoryCounts.has(id)) {
          categoryCounts.get(id)!.count++
        } else {
          categoryCounts.set(id, { id, name: cat.name, count: 1 })
        }
      })
    }
  })

  // Sort by count descending and take top 5
  const topCategories = Array.from(categoryCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const maxCount = topCategories[0]?.count || 0

  return (
    <div className="sciconnect-widget">
      <div className="sciconnect-widget__header">
        <h2 className="sciconnect-widget__title">Trending Categories</h2>
        <Link href="/admin/collections/categories" className="sciconnect-dashboard-section__link">
          All categories →
        </Link>
      </div>
      
      <div className="sciconnect-widget__content">
        {topCategories.length === 0 ? (
          <div className="sciconnect-empty-state" style={{ padding: '16px' }}>
            <p style={{ fontSize: '0.85rem' }}>No categories assigned to recent articles.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topCategories.map(cat => {
              const widthPct = (cat.count / maxCount) * 100
              return (
                <div key={cat.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                    <Link href={`/admin/collections/articles?where[and][0][categories][in][0]=${cat.id}`} className="sciconnect-table__title-link">
                      {cat.name}
                    </Link>
                    <span style={{ color: 'var(--theme-elevation-600)' }}>{cat.count}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--theme-elevation-150)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${widthPct}%`, height: '100%', backgroundColor: 'var(--theme-primary-500, #3b82f6)', borderRadius: '3px' }} />
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
