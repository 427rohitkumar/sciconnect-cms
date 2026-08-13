import { getPayload, Payload, PayloadRequest } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect } from 'vitest'
import {
  canCreateAuthor,
  canReadAuthor,
  canUpdateAuthor,
  canDeleteAuthor,
  UserRole,
  UserStatus,
} from '@/access/roles'

let payload: Payload

const makeReq = (user: { role: UserRole; status: UserStatus } | null): { req: PayloadRequest } => {
  return { req: { user } as unknown as PayloadRequest }
}

describe('Authors Foundation & Access Control', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('enforces collection access control rules for authors', () => {
    const activeSuperAdmin = { role: 'super_admin' as const, status: 'active' as const }
    const activeAdmin = { role: 'admin' as const, status: 'active' as const }
    const activeEditor = { role: 'editor' as const, status: 'active' as const }
    const inactiveUser = { role: 'admin' as const, status: 'inactive' as const }

    // Create
    expect(canCreateAuthor(makeReq(activeSuperAdmin))).toBe(true)
    expect(canCreateAuthor(makeReq(activeAdmin))).toBe(true)
    expect(canCreateAuthor(makeReq(activeEditor))).toBe(true)
    expect(canCreateAuthor(makeReq(inactiveUser))).toBe(false)
    expect(canCreateAuthor(makeReq(null))).toBe(false)

    // Read
    expect(canReadAuthor(makeReq(activeSuperAdmin))).toBe(true)
    expect(canReadAuthor(makeReq(activeAdmin))).toBe(true)
    expect(canReadAuthor(makeReq(activeEditor))).toBe(true)
    expect(canReadAuthor(makeReq(inactiveUser))).toBe(false)
    expect(canReadAuthor(makeReq(null))).toBe(false)

    // Update
    expect(canUpdateAuthor(makeReq(activeSuperAdmin))).toBe(true)
    expect(canUpdateAuthor(makeReq(activeAdmin))).toBe(true)
    expect(canUpdateAuthor(makeReq(activeEditor))).toBe(true)
    expect(canUpdateAuthor(makeReq(inactiveUser))).toBe(false)
    expect(canUpdateAuthor(makeReq(null))).toBe(false)

    // Delete (Editor MUST BE DENIED)
    expect(canDeleteAuthor(makeReq(activeSuperAdmin))).toBe(true)
    expect(canDeleteAuthor(makeReq(activeAdmin))).toBe(true)
    expect(canDeleteAuthor(makeReq(activeEditor))).toBe(false)
    expect(canDeleteAuthor(makeReq(inactiveUser))).toBe(false)
    expect(canDeleteAuthor(makeReq(null))).toBe(false)
  })

  it('creates author with automatic slug generation and social profiles', async () => {
    const ts = Date.now()
    const author = await payload.create({
      collection: 'authors',
      data: {
        name: `Rohit Kumar ${ts}`,
        designation: 'Senior Science Editor',
        bio: 'Covering AI and quantum physics.',
        status: 'active',
        social: {
          x: 'https://x.com/rohitkumar',
          linkedin: 'https://linkedin.com/in/rohitkumar',
        },
      },
    })

    expect(author.id).toBeDefined()
    expect(author.name).toBe(`Rohit Kumar ${ts}`)
    expect(author.slug).toBe(`rohit-kumar-${ts}`)
    expect(author.designation).toBe('Senior Science Editor')
    expect(author.status).toBe('active')
    expect(author.social?.x).toBe('https://x.com/rohitkumar')
  })

  it('preserves custom manual slug on author name update', async () => {
    const ts = Date.now()
    const customSlug = `ashutosh-custom-${ts}`

    const author = await payload.create({
      collection: 'authors',
      data: {
        name: `Ashutosh ${ts}`,
        slug: customSlug,
      },
    })

    expect(author.slug).toBe(customSlug)

    const updated = await payload.update({
      collection: 'authors',
      id: author.id,
      data: {
        name: `Ashutosh Tiwari ${ts}`,
      },
    })

    expect(updated.name).toBe(`Ashutosh Tiwari ${ts}`)
    expect(updated.slug).toBe(customSlug)
  })

  it('rejects duplicate author slug', async () => {
    const slug = `unique-author-slug-${Date.now()}`

    await payload.create({
      collection: 'authors',
      data: {
        name: 'Author One',
        slug,
      },
    })

    await expect(
      payload.create({
        collection: 'authors',
        data: {
          name: 'Author Two',
          slug,
        },
      }),
    ).rejects.toThrow(/already exists/)
  })

  it('blocks deletion of an author assigned to an article', async () => {
    const ts = Date.now()
    const author = await payload.create({
      collection: 'authors',
      data: {
        name: `Assigned Writer ${ts}`,
        status: 'active',
      },
    })

    const category = await payload.create({
      collection: 'categories',
      data: {
        name: `Tech ${ts}`,
        status: 'active',
      },
    })

    await payload.create({
      collection: 'articles',
      data: {
        title: `Test Article for Author Delete ${ts}`,
        author: author.id,
        category: category.id,
        content: { root: { children: [], type: 'root', version: 1 } },
        _status: 'draft',
      },
    })

    // Attempting to delete author referenced by article
    await expect(
      payload.delete({
        collection: 'authors',
        id: author.id,
      }),
    ).rejects.toThrow(/Cannot delete this author because they are assigned to existing articles/)
  })

  it('supports multilingual (Hindi/English) search for authors', async () => {
    const ts = Date.now()
    const hindiAuthor = await payload.create({
      collection: 'authors',
      data: {
        name: `आशुतोष तिवारी ${ts}`,
        designation: 'मुख्य संपादक',
        status: 'active',
      },
    })

    const result = await payload.find({
      collection: 'authors',
      where: {
        or: [
          { name: { contains: 'आशुतोष' } },
          { slug: { contains: 'ashutosh' } },
          { designation: { contains: 'संपादक' } },
        ],
      },
    })

    expect(result.docs.some((doc: any) => doc.id === hindiAuthor.id)).toBe(true)
  })
})
