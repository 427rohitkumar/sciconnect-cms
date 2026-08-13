import { Payload } from 'payload'
import { seedArticlesData, generateLexicalContent } from '../data/articles'
import { seedAuthorsData } from '../data/authors'

export async function seedArticles(payload: Payload, isDryRun: boolean): Promise<any[]> {
  console.log('\n[SEED] Starting article seeds...')

  // Resolve Admin User for publishing access
  const adminRes = await payload.find({
    collection: 'users',
    where: { email: { equals: 'admin@gmail.com' } },
    depth: 0,
    limit: 1,
  })
  const adminUser = adminRes.docs[0]

  // Resolve Author
  const authorSlug = seedAuthorsData[0].slug
  const authorRes = await payload.find({
    collection: 'authors',
    where: { slug: { equals: authorSlug } },
    depth: 0,
    limit: 1,
  })

  if (!authorRes.docs.length) {
    console.error(`[SEED FATAL] Author '${authorSlug}' not found. Ensure authors are seeded before articles.`)
    throw new Error('Missing Author dependency.')
  }
  const authorId = authorRes.docs[0].id

  let createdCount = 0
  let reusedCount = 0
  const results = []

  // Spread dates out chronologically over the past 2-10 days
  const now = new Date()

  for (let i = 0; i < seedArticlesData.length; i++) {
    const articleData = seedArticlesData[i]
    
    // Resolve Category
    const categoryRes = await payload.find({
      collection: 'categories',
      where: { slug: { equals: articleData.category } },
      depth: 0,
      limit: 1,
    })

    if (!categoryRes.docs.length) {
      console.error(`[SEED] Missing category dependency for article '${articleData.title}': Category '${articleData.category}' not found.`)
      throw new Error(`Missing Category dependency: ${articleData.category}`)
    }
    const categoryId = categoryRes.docs[0].id

    // Resolve Tags
    const resolvedTagIds: any[] = []
    for (const tagSlug of articleData.tags) {
      const tagRes = await payload.find({
        collection: 'tags',
        where: { slug: { equals: tagSlug } },
        depth: 0,
        limit: 1,
      })
      if (tagRes.docs.length > 0) {
        resolvedTagIds.push(tagRes.docs[0].id)
      } else {
        console.warn(`[SEED] Missing tag: '${tagSlug}' for article '${articleData.title}'. Skipping this tag.`)
      }
    }

    // Check if article exists (Idempotency)
    const existingArticle = await payload.find({
      collection: 'articles',
      where: { slug: { equals: articleData.slug } },
      depth: 0,
      limit: 1,
    })

    if (existingArticle.docs.length > 0) {
      console.log(`[SEED] Reused existing article: ${articleData.slug}`)
      reusedCount++
      results.push(existingArticle.docs[0])
      continue
    }

    if (isDryRun) {
      console.log(`[SEED DRY RUN] Would create article: ${articleData.slug}`)
      continue
    }

    // Offset publish date (e.g. 5 articles spaced by 2 days each)
    const publishedAt = new Date(now.getTime() - (seedArticlesData.length - i) * 2 * 24 * 60 * 60 * 1000).toISOString()

    // Create article
    const dataPayload: any = {
      title: articleData.title,
      slug: articleData.slug,
      excerpt: articleData.excerpt,
      contentType: (articleData as any).contentType || 'article',
      content: generateLexicalContent(articleData.blocks) as any,
      _status: 'published',
      publishedAt: publishedAt,
      author: authorId,
      categories: [categoryId],
      tags: resolvedTagIds,
      seo: articleData.seo,
    }

    if (dataPayload.contentType === 'video') {
      const videoData = (articleData as any).video
      if (videoData) {
        dataPayload.video = videoData
      }
      
      const transcriptBlocks = (articleData as any).transcriptBlocks
      if (transcriptBlocks) {
        dataPayload.transcript = generateLexicalContent(transcriptBlocks) as any
      }
    }

    const created = await payload.create({
      collection: 'articles',
      req: {
        user: adminUser,
      } as any,
      data: dataPayload
    })

    console.log(`[SEED] Created article: ${articleData.slug}`)
    createdCount++
    results.push(created)
  }

  console.log(`[SEED] Article seed completed: ${createdCount} created, ${reusedCount} reused`)
  return results
}
