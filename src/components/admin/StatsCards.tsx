import React from 'react'
import type { Payload } from 'payload'
import StatCard from './StatCard'

interface StatsCardsProps {
  payload: Payload
}

export const StatsCards: React.FC<StatsCardsProps> = async ({ payload }) => {
  const [
    { totalDocs: totalArticles },
    { totalDocs: publishedArticles },
    { totalDocs: draftArticles },
    { totalDocs: totalCategories },
    { totalDocs: totalTags },
    { totalDocs: totalMedia },
    { totalDocs: totalUsers },
    { totalDocs: totalAuthors },
  ] = await Promise.all([
    payload.count({ collection: 'articles' }),
    payload.count({ collection: 'articles', where: { _status: { equals: 'published' } } }),
    payload.count({ collection: 'articles', where: { _status: { equals: 'draft' } } }),
    payload.count({ collection: 'categories' }),
    payload.count({ collection: 'tags' }),
    payload.count({ collection: 'media' }),
    payload.count({ collection: 'users' }),
    payload.count({ collection: 'authors' }),
  ])

  return (
    <div className="sciconnect-stats-grid">
      <StatCard
        title="Total Articles"
        count={totalArticles}
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        }
        color="#3b82f6"
      />

      <StatCard
        title="Published Articles"
        count={publishedArticles}
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        }
        color="#10b981"
      />

      <StatCard
        title="Draft Articles"
        count={draftArticles}
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        }
        color="#f59e0b"
      />

      <StatCard
        title="Categories"
        count={totalCategories}
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        }
        color="#8b5cf6"
      />

      <StatCard
        title="Tags"
        count={totalTags}
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        }
        color="#ec4899"
      />

      <StatCard
        title="Media Assets"
        count={totalMedia}
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        }
        color="#06b6d4"
      />

      <StatCard
        title="Users"
        count={totalUsers}
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        }
        color="#6366f1"
      />

      <StatCard
        title="Authors"
        count={totalAuthors}
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        }
        color="#14b8a6"
      />
    </div>
  )
}

export default StatsCards
