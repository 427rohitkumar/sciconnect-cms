import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect } from 'vitest'
import {
  canCreateCategory,
  canReadCategory,
  canUpdateCategory,
  canDeleteCategory,
} from '@/access/roles'
import { toKebabCase, getParentId } from '@/collections/Categories'

let payload: Payload

describe('Categories Foundation & Access Control', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('verifies helper functions toKebabCase and getParentId', () => {
    expect(toKebabCase('Artificial Intelligence')).toBe('artificial-intelligence')
    expect(toKebabCase('  Data Science & AI  ')).toBe('data-science-ai')

    expect(getParentId(null)).toBeNull()
    expect(getParentId(123)).toBe(123)
    expect(getParentId('cat-id-1')).toBe('cat-id-1')
    expect(getParentId({ id: 456, name: 'Parent Cat' })).toBe(456)
  })

  it('enforces collection access control rules for categories', () => {
    const activeSuperAdmin = { role: 'super_admin', status: 'active' }
    const activeAdmin = { role: 'admin', status: 'active' }
    const activeEditor = { role: 'editor', status: 'active' }
    const inactiveUser = { role: 'admin', status: 'inactive' }

    // Create
    expect(canCreateCategory({ req: { user: activeSuperAdmin } as any })).toBe(true)
    expect(canCreateCategory({ req: { user: activeAdmin } as any })).toBe(true)
    expect(canCreateCategory({ req: { user: activeEditor } as any })).toBe(true)
    expect(canCreateCategory({ req: { user: inactiveUser } as any })).toBe(false)
    expect(canCreateCategory({ req: { user: null } as any })).toBe(false)

    // Read
    expect(canReadCategory({ req: { user: activeSuperAdmin } as any })).toBe(true)
    expect(canReadCategory({ req: { user: activeAdmin } as any })).toBe(true)
    expect(canReadCategory({ req: { user: activeEditor } as any })).toBe(true)
    expect(canReadCategory({ req: { user: inactiveUser } as any })).toBe(false)
    expect(canReadCategory({ req: { user: null } as any })).toBe(false)

    // Update
    expect(canUpdateCategory({ req: { user: activeSuperAdmin } as any })).toBe(true)
    expect(canUpdateCategory({ req: { user: activeAdmin } as any })).toBe(true)
    expect(canUpdateCategory({ req: { user: activeEditor } as any })).toBe(true)
    expect(canUpdateCategory({ req: { user: inactiveUser } as any })).toBe(false)
    expect(canUpdateCategory({ req: { user: null } as any })).toBe(false)

    // Delete (Editor MUST BE DENIED)
    expect(canDeleteCategory({ req: { user: activeSuperAdmin } as any })).toBe(true)
    expect(canDeleteCategory({ req: { user: activeAdmin } as any })).toBe(true)
    expect(canDeleteCategory({ req: { user: activeEditor } as any })).toBe(false)
    expect(canDeleteCategory({ req: { user: inactiveUser } as any })).toBe(false)
    expect(canDeleteCategory({ req: { user: null } as any })).toBe(false)
  })

  it('creates top-level category with automatic slug generation', async () => {
    const name = `Technology ${Date.now()}`
    const category = await payload.create({
      collection: 'categories',
      data: {
        name,
        description: 'Technology related articles and scientific advances',
        status: 'active',
      },
    })

    expect(category.id).toBeDefined()
    expect(category.name).toBe(name)
    expect(category.slug).toBe(toKebabCase(name))
    expect(category.parent).toBeNull()
    expect(category.status).toBe('active')
  })

  it('creates child and deeply nested categories (A -> B -> C -> D)', async () => {
    const ts = Date.now()

    // Level 1 (Top Level)
    const catA = await payload.create({
      collection: 'categories',
      data: {
        name: `Tech Level A ${ts}`,
      },
    })

    // Level 2 (Subcategory)
    const catB = await payload.create({
      collection: 'categories',
      data: {
        name: `Programming Level B ${ts}`,
        parent: catA.id,
      },
    })

    // Level 3 (Deeply Nested)
    const catC = await payload.create({
      collection: 'categories',
      data: {
        name: `Python Level C ${ts}`,
        parent: catB.id,
      },
    })

    // Level 4 (Deeply Nested)
    const catD = await payload.create({
      collection: 'categories',
      data: {
        name: `Django Level D ${ts}`,
        parent: catC.id,
      },
    })

    expect(getParentId(catB.parent)).toBe(catA.id)
    expect(getParentId(catC.parent)).toBe(catB.id)
    expect(getParentId(catD.parent)).toBe(catC.id)
  })

  it('allows and preserves custom manual slug', async () => {
    const customSlug = `custom-slug-${Date.now()}`
    const category = await payload.create({
      collection: 'categories',
      data: {
        name: 'Artificial Intelligence & Machine Learning',
        slug: customSlug,
      },
    })

    expect(category.slug).toBe(customSlug)
  })

  it('rejects creation of category with duplicate slug', async () => {
    const slug = `duplicate-test-slug-${Date.now()}`

    await payload.create({
      collection: 'categories',
      data: {
        name: 'Unique Category One',
        slug,
      },
    })

    await expect(
      payload.create({
        collection: 'categories',
        data: {
          name: 'Unique Category Two',
          slug,
        },
      }),
    ).rejects.toThrow(/already exists/)
  })

  it('rejects self-parenting (A -> A)', async () => {
    const category = await payload.create({
      collection: 'categories',
      data: {
        name: `Self Parent Test ${Date.now()}`,
      },
    })

    await expect(
      payload.update({
        collection: 'categories',
        id: category.id,
        data: {
          parent: category.id,
        },
      }),
    ).rejects.toThrow(/cannot be its own parent/)
  })

  it('rejects 2-level circular parent relationship (A -> B -> A)', async () => {
    const ts = Date.now()
    const catA = await payload.create({
      collection: 'categories',
      data: { name: `Circ A ${ts}` },
    })

    const catB = await payload.create({
      collection: 'categories',
      data: { name: `Circ B ${ts}`, parent: catA.id },
    })

    // Update catA's parent to catB -> creates A -> B -> A cycle!
    await expect(
      payload.update({
        collection: 'categories',
        id: catA.id,
        data: {
          parent: catB.id,
        },
      }),
    ).rejects.toThrow(/Circular parent relationship/)
  })

  it('rejects 3-level circular parent relationship (A -> B -> C -> A)', async () => {
    const ts = Date.now()
    const catA = await payload.create({
      collection: 'categories',
      data: { name: `Deep Circ A ${ts}` },
    })

    const catB = await payload.create({
      collection: 'categories',
      data: { name: `Deep Circ B ${ts}`, parent: catA.id },
    })

    const catC = await payload.create({
      collection: 'categories',
      data: { name: `Deep Circ C ${ts}`, parent: catB.id },
    })

    // Update catA's parent to catC -> creates A -> B -> C -> A cycle!
    await expect(
      payload.update({
        collection: 'categories',
        id: catA.id,
        data: {
          parent: catC.id,
        },
      }),
    ).rejects.toThrow(/Circular parent relationship/)
  })

  it('supports category update and deletion', async () => {
    const category = await payload.create({
      collection: 'categories',
      data: {
        name: `Updatable Cat ${Date.now()}`,
      },
    })

    const updated = await payload.update({
      collection: 'categories',
      id: category.id,
      data: {
        description: 'Updated description text',
      },
    })

    expect(updated.description).toBe('Updated description text')

    const deleted = await payload.delete({
      collection: 'categories',
      id: category.id,
    })

    expect(deleted.id).toBe(category.id)
  })

  it('queries and filters categories by slug, status, and parent', async () => {
    const ts = Date.now()
    const parentCat = await payload.create({
      collection: 'categories',
      data: {
        name: `Filter Parent ${ts}`,
        status: 'active',
      },
    })

    const childCat = await payload.create({
      collection: 'categories',
      data: {
        name: `Filter Child ${ts}`,
        parent: parentCat.id,
        status: 'active',
      },
    })

    // Filter by slug
    const bySlug = await payload.find({
      collection: 'categories',
      where: {
        slug: {
          equals: childCat.slug,
        },
      },
    })
    expect(bySlug.docs.length).toBe(1)
    expect(bySlug.docs[0].id).toBe(childCat.id)

    // Filter by parent
    const byParent = await payload.find({
      collection: 'categories',
      where: {
        parent: {
          equals: parentCat.id,
        },
      },
    })
    expect(byParent.docs.length).toBeGreaterThanOrEqual(1)
    expect(byParent.docs.some((doc) => doc.id === childCat.id)).toBe(true)
  })
})
