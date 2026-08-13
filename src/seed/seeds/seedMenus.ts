import { Payload } from 'payload'
import { seedLogger } from '../utils/logger'
import { findOrCreate } from '../utils/findOrCreate'
import { seedMenusData } from '../data/menus'

export async function seedMenus(payload: Payload, isDryRun: boolean = false) {
  const logger = seedLogger('Menus')
  const createdMenus = []
  
  for (const menuData of seedMenusData) {
    const { doc, action } = await findOrCreate(
      payload,
      'menus',
      { slug: { equals: menuData.slug } },
      menuData,
      isDryRun,
      '[SEED] Menus'
    )
    
    if (action === 'created' || action === 'dry-run-created') {
      logger.success(`Created menu: ${menuData.name}`)
    } else {
      logger.info(`Reused existing menu: ${menuData.name}`)
    }
    createdMenus.push(doc)
  }
  
  return createdMenus
}
