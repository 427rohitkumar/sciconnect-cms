'use client'

import React from 'react'
import Link from 'next/link'
import styles from './GoogleAnalyticsEmbed.module.scss'

interface Props {
  enabled: boolean
  embedUrl?: string
}

export default function GoogleAnalyticsEmbed({ enabled, embedUrl }: Props) {
  // State A — Disabled
  if (!enabled) {
    return (
      <div className={styles['google-analytics-embed']}>
        <div className={styles['google-analytics-embed__header']}>
          <h1>Google Analytics</h1>
          <p>Analytics dashboard powered by Looker Studio</p>
        </div>
        <div className={styles['google-analytics-embed__state']}>
          <p>Analytics dashboard is currently disabled.</p>
        </div>
      </div>
    )
  }

  // State B — Not Configured
  if (!embedUrl) {
    return (
      <div className={styles['google-analytics-embed']}>
        <div className={styles['google-analytics-embed__header']}>
          <h1>Google Analytics</h1>
          <p>Analytics dashboard powered by Looker Studio</p>
        </div>
        <div className={styles['google-analytics-embed__state']}>
          <p>No Looker Studio report has been configured yet.</p>
          <Link href="/admin/globals/site-settings" className={styles['btn'] || 'btn btn--primary'}>
            Configure Analytics
          </Link>
        </div>
      </div>
    )
  }

  // Embed Security: Validate URL Server-side / Runtime level
  let isValid = false
  try {
    const url = new URL(embedUrl)
    if (url.protocol === 'https:' && (url.hostname === 'lookerstudio.google.com' || url.hostname === 'datastudio.google.com') && url.pathname.startsWith('/embed/')) {
      isValid = true
    }
  } catch (e) {
    // Ignore invalid URL formatting
  }

  if (!isValid) {
    return (
      <div className={styles['google-analytics-embed']}>
        <div className={styles['google-analytics-embed__header']}>
          <h1>Google Analytics</h1>
          <p>Analytics dashboard powered by Looker Studio</p>
        </div>
        <div className={styles['google-analytics-embed__state']}>
          <p>Invalid Looker Studio / Data Studio Embed URL.</p>
        </div>
      </div>
    )
  }

  // State C — Configured
  return (
    <div className={styles['google-analytics-embed']}>
      <div className={styles['google-analytics-embed__header']}>
        <h1>Google Analytics</h1>
        <p>Analytics dashboard powered by Looker Studio</p>
      </div>
      <div className={styles['google-analytics-embed__container']}>
        <iframe
          src={embedUrl}
          title="Google Analytics"
          loading="lazy"
          allowFullScreen
          className={styles['google-analytics-embed__iframe']}
        />
      </div>
    </div>
  )
}
