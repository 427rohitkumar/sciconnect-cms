'use client'

import { useEffect } from 'react'

export function PWASetup({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('[PWA] Service worker registered:', reg.scope)
        })
        .catch((err) => {
          console.warn('[PWA] Service worker registration failed:', err)
        })
    }

    // Inject <link rel="manifest"> into <head>
    if (!document.querySelector('link[rel="manifest"]')) {
      const link = document.createElement('link')
      link.rel = 'manifest'
      link.href = '/manifest.json'
      document.head.appendChild(link)
    }

    // Inject theme-color meta
    if (!document.querySelector('meta[name="theme-color"]')) {
      const meta = document.createElement('meta')
      meta.name = 'theme-color'
      meta.content = '#6366f1'
      document.head.appendChild(meta)
    }

    // Inject apple-touch-icon
    if (!document.querySelector('link[rel="apple-touch-icon"]')) {
      const link = document.createElement('link')
      link.rel = 'apple-touch-icon'
      link.href = '/icons/icon-192.png'
      document.head.appendChild(link)
    }

    // Inject apple mobile web app meta tags
    const appleMeta = {
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      'apple-mobile-web-app-title': 'SciConnect',
    }

    Object.entries(appleMeta).forEach(([name, content]) => {
      if (!document.querySelector(`meta[name="${name}"]`)) {
        const meta = document.createElement('meta')
        meta.name = name
        meta.content = content
        document.head.appendChild(meta)
      }
    })
  }, [])

  return <>{children}</>
}
