import React from 'react'
import Link from 'next/link'

export const QuickActions: React.FC = () => {
  return (
    <div className="sciconnect-dashboard-section">
      <h3 className="sciconnect-dashboard-section__title">Quick Actions</h3>
      <div className="sciconnect-quick-actions">
        <Link href="/admin/collections/articles/create" className="sciconnect-btn sciconnect-btn--primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Article
        </Link>
        <Link href="/admin/collections/media/create" className="sciconnect-btn sciconnect-btn--secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload Media
        </Link>
        <Link href="/admin/collections/categories/create" className="sciconnect-btn sciconnect-btn--secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Category
        </Link>
        <Link href="/admin/collections/tags/create" className="sciconnect-btn sciconnect-btn--secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Tag
        </Link>
      </div>
    </div>
  )
}

export default QuickActions
