import { Payload } from 'payload'
import { seedLogger } from '../utils/logger'
import { findOrCreate } from '../utils/findOrCreate'
import { findBySlug } from '../utils/findBySlug'
import { seedMenuItemsData } from '../data/menuItems'

export async function seedMenuItems(payload: Payload, isDryRun: boolean = false) {
  const logger = seedLogger('Menu Items')
  let createdCount = 0
  
  for (const [menuSlug, items] of Object.entries(seedMenuItemsData)) {
    // 1. Find the parent menu
    let menuId: string | number | undefined
    if (isDryRun) {
      menuId = 'dry-run-menu-id'
    } else {
      const parentMenu = await findBySlug(payload, 'menus', menuSlug)
      if (!parentMenu) {
        logger.error(`Parent menu "${menuSlug}" not found. Skipping its menu items.`)
        continue
      }
      menuId = parentMenu.id
    }

    // 2. Idempotently create menu items
    for (const itemData of items) {
      const { action } = await findOrCreate(
        payload,
        'menu-items',
        { 
          and: [
            { menu: { equals: menuId } },
            { label: { equals: itemData.label } }
          ]
        },
        { ...itemData, menu: menuId, status: 'active' },
        isDryRun,
        '[SEED] Menu Items'
      )
      
      if (action === 'created' || action === 'dry-run-created') {
        logger.success(`Created item "${itemData.label}" in menu "${menuSlug}"`)
        createdCount++
      } else {
        logger.info(`Reused existing item "${itemData.label}" in menu "${menuSlug}"`)
      }
    }
  }
  
  return createdCount
}
