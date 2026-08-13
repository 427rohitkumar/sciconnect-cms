'use client'

import React from 'react'
import type { AdminViewProps } from 'payload'
import './GoogleAnalyticsApp.scss'

export const GoogleAnalyticsApp: React.FC<AdminViewProps> = () => {
  return (
    <div className="google-analytics-launcher">
      <div className="google-analytics-launcher__header">
        <h1>Google Analytics</h1>
        <p>Access your Google Analytics property directly from the CMS.</p>
      </div>

      <div className="google-analytics-launcher__fallback">
        <p>
          <strong>Note:</strong> Google Analytics may refuse to embed directly inside the CMS because Google restricts third-party iframe embedding.
        </p>
        <p>
          If the dashboard below does not load, you can open Google Analytics in the current browser tab:
        </p>
        <a href="https://analytics.google.com/" className="btn">
          Open Google Analytics
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>

      <div className="google-analytics-launcher__iframe-container">
        <iframe
          src="https://analytics.google.com/"
          title="Google Analytics"
          className="google-analytics-launcher__iframe"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  )
}

export default GoogleAnalyticsApp
