import React from 'react'

export interface StatCardProps {
  title: string
  count: number
  icon: React.ReactNode
  color?: string
}

export const StatCard: React.FC<StatCardProps> = ({ title, count, icon, color }) => {
  return (
    <div className="sciconnect-stat-card">
      <div className="sciconnect-stat-card__icon" style={{ color: color || 'var(--theme-success-500)' }}>
        {icon}
      </div>
      <div className="sciconnect-stat-card__content">
        <div className="sciconnect-stat-card__count">{count.toLocaleString()}</div>
        <div className="sciconnect-stat-card__title">{title}</div>
      </div>
    </div>
  )
}

export default StatCard
