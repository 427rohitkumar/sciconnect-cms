import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Payload } from 'payload'

describe('Menu Builder API', () => {
  let payload: Payload
  let testMenuId: string
  let articleId: string
  let categoryId: string

  beforeAll(async () => {
    payload = await getPayload({ config: configPromise })

    // Create a menu
    const menu = await payload.create({
      collection: 'menus' as any,
      data: {
        name: `Builder Test Menu ${Date.now()}`,
        status: 'active',
      },
    })
    testMenuId = String(menu.id)

    // Create article and category for search
    const article = await payload.create({
      collection: 'articles',
      data: {
        title: 'Quantum Physics Explained',
        slug: `quantum-${Date.now()}`,
        status: 'active',
        content: {}, // Lexical
      },
    })
    articleId = String(article.id)

    const category = await payload.create({
      collection: 'categories',
      data: {
        name: 'Science Research',
        slug: `science-${Date.now()}`,
        status: 'active',
      },
    })
    categoryId = String(category.id)
  })

  it('searches articles by title', async () => {
    // This calls the underlying payload find similar to the endpoint
    const res = await payload.find({
      collection: 'articles',
      where: {
        or: [{ title: { like: 'Quantum' } }, { slug: { like: 'Quantum' } }]
      },
      limit: 20
    })
    
    expect(res.docs.length).toBeGreaterThan(0)
    expect(res.docs.some(d => d.id === articleId)).toBe(true)
  })

  it('searches categories by name', async () => {
    const res = await payload.find({
      collection: 'categories',
      where: {
        or: [{ name: { like: 'Science' } }, { slug: { like: 'Science' } }]
      },
      limit: 20
    })
    
    expect(res.docs.length).toBeGreaterThan(0)
    expect(res.docs.some(d => d.id === categoryId)).toBe(true)
  })
})
