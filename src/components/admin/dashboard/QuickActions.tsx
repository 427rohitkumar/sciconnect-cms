import React from 'react'
import Link from 'next/link'

export default function QuickActions() {
  return (
    <div className="sciconnect-dashboard-section" style={{ marginBottom: 0 }}>
      <div className="sciconnect-dashboard-section__header">
        <h2 className="sciconnect-dashboard-section__title">Quick Actions</h2>
      </div>
      <div className="sciconnect-quick-actions">
        <Link href="/admin/collections/articles/create" className="sciconnect-btn sciconnect-btn--primary">
          <span style={{ fontSize: '1.2rem' }}>+</span> New Article
        </Link>
        <Link href="/admin/collections/media/create" className="sciconnect-btn sciconnect-btn--secondary">
          <span style={{ fontSize: '1.2rem' }}>⬆️</span> Upload Media
        </Link>
        <Link href="/admin/collections/categories/create" className="sciconnect-btn sciconnect-btn--secondary">
          <span style={{ fontSize: '1.2rem' }}>+</span> New Category
        </Link>
        <Link href="/admin/collections/tags/create" className="sciconnect-btn sciconnect-btn--secondary">
          <span style={{ fontSize: '1.2rem' }}>+</span> New Tag
        </Link>
        <Link href="/admin/collections/comments?where[or][0][and][0][status][equals]=pending" className="sciconnect-btn sciconnect-btn--secondary">
          <span style={{ fontSize: '1.2rem' }}>💬</span> Review Comments
        </Link>
        <Link href="/admin/collections/subscribers" className="sciconnect-btn sciconnect-btn--secondary">
          <span style={{ fontSize: '1.2rem' }}>👥</span> Manage Subscribers
        </Link>
      </div>
    </div>
  )
}
