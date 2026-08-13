import React from 'react'
import type { Payload } from 'payload'

export default async function ContentKPIs({ payload }: { payload: Payload }) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const dateStr = thirtyDaysAgo.toISOString()

  // Execute all independent counts in parallel
  const [
    totalArticles,
    recentArticles,
    publishedArticles,
    draftArticles,
    totalCategories,
    totalTags,
    totalMedia
  ] = await Promise.all([
    payload.count({ collection: 'articles' }),
    payload.count({ collection: 'articles', where: { createdAt: { greater_than_equal: dateStr } } }),
    payload.count({ collection: 'articles', where: { _status: { equals: 'published' } } }),
    payload.count({ collection: 'articles', where: { _status: { equals: 'draft' } } }),
    payload.count({ collection: 'categories' }),
    payload.count({ collection: 'tags' }),
    payload.count({ collection: 'media' }),
  ])

  return (
    <div className="sciconnect-grid-row sciconnect-grid-row--6">
      <div className="sciconnect-kpi-card">
        <div className="sciconnect-kpi-card__header">
          <span className="sciconnect-kpi-card__icon">📄</span>
          Total Articles
        </div>
        <div className="sciconnect-kpi-card__value">{totalArticles.totalDocs}</div>
        <div className="sciconnect-kpi-card__meta">
          {recentArticles.totalDocs > 0 ? `+${recentArticles.totalDocs} this month` : 'Up to date'}
        </div>
      </div>

      <div className="sciconnect-kpi-card">
        <div className="sciconnect-kpi-card__header">
          <span className="sciconnect-kpi-card__icon">✅</span>
          Published
        </div>
        <div className="sciconnect-kpi-card__value">{publishedArticles.totalDocs}</div>
        <div className="sciconnect-kpi-card__meta">Live on site</div>
      </div>

      <div className="sciconnect-kpi-card">
        <div className="sciconnect-kpi-card__header">
          <span className="sciconnect-kpi-card__icon">📝</span>
          Drafts
        </div>
        <div className="sciconnect-kpi-card__value">{draftArticles.totalDocs}</div>
        <div className="sciconnect-kpi-card__meta">In progress</div>
      </div>

      <div className="sciconnect-kpi-card">
        <div className="sciconnect-kpi-card__header">
          <span className="sciconnect-kpi-card__icon">📂</span>
          Categories
        </div>
        <div className="sciconnect-kpi-card__value">{totalCategories.totalDocs}</div>
        <div className="sciconnect-kpi-card__meta">Content topics</div>
      </div>

      <div className="sciconnect-kpi-card">
        <div className="sciconnect-kpi-card__header">
          <span className="sciconnect-kpi-card__icon">🏷️</span>
          Tags
        </div>
        <div className="sciconnect-kpi-card__value">{totalTags.totalDocs}</div>
        <div className="sciconnect-kpi-card__meta">Keywords</div>
      </div>

      <div className="sciconnect-kpi-card">
        <div className="sciconnect-kpi-card__header">
          <span className="sciconnect-kpi-card__icon">🖼️</span>
          Media Assets
        </div>
        <div className="sciconnect-kpi-card__value">{totalMedia.totalDocs}</div>
        <div className="sciconnect-kpi-card__meta">Images & files</div>
      </div>
    </div>
  )
}
