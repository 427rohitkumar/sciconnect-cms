import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { MenuBuilderClient } from './MenuBuilderClient'

export default async function MenuBuilderView(props: any) {
  const { initPageResult, params } = props
  
  // In Payload v3, docID is reliably available in initPageResult
  const menuId = initPageResult?.docID || props?.params?.id
  
  if (!menuId) {
    return <div>Error: Menu ID not found in URL</div>
  }

  const payload = await getPayload({ config: configPromise })
  
  let menu = null
  try {
    menu = await payload.findByID({
      collection: 'menus' as any,
      id: menuId,
      depth: 0,
    })
  } catch (e: any) {
    return <div>Error loading Menu with ID: {String(menuId)}. Error: {e?.message || 'Unknown error'}</div>
  }

  return (
    <div className="menu-builder-view">
      <MenuBuilderClient menu={menu} menuId={menuId} />
    </div>
  )
}
