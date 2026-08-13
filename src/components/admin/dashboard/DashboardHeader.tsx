import React from 'react'

export default function DashboardHeader() {
  const timestamp = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  return (
    <div className="sciconnect-dashboard-header">
      <h1 className="sciconnect-dashboard-title">Dashboard</h1>
      <p className="sciconnect-dashboard-subtitle">
        Overview of your publishing system, audience engagement and content activity.
      </p>
      <div className="sciconnect-dashboard-timestamp">Last updated: {timestamp}</div>
    </div>
  )
}
