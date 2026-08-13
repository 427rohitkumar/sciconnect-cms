import { Payload } from 'payload'
import { seedLogger } from '../utils/logger'
import { findOrCreate } from '../utils/findOrCreate'
import { seedAuthorsData } from '../data/authors'

export async function seedAuthors(payload: Payload, isDryRun: boolean = false) {
  const logger = seedLogger('Authors')
  const createdAuthors = []
  
  for (const authorData of seedAuthorsData) {
    const { doc, action } = await findOrCreate(
      payload,
      'authors',
      { slug: { equals: authorData.slug } },
      authorData,
      isDryRun,
      '[SEED] Authors'
    )
    
    if (action === 'created' || action === 'dry-run-created') {
      logger.success(`Created author: ${authorData.name}`)
    } else {
      logger.info(`Reused existing author: ${authorData.name}`)
    }
    createdAuthors.push(doc)
  }
  
  return createdAuthors
}
