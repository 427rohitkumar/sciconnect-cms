import { getPayload, Payload, PayloadRequest } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect } from 'vitest'
import {
  canCreateArticle,
  canReadArticle,
  canUpdateArticle,
  canDeleteArticle,
  canReadArticleVersions,
  UserRole,
  UserStatus,
} from '@/access/roles'
import { getParentId, toKebabCase } from '@/collections/Categories'

let payload: Payload

const sampleLexicalContent = {
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'text',
            text: 'This is a sample article paragraph generated for Lexical testing.',
            version: 1,
          },
        ],
      },
    ],
  },
}

const makeReq = (user: { id?: number; role: UserRole; status: UserStatus } | null): { req: PayloadRequest } => {
  return { req: { user } as unknown as PayloadRequest }
}

describe('Articles Full Foundation, Access, Query, Filtering & Search', () => {
  let superAdminUser: any
  let editorUser: any
  let otherUser: any
  let activeCategory: any
  let inactiveCategory: any
  let tagA: any
  let tagB: any
  let testMedia: any
  let testMedia2: any
  let testAuthor: any
  let testAuthor2: any

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    const ts = Date.now()

    // 0. Create Test Authors
    testAuthor = await payload.create({
      collection: 'authors',
      data: {
        name: `Test Author ${ts}`,
        status: 'active',
      },
    })

    testAuthor2 = await payload.create({
      collection: 'authors',
      data: {
        name: `Test Author 2 ${ts}`,
        status: 'active',
      },
    })

    // 1. Create Test Users
    superAdminUser = await payload.create({
      collection: 'users',
      data: {
        email: `superadmin-${ts}@sciconnect.world`,
        password: 'Password123!',
        name: 'Super Admin User',
        role: 'super_admin',
        status: 'active',
      },
    })

    editorUser = await payload.create({
      collection: 'users',
      data: {
        email: `editor-${ts}@sciconnect.world`,
        password: 'Password123!',
        name: 'Editor User',
        role: 'editor',
        status: 'active',
      },
    })

    otherUser = await payload.create({
      collection: 'users',
      data: {
        email: `other-${ts}@sciconnect.world`,
        password: 'Password123!',
        name: 'Other User',
        role: 'editor',
        status: 'active',
      },
    })

    // 2. Create Test Categories
    activeCategory = await payload.create({
      collection: 'categories',
      data: {
        name: `Active Category ${ts}`,
        status: 'active',
      },
    })

    inactiveCategory = await payload.create({
      collection: 'categories',
      data: {
        name: `Inactive Category ${ts}`,
        status: 'inactive',
      },
    })

    // 3. Create Test Tags
    tagA = await payload.create({
      collection: 'tags',
      data: {
        name: `Tag A ${ts}`,
        status: 'active',
      },
    })

    tagB = await payload.create({
      collection: 'tags',
      data: {
        name: `Tag B ${ts}`,
        status: 'active',
      },
    })

    // 4. Create Test Media Assets
    const dummyBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    )

    testMedia = await payload.create({
      collection: 'media',
      data: {
        alt: 'Test Featured Image',
      },
      file: {
        data: dummyBuffer,
        name: `test-featured-${ts}.png`,
        mimetype: 'image/png',
        size: dummyBuffer.length,
      },
    })

    testMedia2 = await payload.create({
      collection: 'media',
      data: {
        alt: 'Test OG Image',
      },
      file: {
        data: dummyBuffer,
        name: `test-og-${ts}.png`,
        mimetype: 'image/png',
        size: dummyBuffer.length,
      },
    })
  })

  it('enforces collection and version access control rules for articles', () => {
    const activeSuperAdmin = { role: 'super_admin' as const, status: 'active' as const }
    const activeAdmin = { role: 'admin' as const, status: 'active' as const }
    const activeEditor = { role: 'editor' as const, status: 'active' as const }
    const inactiveUser = { role: 'admin' as const, status: 'inactive' as const }

    // Create / Update / Delete
    expect(canCreateArticle(makeReq(activeSuperAdmin))).toBe(true)
    expect(canUpdateArticle(makeReq(activeEditor))).toBe(true)
    expect(canDeleteArticle(makeReq(activeEditor))).toBe(false)
    expect(canDeleteArticle(makeReq(activeSuperAdmin))).toBe(true)

    // Version reading access
    expect(canReadArticleVersions(makeReq(activeSuperAdmin))).toBe(true)
    expect(canReadArticleVersions(makeReq(activeAdmin))).toBe(true)
    expect(canReadArticleVersions(makeReq(activeEditor))).toBe(true)
    expect(canReadArticleVersions(makeReq(inactiveUser))).toBe(false)
    expect(canReadArticleVersions(makeReq(null))).toBe(false)

    // Public vs Staff Read Policy
    expect(canReadArticle(makeReq(activeEditor))).toBe(true)

    const publicReadConstraint = canReadArticle(makeReq(null))
    expect(typeof publicReadConstraint).toBe('object')
  })

  it('enforces public read isolation (published + active category vs drafts & inactive categories)', async () => {
    const ts = Date.now()

    // 1. Published article with active category -> Publicly readable!
    const publishedArticle = await payload.create({
      collection: 'articles',
      data: {
        title: `Public Article ${ts}`,
        content: sampleLexicalContent as any,
        author: testAuthor.id,
        category: activeCategory.id,
        _status: 'published',
      },
      draft: false,
    })

    // 2. Draft article -> Private / NOT publicly readable!
    const draftArticle = await payload.create({
      collection: 'articles',
      data: {
        title: `Draft Article ${ts}`,
      },
      draft: true,
    })

    // 3. Published article with noIndex = true -> Publicly readable!
    const noIndexArticle = await payload.create({
      collection: 'articles',
      data: {
        title: `NoIndex Article ${ts}`,
        content: sampleLexicalContent as any,
        author: testAuthor.id,
        category: activeCategory.id,
        seo: {
          noIndex: true,
        },
        _status: 'published',
      },
      draft: false,
    })

    // Query articles without overriding access (simulating public request)
    const publicQuery = await payload.find({
      collection: 'articles',
      overrideAccess: false,
      user: undefined,
    })

    const publicIds = publicQuery.docs.map((doc) => doc.id)
    expect(publicIds).toContain(publishedArticle.id)
    expect(publicIds).toContain(noIndexArticle.id)
    expect(publicIds).not.toContain(draftArticle.id)

    // Staff query (overrideAccess: false with editor user) -> includes draft!
    const staffReq = { user: editorUser } as unknown as PayloadRequest
    const staffQuery = await payload.find({
      collection: 'articles',
      overrideAccess: false,
      req: staffReq,
      draft: true,
    })

    const staffIds = staffQuery.docs.map((doc) => doc.id)
    expect(staffIds).toContain(draftArticle.id)
  })

  it('supports category, tag, author, and slug filtering for published content', async () => {
    const ts = Date.now()

    const article = await payload.create({
      collection: 'articles',
      data: {
        title: `Filter Target ${ts}`,
        content: sampleLexicalContent as any,
        author: testAuthor2.id,
        category: activeCategory.id,
        tags: [tagA.id],
        _status: 'published',
      },
      draft: false,
    })

    // 1. Slug filter
    const bySlug = await payload.find({
      collection: 'articles',
      where: {
        slug: {
          equals: article.slug,
        },
      },
      overrideAccess: false,
    })

    expect(bySlug.docs.length).toBe(1)
    expect(bySlug.docs[0].id).toBe(article.id)

    // 2. Category filter
    const byCategory = await payload.find({
      collection: 'articles',
      where: {
        category: {
          equals: activeCategory.id,
        },
      },
      overrideAccess: false,
    })

    expect(byCategory.docs.some((doc) => doc.id === article.id)).toBe(true)

    // 3. Tag filter
    const byTag = await payload.find({
      collection: 'articles',
      where: {
        tags: {
          in: [tagA.id],
        },
      },
      overrideAccess: false,
    })

    expect(byTag.docs.some((doc) => doc.id === article.id)).toBe(true)

    // 4. Author filter
    const byAuthor = await payload.find({
      collection: 'articles',
      where: {
        author: {
          equals: testAuthor2.id,
        },
      },
      overrideAccess: false,
    })

    expect(byAuthor.docs.some((doc) => doc.id === article.id)).toBe(true)
  })

  it('supports pagination and default -publishedAt sorting', async () => {
    const ts = Date.now()

    const article1 = await payload.create({
      collection: 'articles',
      data: {
        title: `Older Article ${ts}`,
        content: sampleLexicalContent as any,
        author: testAuthor.id,
        category: activeCategory.id,
        publishedAt: new Date(Date.now() - 10000).toISOString(),
        _status: 'published',
      },
      draft: false,
    })

    const article2 = await payload.create({
      collection: 'articles',
      data: {
        title: `Newer Article ${ts}`,
        content: sampleLexicalContent as any,
        author: testAuthor.id,
        category: activeCategory.id,
        publishedAt: new Date().toISOString(),
        _status: 'published',
      },
      draft: false,
    })

    const paginated = await payload.find({
      collection: 'articles',
      limit: 10,
      page: 1,
      sort: '-publishedAt',
      overrideAccess: false,
    })

    expect(paginated.page).toBe(1)
    expect(paginated.limit).toBe(10)
    expect(paginated.totalDocs).toBeGreaterThanOrEqual(2)

    // Verify ordering (-publishedAt: newer published first)
    const index1 = paginated.docs.findIndex((doc) => doc.id === article1.id)
    const index2 = paginated.docs.findIndex((doc) => doc.id === article2.id)

    if (index1 !== -1 && index2 !== -1) {
      expect(index2).toBeLessThan(index1)
    }
  })

  it('supports PostgreSQL title and excerpt query search', async () => {
    const ts = Date.now()
    const searchTerm = `QuantumX${ts}`

    const searchedArticle = await payload.create({
      collection: 'articles',
      data: {
        title: `Breakthrough in ${searchTerm} Tech`,
        excerpt: 'Exploring quantum states and superposition.',
        content: sampleLexicalContent as any,
        author: testAuthor.id,
        category: activeCategory.id,
        _status: 'published',
      },
      draft: false,
    })

    const searchResults = await payload.find({
      collection: 'articles',
      where: {
        or: [
          {
            title: {
              contains: searchTerm,
            },
          },
          {
            excerpt: {
              contains: searchTerm,
            },
          },
        ],
      },
      overrideAccess: false,
    })

    expect(searchResults.docs.length).toBe(1)
    expect(searchResults.docs[0].id).toBe(searchedArticle.id)
  })

  it('guarantees draft safety: editing a published article does not expose draft changes to public API', async () => {
    const ts = Date.now()

    // 1. Publish Article with Version A
    const publishedArticle = await payload.create({
      collection: 'articles',
      data: {
        title: `Original Version A ${ts}`,
        excerpt: 'Version A Excerpt',
        content: sampleLexicalContent as any,
        author: testAuthor.id,
        category: activeCategory.id,
        _status: 'published',
      },
      draft: false,
    })

    // 2. Edit article in draft state (Version B)
    await payload.update({
      collection: 'articles',
      id: publishedArticle.id,
      data: {
        title: `Modified Version B ${ts}`,
        excerpt: 'Version B Excerpt',
      },
      draft: true,
    })

    // 3. Anonymous public API read (overrideAccess: false, draft: false) MUST return Version A!
    const publicResult = await payload.findByID({
      collection: 'articles',
      id: publishedArticle.id,
      overrideAccess: false,
      draft: false,
    })

    expect(publicResult.title).toBe(`Original Version A ${ts}`)
    expect(publicResult.excerpt).toBe('Version A Excerpt')
  })

  it('guarantees public response safety and relationship depth without leaking user auth internals', async () => {
    const ts = Date.now()

    const article = await payload.create({
      collection: 'articles',
      data: {
        title: `Security Test Article ${ts}`,
        content: sampleLexicalContent as any,
        author: testAuthor.id,
        category: activeCategory.id,
        _status: 'published',
      },
      draft: false,
    })

    const result = await payload.findByID({
      collection: 'articles',
      id: article.id,
      depth: 1,
      overrideAccess: false,
    })

    expect(result.id).toBe(article.id)
    if (typeof result.author === 'object' && result.author !== null) {
      expect(result.author.name).toBeDefined()
      expect((result.author as any).password).toBeUndefined()
      expect((result.author as any).hash).toBeUndefined()
      expect((result.author as any).salt).toBeUndefined()
      expect((result.author as any).resetPasswordToken).toBeUndefined()
    }
  })
})
