import { Payload } from 'payload'
import { seedLogger } from '../utils/logger'
import { findOrCreate } from '../utils/findOrCreate'
import { seedTagsData } from '../data/tags'

export async function seedTags(payload: Payload, isDryRun: boolean = false) {
  const logger = seedLogger('Tags')
  const createdTags: any[] = []
  
  if (seedTagsData.length === 0) {
    logger.info('No tags defined for initial seed. Skipping.')
    return createdTags
  }

  for (const tagData of seedTagsData) {
    const { doc, action } = await findOrCreate(
      payload,
      'tags',
      { slug: { equals: tagData.slug } },
      tagData,
      isDryRun,
      '[SEED] Tags'
    )
    
    if (action === 'created' || action === 'dry-run-created') {
      logger.success(`Created tag: ${tagData.name}`)
    } else {
      logger.info(`Reused existing tag: ${tagData.name}`)
    }
    createdTags.push(doc)
  }
  
  return createdTags
}
