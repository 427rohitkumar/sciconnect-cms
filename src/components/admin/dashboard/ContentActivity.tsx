import React from 'react'
import type { Payload } from 'payload'

export default async function ContentActivity({ payload }: { payload: Payload }) {
  // Fetch up to 100 recent articles to plot simple activity
  const articlesRes = await payload.find({
    collection: 'articles',
    where: { _status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 100,
    select: { publishedAt: true },
  })

  // Group by day for the last 30 days
  const days = 30
  const activityMap = new Map<string, number>()
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Initialize the last 30 days with 0
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    activityMap.set(d.toISOString().split('T')[0], 0)
  }

  // Populate actual data
  let maxCount = 0
  articlesRes.docs.forEach((doc: any) => {
    if (!doc.publishedAt) return
    const pubDate = new Date(doc.publishedAt)
    const dateKey = pubDate.toISOString().split('T')[0]
    if (activityMap.has(dateKey)) {
      const newCount = (activityMap.get(dateKey) || 0) + 1
      activityMap.set(dateKey, newCount)
      if (newCount > maxCount) maxCount = newCount
    }
  })

  const bars = Array.from(activityMap.entries())

  return (
    <div className="sciconnect-widget">
      <div className="sciconnect-widget__header">
        <h2 className="sciconnect-widget__title">Content Activity</h2>
        <div style={{ fontSize: '0.8rem', color: 'var(--theme-elevation-500)' }}>Last 30 Days</div>
      </div>
      
      <div className="sciconnect-widget__content" style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '160px', paddingTop: '20px' }}>
        {maxCount === 0 ? (
          <div className="sciconnect-empty-state" style={{ width: '100%' }}>
            <p>Not enough publishing activity to display a trend.</p>
          </div>
        ) : (
          bars.map(([dateKey, count], index) => {
            // Height percentage based on max
            const heightPct = maxCount > 0 ? (count / maxCount) * 100 : 0
            
            return (
              <div 
                key={dateKey} 
                style={{
                  flex: 1,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                }}
                className="group"
                title={`${dateKey}: ${count} published`}
              >
                <div style={{
                  width: '100%',
                  height: `${heightPct}%`,
                  minHeight: count > 0 ? '4px' : '0',
                  backgroundColor: count > 0 ? 'var(--theme-success-500, #10b981)' : 'transparent',
                  borderRadius: '2px 2px 0 0',
                  transition: 'opacity 0.2s ease',
                  opacity: 0.8
                }} className="hover:opacity-100" />
              </div>
            )
          })
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem', color: 'var(--theme-elevation-400)' }}>
        <span>{bars[0]?.[0]}</span>
        <span>Today</span>
      </div>
    </div>
  )
}
