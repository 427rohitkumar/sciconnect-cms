import React from 'react'
import type { AdminViewProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import GoogleAnalyticsEmbed from './GoogleAnalyticsEmbed'

export const GoogleAnalyticsPage: React.FC<AdminViewProps> = async (props) => {
  const payload = props.initPageResult?.req?.payload || (props as any).payload

  if (!payload) {
    return <div>Payload not initialized</div>
  }

  // Fetch Site Settings locally without a REST network request
  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
    depth: 0,
  })

  // Defaults to true based on the prompt's schema default value
  const enabled = siteSettings.enableAnalyticsApp !== false
  const embedUrl = siteSettings.lookerStudioEmbedUrl as string | undefined

  return (
    <DefaultTemplate
      i18n={props.initPageResult?.req?.i18n || (props as any).i18n}
      locale={props.initPageResult?.locale}
      payload={props.initPageResult?.req?.payload || (props as any).payload}
      visibleEntities={props.initPageResult?.visibleEntities}
      permissions={props.initPageResult?.permissions}
    >
      <Gutter>
        <GoogleAnalyticsEmbed enabled={enabled} embedUrl={embedUrl} />
      </Gutter>
    </DefaultTemplate>
  )
}

export default GoogleAnalyticsPage
