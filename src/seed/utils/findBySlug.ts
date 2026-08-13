import { Payload } from 'payload'

export async function findBySlug(payload: Payload, collection: keyof Payload['collections'], slug: string) {
  const result = await payload.find({
    collection,
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  })

  return result.docs.length > 0 ? result.docs[0] : null
}
