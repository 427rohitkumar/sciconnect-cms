import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
let superAdmin: any
let editor: any

describe('SiteSettings Global', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    // Setup users for roles
    superAdmin = await payload.create({
      collection: 'users',
      data: {
        name: 'Settings Super Admin',
        email: `settings-superadmin-${Date.now()}@example.com`,
        password: 'password',
        role: 'super_admin',
        status: 'active',
      },
    })

    editor = await payload.create({
      collection: 'users',
      data: {
        name: 'Settings Editor',
        email: `settings-editor-${Date.now()}@example.com`,
        password: 'password',
        role: 'editor',
        status: 'active',
      },
    })
  })

  afterAll(async () => {
    // Cleanup
    await payload.delete({
      collection: 'users',
      where: {
        id: { in: [superAdmin.id, editor.id] }
      }
    })
  })

  it('allows super_admin to read SiteSettings', async () => {
    const settings = await payload.findGlobal({
      slug: 'site-settings',
      user: superAdmin,
    })
    expect(settings).toBeDefined()
  })

  it('allows editor to read SiteSettings', async () => {
    const settings = await payload.findGlobal({
      slug: 'site-settings',
      user: editor,
    })
    expect(settings).toBeDefined()
  })

  it('allows super_admin to update SiteSettings', async () => {
    const updated = await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        siteName: 'Updated Name',
      },
      user: superAdmin,
    })
    expect(updated.siteName).toBe('Updated Name')
  })

  it('denies editor from updating SiteSettings', async () => {
    await expect(
      payload.updateGlobal({
        slug: 'site-settings',
        data: {
          siteName: 'Hacked Name',
        },
        user: editor,
      })
    ).rejects.toThrow()
  })

  it('validates theme hex colors', async () => {
    await expect(
      payload.updateGlobal({
        slug: 'site-settings',
        data: {
          primaryColor: 'invalid-color',
        },
        user: superAdmin,
      })
    ).rejects.toThrow(/Must be a valid HEX color code/)
    
    // Should pass
    const updated = await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        primaryColor: '#ff0000',
      },
      user: superAdmin,
    })
    expect(updated.primaryColor).toBe('#ff0000')
  })

  it('validates meta properties', async () => {
    await expect(
      payload.updateGlobal({
        slug: 'site-settings',
        data: {
          metaTitle: 'A'.repeat(61), // Exceeds 60
        },
        user: superAdmin,
      })
    ).rejects.toThrow()
  })

  it('validates site URL', async () => {
    await expect(
      payload.updateGlobal({
        slug: 'site-settings',
        data: {
          siteUrl: 'invalid-url',
        },
        user: superAdmin,
      })
    ).rejects.toThrow(/Must be a valid absolute URL/)
    
    await expect(
      payload.updateGlobal({
        slug: 'site-settings',
        data: {
          siteUrl: 'ftp://example.com',
        },
        user: superAdmin,
      })
    ).rejects.toThrow(/Must start with http:\/\/ or https:\/\//)
  })

  it('validates GA4 ID when enabled', async () => {
    // Fails because it does not match G-XXXX
    await expect(
      payload.updateGlobal({
        slug: 'site-settings',
        data: {
          googleAnalyticsEnabled: true,
          ga4Id: 'invalid-id',
        },
        user: superAdmin,
      })
    ).rejects.toThrow(/Must match format/)

    // Passes
    const updated = await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        googleAnalyticsEnabled: true,
        ga4Id: 'G-1234567890',
      },
      user: superAdmin,
    })
    expect(updated.ga4Id).toBe('G-1234567890')
  })

  it('validates GTM ID when enabled', async () => {
    // Fails because it does not match GTM-XXXX
    await expect(
      payload.updateGlobal({
        slug: 'site-settings',
        data: {
          googleTagManagerEnabled: true,
          gtmId: 'invalid-gtm',
        },
        user: superAdmin,
      })
    ).rejects.toThrow(/Must match format/)

    // Passes
    const updated = await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        googleTagManagerEnabled: true,
        gtmId: 'GTM-ABCDEFG',
      },
      user: superAdmin,
    })
    expect(updated.gtmId).toBe('GTM-ABCDEFG')
  })
})
