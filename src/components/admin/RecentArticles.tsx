import React from 'react'
import Link from 'next/link'
import type { Payload } from 'payload'

interface RecentArticlesProps {
  payload: Payload
}

export const RecentArticles: React.FC<RecentArticlesProps> = async ({ payload }) => {
  const { docs: articles } = await payload.find({
    collection: 'articles',
    limit: 5,
    sort: '-updatedAt',
    draft: true,
    depth: 1,
    select: {
      title: true,
      slug: true,
      _status: true,
      author: true,
      categories: true,
      updatedAt: true,
      publishedAt: true,
    },
  })

  return (
    <div className="sciconnect-dashboard-section">
      <div className="sciconnect-dashboard-section__header">
        <h3 className="sciconnect-dashboard-section__title">Recent Articles</h3>
        <Link href="/admin/collections/articles" className="sciconnect-dashboard-section__link">
          View all
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="sciconnect-empty-state">
          <p>No articles yet.</p>
          <Link href="/admin/collections/articles/create" className="sciconnect-btn sciconnect-btn--primary">
            Create your first article
          </Link>
        </div>
      ) : (
        <div className="sciconnect-table-wrapper">
          <table className="sciconnect-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Author</th>
                <th>Categories</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article: any) => {
                const authorName =
                  typeof article.author === 'object' && article.author
                    ? article.author.name || article.author.email
                    : 'Unassigned'

                const categoryName =
                  Array.isArray(article.categories) && article.categories.length > 0
                    ? article.categories.map((c: any) => c.name || c.title || 'Unknown').join(', ')
                    : 'Uncategorized'

                const status = article._status || 'draft'
                const isPublished = status === 'published'

                const formattedDate = new Date(article.updatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })

                return (
                  <tr key={article.id}>
                    <td>
                      <Link href={`/admin/collections/articles/${article.id}`} className="sciconnect-table__title-link">
                        {article.title || 'Untitled Article'}
                      </Link>
                    </td>
                    <td>
                      <span
                        className={`sciconnect-badge ${
                          isPublished ? 'sciconnect-badge--published' : 'sciconnect-badge--draft'
                        }`}
                      >
                        {isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>{authorName}</td>
                    <td>{categoryName}</td>
                    <td className="sciconnect-table__date">{formattedDate}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default RecentArticles
