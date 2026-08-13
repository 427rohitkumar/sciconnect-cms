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
        {user && <h1>Welcome back,<br />{user.email}</h1>}
        <p className="tagline">A modern CMS for science communication.</p>
        <div className="links">
          <a
            className="admin"
            href={payloadConfig.routes.admin}
          >
            Go to Admin Panel
          </a>
        </div>
      </div>
    </div>
  )
}
