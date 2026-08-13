import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config

  let user = null
  try {
    const payload = await getPayload({ config: payloadConfig })
    const auth = await payload.auth({ headers })
    user = auth.user
  } catch {
    // DB not ready yet — render page without auth
  }

  return (
    <div className="home">
      <div className="content">
        <div className="logo-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Sci-Connect Logo"
            src="/logo.png"
            className="logo-img"
          />
          <span className="brand-name">Sci-Connect</span>
        </div>
        {!user && <h1>Scientific Knowledge,<br />Connected.</h1>}
        {user && <h1>Welcome back,<br />{user.name || user.email}</h1>}
        <p className="tagline">A modern CMS for science communication.</p>
        <div className="links">
          <a
            className="admin"
            href={payloadConfig.routes.admin}
          >
            Go to Admin Panel
          </a>
          <a
            className="search-link-btn"
            href="/search"
            style={{
              padding: '0.65rem 1.5rem',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 600,
              textDecoration: 'none',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            Search Articles
          </a>
        </div>
      </div>
    </div>
  )
}
