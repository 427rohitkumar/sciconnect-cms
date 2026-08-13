import { Payload } from 'payload'
import { seedLogger } from '../utils/logger'
import { findOrCreate } from '../utils/findOrCreate'
import { seedCategoriesData } from '../data/categories'

export async function seedCategories(payload: Payload, isDryRun: boolean = false) {
  const logger = seedLogger('Categories')
  const createdCategories = []
  
  for (const categoryData of seedCategoriesData) {
    const { doc, action } = await findOrCreate(
      payload,
      'categories',
      { slug: { equals: categoryData.slug } },
      { ...categoryData, status: 'active' }, // Assume active status by default for seeding
      isDryRun,
      '[SEED] Categories'
    )
    
    if (action === 'created' || action === 'dry-run-created') {
      logger.success(`Created category: ${categoryData.name}`)
    } else {
      logger.info(`Reused existing category: ${categoryData.name}`)
    }
    createdCategories.push(doc)
  }
  
  return createdCategories
}
