import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect } from 'vitest'
import {
  canCreateMenu,
  canReadMenu,
  canUpdateMenu,
  canDeleteMenu,
} from '@/access/roles'

let payload: Payload

describe('Menus Foundation & Access Control', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('enforces collection access control rules for menus', () => {
    const activeSuperAdmin = { role: 'super_admin', status: 'active' }
    const activeAdmin = { role: 'admin', status: 'active' }
    const activeEditor = { role: 'editor', status: 'active' }
    const inactiveUser = { role: 'admin', status: 'inactive' }

    // Create
    expect(canCreateMenu({ req: { user: activeSuperAdmin } as any })).toBe(true)
    expect(canCreateMenu({ req: { user: activeAdmin } as any })).toBe(true)
    expect(canCreateMenu({ req: { user: activeEditor } as any })).toBe(true)
    expect(canCreateMenu({ req: { user: inactiveUser } as any })).toBe(false)
    expect(canCreateMenu({ req: { user: null } as any })).toBe(false)

    // Read
    expect(canReadMenu({ req: { user: activeSuperAdmin } as any })).toBe(true)
    expect(canReadMenu({ req: { user: activeAdmin } as any })).toBe(true)
    expect(canReadMenu({ req: { user: activeEditor } as any })).toBe(true)
    expect(canReadMenu({ req: { user: inactiveUser } as any })).toBe(false)
    expect(canReadMenu({ req: { user: null } as any })).toBe(false)

    // Update
    expect(canUpdateMenu({ req: { user: activeSuperAdmin } as any })).toBe(true)
    expect(canUpdateMenu({ req: { user: activeAdmin } as any })).toBe(true)
    expect(canUpdateMenu({ req: { user: activeEditor } as any })).toBe(true)
    expect(canUpdateMenu({ req: { user: inactiveUser } as any })).toBe(false)
    expect(canUpdateMenu({ req: { user: null } as any })).toBe(false)

    // Delete (Editor MUST BE DENIED)
    expect(canDeleteMenu({ req: { user: activeSuperAdmin } as any })).toBe(true)
    expect(canDeleteMenu({ req: { user: activeAdmin } as any })).toBe(true)
    expect(canDeleteMenu({ req: { user: activeEditor } as any })).toBe(false)
    expect(canDeleteMenu({ req: { user: inactiveUser } as any })).toBe(false)
    expect(canDeleteMenu({ req: { user: null } as any })).toBe(false)
  })

  it('creates menu with automatic slug generation', async () => {
    const name = `Primary Header ${Date.now()}`
    const menu = await payload.create({
      collection: 'menus' as any,
      data: {
        name,
        locations: ['header'],
        status: 'active',
      },
    })

    expect(menu.id).toBeDefined()
    expect(menu.name).toBe(name)
    expect(menu.slug).toMatch(/^primary-header-/)
  })

  it('preserves manual slug customization', async () => {
    const customSlug = `custom-header-slug-${Date.now()}`
    const menu = await payload.create({
      collection: 'menus' as any,
      data: {
        name: 'Manual Slug Menu',
        slug: customSlug,
        status: 'active',
      },
    })

    expect(menu.slug).toBe(customSlug)
  })

  it('rejects duplicate location assignment for active menus', async () => {
    // Create first active header menu
    await payload.create({
      collection: 'menus' as any,
      data: {
        name: `Header A ${Date.now()}`,
        locations: ['header'],
        status: 'active',
      },
    })

    // Attempt to create second active header menu
    await expect(
      payload.create({
        collection: 'menus' as any,
        data: {
          name: `Header B ${Date.now()}`,
          locations: ['header'],
          status: 'active',
        },
      })
    ).rejects.toThrow(/Cannot assign this menu to "header" because another active menu is already assigned/)
  })

  it('blocks deletion of menu if it contains menu items', async () => {
    const menu = await payload.create({
      collection: 'menus' as any,
      data: {
        name: `Menu with Items ${Date.now()}`,
        status: 'active',
      },
    })

    await payload.create({
      collection: 'menu-items' as any,
      data: {
        label: 'Child Item',
        menu: menu.id,
        linkType: 'external',
        externalUrl: 'https://example.com',
      },
    })

    await expect(
      payload.delete({
        collection: 'menus' as any,
        id: menu.id,
      })
    ).rejects.toThrow(/Cannot delete this menu because it contains menu items/)
  })
})
