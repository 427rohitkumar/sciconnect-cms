import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect } from 'vitest'
import {
  canCreateMenuItem,
  canReadMenuItem,
  canUpdateMenuItem,
  canDeleteMenuItem,
} from '@/access/roles'
import { getMenuTree, getMenuByLocation } from '@/lib/navigation/getMenu'
import { resolveMenuItemUrl } from '@/lib/navigation/resolveMenuItemUrl'

let payload: Payload
let testMenuId: number | string

describe('MenuItems Foundation & Access Control', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    const menu = await payload.create({
      collection: 'menus' as any,
      data: {
        name: `Menu Items Test Menu ${Date.now()}`,
        status: 'active',
      },
    })
    testMenuId = menu.id
  })

  it('enforces collection access control rules for menu items', () => {
    const activeSuperAdmin = { role: 'super_admin', status: 'active' }
    const activeAdmin = { role: 'admin', status: 'active' }
    const activeEditor = { role: 'editor', status: 'active' }
    const inactiveUser = { role: 'admin', status: 'inactive' }

    expect(canCreateMenuItem({ req: { user: activeSuperAdmin } as any })).toBe(true)
    expect(canCreateMenuItem({ req: { user: inactiveUser } as any })).toBe(false)
    expect(canDeleteMenuItem({ req: { user: activeEditor } as any })).toBe(false) // Editor cannot delete
  })

  it('resolves internal article URL', async () => {
    const item = {
      linkType: 'internal',
      internalType: 'article',
      article: { slug: 'test-article-slug' },
    }
    expect(resolveMenuItemUrl(item)).toBe('/articles/test-article-slug')
  })

  it('resolves internal category URL', async () => {
    const item = {
      linkType: 'internal',
      internalType: 'category',
      category: { slug: 'test-cat-slug' },
    }
    expect(resolveMenuItemUrl(item)).toBe('/category/test-cat-slug')
  })

  it('resolves custom internal URL', async () => {
    const item = {
      linkType: 'internal',
      internalType: 'custom',
      customPath: '/about-us',
    }
    expect(resolveMenuItemUrl(item)).toBe('/about-us')
  })

  it('resolves external URL', async () => {
    const item = {
      linkType: 'external',
      externalUrl: 'https://example.com/external',
    }
    expect(resolveMenuItemUrl(item)).toBe('https://example.com/external')
  })

  it('creates top-level item', async () => {
    const item = await payload.create({
      collection: 'menu-items' as any,
      data: {
        label: 'Home',
        menu: testMenuId,
        linkType: 'internal',
        internalType: 'custom',
        customPath: '/',
        order: 0,
      },
    })
    expect(item.id).toBeDefined()
  })

  it('rejects self-parenting', async () => {
    const item = await payload.create({
      collection: 'menu-items' as any,
      data: {
        label: 'Self Parent Test',
        menu: testMenuId,
        linkType: 'external',
        externalUrl: 'https://example.com',
      },
    })

    await expect(
      payload.update({
        collection: 'menu-items' as any,
        id: item.id,
        data: {
          parent: item.id,
        },
      })
    ).rejects.toThrow(/cannot be its own parent/)
  })

  it('rejects cross-menu parenting', async () => {
    const otherMenu = await payload.create({
      collection: 'menus' as any,
      data: {
        name: `Other Menu ${Date.now()}`,
        status: 'active',
      },
    })

    const otherMenuItem = await payload.create({
      collection: 'menu-items' as any,
      data: {
        label: 'Other Menu Item',
        menu: otherMenu.id,
        linkType: 'external',
        externalUrl: 'https://example.com',
      },
    })

    await expect(
      payload.create({
        collection: 'menu-items' as any,
        data: {
          label: 'Cross Menu Item',
          menu: testMenuId,
          parent: otherMenuItem.id,
          linkType: 'external',
          externalUrl: 'https://example.com',
        },
      })
    ).rejects.toThrow(/Parent menu item must belong to the same menu/)
  })

  it('enforces maximum depth of 4', async () => {
    // Level 1
    const l1 = await payload.create({
      collection: 'menu-items' as any,
      data: { label: 'L1', menu: testMenuId, linkType: 'external', externalUrl: 'https://test.com' },
    })
    // Level 2
    const l2 = await payload.create({
      collection: 'menu-items' as any,
      data: { label: 'L2', menu: testMenuId, parent: l1.id, linkType: 'external', externalUrl: 'https://test.com' },
    })
    // Level 3
    const l3 = await payload.create({
      collection: 'menu-items' as any,
      data: { label: 'L3', menu: testMenuId, parent: l2.id, linkType: 'external', externalUrl: 'https://test.com' },
    })
    // Level 4
    const l4 = await payload.create({
      collection: 'menu-items' as any,
      data: { label: 'L4', menu: testMenuId, parent: l3.id, linkType: 'external', externalUrl: 'https://test.com' },
    })

    // Level 5 (Should Fail)
    await expect(
      payload.create({
        collection: 'menu-items' as any,
        data: { label: 'L5', menu: testMenuId, parent: l4.id, linkType: 'external', externalUrl: 'https://test.com' },
      })
    ).rejects.toThrow(/Maximum menu nesting depth of 4 exceeded/)
  })

  it('rejects invalid external URLs', async () => {
    await expect(
      payload.create({
        collection: 'menu-items' as any,
        data: {
          label: 'Invalid URL',
          menu: testMenuId,
          linkType: 'external',
          externalUrl: 'javascript:alert(1)',
        },
      })
    ).rejects.toThrow(/External URL must start with http:\/\/ or https:\/\//)
  })

  it('builds navigation tree correctly', async () => {
    const menu = await payload.create({
      collection: 'menus',
      data: {
        name: `Tree Menu ${Date.now()}`,
        status: 'active',
        locations: ['footer'],
      },
    })

    // Create unordered items
    const parent = await payload.create({
      collection: 'menu-items',
      data: { label: 'Parent', menu: menu.id, order: 10, linkType: 'custom', customPath: '/parent' } as any, // bypassing strict types for brevity
    })

    await payload.create({
      collection: 'menu-items',
      data: { label: 'First Child', menu: menu.id, parent: parent.id, order: 1, linkType: 'custom', customPath: '/child1' } as any,
    })

    await payload.create({
      collection: 'menu-items',
      data: { label: 'Second Child', menu: menu.id, parent: parent.id, order: 2, linkType: 'custom', customPath: '/child2' } as any,
    })

    const tree = await getMenuTree(menu.id)
    
    expect(tree).toBeDefined()
    expect(tree.length).toBe(1)
    expect(tree[0].label).toBe('Parent')
    expect(tree[0].children.length).toBe(2)
    expect(tree[0].children[0].label).toBe('First Child')
    expect(tree[0].children[1].label).toBe('Second Child')
  })
})
