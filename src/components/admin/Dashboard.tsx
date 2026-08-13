import React from 'react'
import type { AdminViewProps } from 'payload'
import DashboardHeader from '@/components/admin/dashboard/DashboardHeader'
import ContentKPIs from '@/components/admin/dashboard/ContentKPIs'
import EngagementKPIs from '@/components/admin/dashboard/EngagementKPIs'
import NeedsAttention from '@/components/admin/dashboard/NeedsAttention'
import ContentActivity from '@/components/admin/dashboard/ContentActivity'
import ContentStatus from '@/components/admin/dashboard/ContentStatus'
import RecentArticles from '@/components/admin/dashboard/RecentArticles'
import TopCategories from '@/components/admin/dashboard/TopCategories'
import RecentComments from '@/components/admin/dashboard/RecentComments'
import NewsletterOverview from '@/components/admin/dashboard/NewsletterOverview'
import SEOHealth from '@/components/admin/dashboard/SEOHealth'
import QuickActions from '@/components/admin/dashboard/QuickActions'
import SystemStatus from '@/components/admin/dashboard/SystemStatus'
import '@/styles/admin.scss'

export const Dashboard: React.FC<AdminViewProps> = async (props) => {
  const payload = props.initPageResult?.req?.payload || (props as any).payload

  if (!payload) return null

  return (
    <div className="sciconnect-dashboard-container">
      <DashboardHeader />

      <div className="sciconnect-dashboard-layout">
        {/* Top KPIs */}
        <ContentKPIs payload={payload} />
        <EngagementKPIs payload={payload} />

        {/* Attention */}
        <NeedsAttention payload={payload} />

        {/* Charts & Status */}
        <div className="sciconnect-grid-row sciconnect-grid-row--2-1">
          <ContentActivity payload={payload} />
          <ContentStatus payload={payload} />
        </div>

        {/* Recent Articles */}
        <RecentArticles payload={payload} />

        {/* Middle Tier: Categories & Comments */}
        <div className="sciconnect-grid-row sciconnect-grid-row--2">
          <TopCategories payload={payload} />
          <RecentComments payload={payload} />
        </div>

        {/* Bottom Tier: Newsletter & SEO */}
        <div className="sciconnect-grid-row sciconnect-grid-row--2">
          <NewsletterOverview payload={payload} />
          <SEOHealth payload={payload} />
        </div>

        {/* Footer Actions & Status */}
        <QuickActions />
        <SystemStatus payload={payload} />
      </div>
    </div>
  )
}

export default Dashboard
