import { Payload } from 'payload'

export async function findOrCreate(
  payload: Payload,
  collection: keyof Payload['collections'],
  where: Record<string, any>,
  data: Record<string, any>,
  isDryRun: boolean = false,
  logPrefix: string = '[SEED]'
): Promise<{ doc: any; action: 'created' | 'existed' | 'dry-run-created' | 'dry-run-existed' }> {
  
  const existing = await payload.find({
    collection,
    where,
    limit: 1,
  })

  if (existing.docs.length > 0) {
    if (isDryRun) {
      console.log(`${logPrefix} [DRY RUN] Would reuse existing ${collection.toString()}:`, where)
      return { doc: existing.docs[0], action: 'dry-run-existed' }
    }
    return { doc: existing.docs[0], action: 'existed' }
  }

  if (isDryRun) {
    console.log(`${logPrefix} [DRY RUN] Would create new ${collection.toString()}:`, data)
    return { doc: { id: 'dry-run-id', ...data }, action: 'dry-run-created' }
  }

  const created = await payload.create({
    collection,
    data,
  })
  
  return { doc: created, action: 'created' }
}
