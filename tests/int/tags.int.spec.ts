import { getPayload, Payload, PayloadRequest } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect } from 'vitest'
import {
  canCreateTag,
  canReadTag,
  canUpdateTag,
  canDeleteTag,
  UserRole,
  UserStatus,
} from '@/access/roles'

let payload: Payload

const makeReq = (user: { role: UserRole; status: UserStatus } | null): { req: PayloadRequest } => {
  return { req: { user } as unknown as PayloadRequest }
}

describe('Tags Foundation & Access Control', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('enforces collection access control rules for tags', () => {
    const activeSuperAdmin = { role: 'super_admin' as const, status: 'active' as const }
    const activeAdmin = { role: 'admin' as const, status: 'active' as const }
    const activeEditor = { role: 'editor' as const, status: 'active' as const }
    const inactiveUser = { role: 'admin' as const, status: 'inactive' as const }

    // Create
    expect(canCreateTag(makeReq(activeSuperAdmin))).toBe(true)
    expect(canCreateTag(makeReq(activeAdmin))).toBe(true)
    expect(canCreateTag(makeReq(activeEditor))).toBe(true)
    expect(canCreateTag(makeReq(inactiveUser))).toBe(false)
    expect(canCreateTag(makeReq(null))).toBe(false)

    // Read
    expect(canReadTag(makeReq(activeSuperAdmin))).toBe(true)
    expect(canReadTag(makeReq(activeAdmin))).toBe(true)
    expect(canReadTag(makeReq(activeEditor))).toBe(true)
    expect(canReadTag(makeReq(inactiveUser))).toBe(false)
    expect(canReadTag(makeReq(null))).toBe(false)

    // Update
    expect(canUpdateTag(makeReq(activeSuperAdmin))).toBe(true)
    expect(canUpdateTag(makeReq(activeAdmin))).toBe(true)
    expect(canUpdateTag(makeReq(activeEditor))).toBe(true)
    expect(canUpdateTag(makeReq(inactiveUser))).toBe(false)
    expect(canUpdateTag(makeReq(null))).toBe(false)

    // Delete (Editor MUST BE DENIED)
    expect(canDeleteTag(makeReq(activeSuperAdmin))).toBe(true)
    expect(canDeleteTag(makeReq(activeAdmin))).toBe(true)
    expect(canDeleteTag(makeReq(activeEditor))).toBe(false)
    expect(canDeleteTag(makeReq(inactiveUser))).toBe(false)
    expect(canDeleteTag(makeReq(null))).toBe(false)
  })

  it('creates tag with automatic slug generation', async () => {
    const ts = Date.now()
    const tag = await payload.create({
      collection: 'tags',
      data: {
        name: `Spring Boot ${ts}`,
        description: 'Java framework for microservices',
        status: 'active',
      },
    })

    expect(tag.id).toBeDefined()
    expect(tag.name).toBe(`Spring Boot ${ts}`)
    expect(tag.slug).toBe(`spring-boot-${ts}`)
    expect(tag.status).toBe('active')
  })

  it('allows custom manual slug and preserves custom slug on name change', async () => {
    const ts = Date.now()
    const customSlug = `artificial-intelligence-${ts}`

    const tag = await payload.create({
      collection: 'tags',
      data: {
        name: `AI ${ts}`,
        slug: customSlug,
      },
    })

    expect(tag.slug).toBe(customSlug)

    // Update name -> custom slug must remain artificial-intelligence-ts!
    const updatedTag = await payload.update({
      collection: 'tags',
      id: tag.id,
      data: {
        name: `Artificial Intelligence ${ts}`,
      },
    })

    expect(updatedTag.name).toBe(`Artificial Intelligence ${ts}`)
    expect(updatedTag.slug).toBe(customSlug)
  })

  it('updates auto-generated slug when tag name changes', async () => {
    const ts = Date.now()
    const tag = await payload.create({
      collection: 'tags',
      data: {
        name: `Machine Learning ${ts}`,
      },
    })

    expect(tag.slug).toBe(`machine-learning-${ts}`)

    const updated = await payload.update({
      collection: 'tags',
      id: tag.id,
      data: {
        name: `Deep Learning ${ts}`,
      },
    })

    expect(updated.slug).toBe(`deep-learning-${ts}`)
  })

  it('rejects duplicate slug creation', async () => {
    const slug = `unique-tag-slug-${Date.now()}`

    await payload.create({
      collection: 'tags',
      data: {
        name: 'First Tag',
        slug,
      },
    })

    await expect(
      payload.create({
        collection: 'tags',
        data: {
          name: 'Second Tag',
          slug,
        },
      }),
    ).rejects.toThrow(/already exists/)
  })

  it('rejects case-insensitive duplicate tag names (Java, java, JAVA)', async () => {
    const ts = Date.now()
    const baseName = `JavaTest-${ts}`

    await payload.create({
      collection: 'tags',
      data: {
        name: baseName,
      },
    })

    // Attempting lowercase "javatest-ts"
    await expect(
      payload.create({
        collection: 'tags',
        data: {
          name: baseName.toLowerCase(),
        },
      }),
    ).rejects.toThrow(/already exists/)

    // Attempting uppercase "JAVATEST-TS"
    await expect(
      payload.create({
        collection: 'tags',
        data: {
          name: baseName.toUpperCase(),
        },
      }),
    ).rejects.toThrow(/already exists/)
  })

  it('supports tag CRUD operations and filtering', async () => {
    const ts = Date.now()
    const tag = await payload.create({
      collection: 'tags',
      data: {
        name: `Cybersecurity ${ts}`,
        status: 'active',
      },
    })

    // Read by ID
    const readDoc = await payload.findByID({
      collection: 'tags',
      id: tag.id,
    })
    expect(readDoc.id).toBe(tag.id)

    // Filter by slug
    const bySlug = await payload.find({
      collection: 'tags',
      where: {
        slug: {
          equals: tag.slug,
        },
      },
    })
    expect(bySlug.docs.length).toBe(1)

    // Delete
    const deleteResult = await payload.delete({
      collection: 'tags',
      id: tag.id,
    })
    expect(deleteResult.id).toBe(tag.id)
  })

  it('supports multilingual (Hindi/English) search by name and slug', async () => {
    const ts = Date.now()
    const hindiTag = await payload.create({
      collection: 'tags',
      data: {
        name: `किसान योजना ${ts}`,
        status: 'active',
      },
    })

    const englishTag = await payload.create({
      collection: 'tags',
      data: {
        name: `Quantum Computing ${ts}`,
        status: 'active',
      },
    })

    // Search by Hindi name
    const hindiResult = await payload.find({
      collection: 'tags',
      where: {
        or: [
          { name: { contains: 'किसान' } },
          { slug: { contains: 'kisan' } },
        ],
      },
    })
    expect(hindiResult.docs.some((doc: any) => doc.id === hindiTag.id)).toBe(true)

    // Search by English slug
    const slugResult = await payload.find({
      collection: 'tags',
      where: {
        or: [
          { name: { contains: 'quantum' } },
          { slug: { contains: 'quantum-computing' } },
        ],
      },
    })
    expect(slugResult.docs.some((doc: any) => doc.id === englishTag.id)).toBe(true)
  })
})
