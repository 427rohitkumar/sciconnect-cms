import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect } from 'vitest'
import {
  canCreateMedia,
  canReadMedia,
  canUpdateMedia,
  canDeleteMedia,
} from '@/access/roles'

let payload: Payload

describe('Media Foundation & Access Control', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('enforces collection access control for media operations', () => {
    const activeSuperAdmin = { role: 'super_admin', status: 'active' }
    const activeAdmin = { role: 'admin', status: 'active' }
    const activeEditor = { role: 'editor', status: 'active' }
    const inactiveUser = { role: 'admin', status: 'inactive' }

    // Create access
    expect(canCreateMedia({ req: { user: activeSuperAdmin } as any })).toBe(true)
    expect(canCreateMedia({ req: { user: activeAdmin } as any })).toBe(true)
    expect(canCreateMedia({ req: { user: activeEditor } as any })).toBe(true)
    expect(canCreateMedia({ req: { user: inactiveUser } as any })).toBe(false)
    expect(canCreateMedia({ req: { user: null } as any })).toBe(false)

    // Read access
    expect(canReadMedia({ req: { user: activeSuperAdmin } as any })).toBe(true)
    expect(canReadMedia({ req: { user: activeAdmin } as any })).toBe(true)
    expect(canReadMedia({ req: { user: activeEditor } as any })).toBe(true)
    expect(canReadMedia({ req: { user: inactiveUser } as any })).toBe(false)
    expect(canReadMedia({ req: { user: null } as any })).toBe(false)

    // Update access
    expect(canUpdateMedia({ req: { user: activeSuperAdmin } as any })).toBe(true)
    expect(canUpdateMedia({ req: { user: activeAdmin } as any })).toBe(true)
    expect(canUpdateMedia({ req: { user: activeEditor } as any })).toBe(true)
    expect(canUpdateMedia({ req: { user: inactiveUser } as any })).toBe(false)
    expect(canUpdateMedia({ req: { user: null } as any })).toBe(false)

    // Delete access (Editor MUST BE DENIED)
    expect(canDeleteMedia({ req: { user: activeSuperAdmin } as any })).toBe(true)
    expect(canDeleteMedia({ req: { user: activeAdmin } as any })).toBe(true)
    expect(canDeleteMedia({ req: { user: activeEditor } as any })).toBe(false)
    expect(canDeleteMedia({ req: { user: inactiveUser } as any })).toBe(false)
    expect(canDeleteMedia({ req: { user: null } as any })).toBe(false)
  })

  it('creates, reads, updates, and deletes media document with metadata', async () => {
    // 1x1 transparent PNG buffer for testing local payload file upload
    const sampleBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    )

    const mediaDoc = await payload.create({
      collection: 'media',
      data: {
        alt: 'SciConnectWorld Hero Image',
        caption: 'Scientific Research Visualization',
        description: 'High resolution molecular rendering',
        credit: 'SciConnect Labs',
      },
      file: {
        data: sampleBuffer,
        name: 'sample-hero.png',
        mimetype: 'image/png',
        size: sampleBuffer.length,
      },
    })

    expect(mediaDoc.id).toBeDefined()
    expect(mediaDoc.alt).toBe('SciConnectWorld Hero Image')
    expect(mediaDoc.caption).toBe('Scientific Research Visualization')
    expect(mediaDoc.credit).toBe('SciConnect Labs')
    expect(mediaDoc.filename).toBeDefined()
    expect(mediaDoc.mimeType).toBe('image/png')

    // Read test
    const fetchedMedia = await payload.findByID({
      collection: 'media',
      id: mediaDoc.id,
    })
    expect(fetchedMedia.alt).toBe('SciConnectWorld Hero Image')

    // Update test
    const updatedMedia = await payload.update({
      collection: 'media',
      id: mediaDoc.id,
      data: {
        caption: 'Updated Scientific Caption',
      },
    })
    expect(updatedMedia.caption).toBe('Updated Scientific Caption')

    // Delete test
    const deleteResult = await payload.delete({
      collection: 'media',
      id: mediaDoc.id,
    })
    expect(deleteResult.id).toBe(mediaDoc.id)
  })

  it('links media asset as user avatar', async () => {
    const sampleBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    )

    const avatarMedia = await payload.create({
      collection: 'media',
      data: {
        alt: 'User Avatar Image',
      },
      file: {
        data: sampleBuffer,
        name: 'user-avatar.png',
        mimetype: 'image/png',
        size: sampleBuffer.length,
      },
    })

    const userWithAvatar = await payload.create({
      collection: 'users',
      data: {
        email: `avatar-user-${Date.now()}@sciconnect.world`,
        password: 'Password123!',
        name: 'Avatar User',
        role: 'editor',
        status: 'active',
        avatar: avatarMedia.id,
      },
    })

    expect(userWithAvatar.avatar).toBeDefined()

    const fetchedUser = await payload.findByID({
      collection: 'users',
      id: userWithAvatar.id,
      depth: 1,
    })

    expect(fetchedUser.avatar).toBeDefined()
    if (typeof fetchedUser.avatar === 'object' && fetchedUser.avatar !== null) {
      expect(fetchedUser.avatar.id).toBe(avatarMedia.id)
      expect(fetchedUser.avatar.alt).toBe('User Avatar Image')
    }
  })
})
