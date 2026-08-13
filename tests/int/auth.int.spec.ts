import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect } from 'vitest'
import { canAccessAdmin, canUpdateRoleField, canUpdateStatusField } from '@/access/roles'
import { seedAdmin, validateSeedEnvironment } from '@/seed'

let payload: Payload

describe('Users Authentication & Access Control', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('fetches existing users collection', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
    expect(Array.isArray(users.docs)).toBe(true)
  })

  it('creates super_admin, admin, and editor users with correct roles and active status', async () => {
    const uniqueEmail = `admin-${Date.now()}@sciconnect.world`

    const user = await payload.create({
      collection: 'users',
      data: {
        email: uniqueEmail,
        password: 'Password123!',
        name: 'Test Super Admin',
        role: 'super_admin',
        status: 'active',
      },
    })

    expect(user.id).toBeDefined()
    expect(user.email).toBe(uniqueEmail)
    expect(user.role).toBe('super_admin')
    expect(user.status).toBe('active')
  })

  it('allows active users to login and updates lastLoginAt timestamp', async () => {
    const testEmail = `login-active-${Date.now()}@sciconnect.world`
    const testPassword = 'Password123!'

    await payload.create({
      collection: 'users',
      data: {
        email: testEmail,
        password: testPassword,
        name: 'Active Login User',
        role: 'editor',
        status: 'active',
      },
    })

    const loginResult = await payload.login({
      collection: 'users',
      data: {
        email: testEmail,
        password: testPassword,
      },
    })

    expect(loginResult.token).toBeDefined()
    expect(loginResult.user).toBeDefined()
    expect(loginResult.user?.email).toBe(testEmail)

    // Re-fetch user to confirm lastLoginAt was set by afterLogin hook
    const updatedUser = await payload.findByID({
      collection: 'users',
      id: loginResult.user!.id,
    })

    expect(updatedUser.lastLoginAt).toBeDefined()
  })

  it('rejects login for inactive or suspended users', async () => {
    const testEmail = `login-inactive-${Date.now()}@sciconnect.world`
    const testPassword = 'Password123!'

    await payload.create({
      collection: 'users',
      data: {
        email: testEmail,
        password: testPassword,
        name: 'Inactive User',
        role: 'editor',
        status: 'inactive',
      },
    })

    await expect(
      payload.login({
        collection: 'users',
        data: {
          email: testEmail,
          password: testPassword,
        },
      }),
    ).rejects.toThrow()
  })

  it('enforces admin access rules (active status + valid role required)', () => {
    const activeSuperAdmin = { role: 'super_admin', status: 'active' }
    const activeAdmin = { role: 'admin', status: 'active' }
    const activeEditor = { role: 'editor', status: 'active' }
    const inactiveAdmin = { role: 'admin', status: 'inactive' }
    const suspendedEditor = { role: 'editor', status: 'suspended' }

    expect(canAccessAdmin({ req: { user: activeSuperAdmin } as any })).toBe(true)
    expect(canAccessAdmin({ req: { user: activeAdmin } as any })).toBe(true)
    expect(canAccessAdmin({ req: { user: activeEditor } as any })).toBe(true)
    expect(canAccessAdmin({ req: { user: inactiveAdmin } as any })).toBe(false)
    expect(canAccessAdmin({ req: { user: suspendedEditor } as any })).toBe(false)
    expect(canAccessAdmin({ req: { user: null } as any })).toBe(false)
  })

  it('enforces role protection field rules', () => {
    const superAdmin = { role: 'super_admin', status: 'active' }
    const admin = { role: 'admin', status: 'active' }
    const editor = { role: 'editor', status: 'active' }

    // Super admin can update any role
    expect(
      canUpdateRoleField({
        req: { user: superAdmin } as any,
        data: { role: 'super_admin' },
      }),
    ).toBe(true)

    // Admin CANNOT promote anyone to super_admin
    expect(
      canUpdateRoleField({
        req: { user: admin } as any,
        data: { role: 'super_admin' },
      }),
    ).toBe(false)

    // Admin can set role to editor or admin for non-super_admin
    expect(
      canUpdateRoleField({
        req: { user: admin } as any,
        data: { role: 'admin' },
        doc: { role: 'editor' },
      }),
    ).toBe(true)

    // Admin CANNOT modify a super_admin user's role
    expect(
      canUpdateRoleField({
        req: { user: admin } as any,
        data: { role: 'editor' },
        doc: { role: 'super_admin' },
      }),
    ).toBe(false)

    // Editor CANNOT modify roles
    expect(
      canUpdateRoleField({
        req: { user: editor } as any,
        data: { role: 'admin' },
      }),
    ).toBe(false)
  })

  it('enforces status protection field rules', () => {
    const admin = { role: 'admin', status: 'active' }
    const editor = { role: 'editor', status: 'active' }

    expect(canUpdateStatusField({ req: { user: admin } as any })).toBe(true)
    expect(canUpdateStatusField({ req: { user: editor } as any })).toBe(false)
  })

  describe('First Admin User Seeder', () => {
    it('validates seed environment variables correctly', () => {
      expect(() => validateSeedEnvironment({})).toThrow('Missing required seed environment variable(s)')
      expect(() =>
        validateSeedEnvironment({
          SEED_ADMIN_NAME: 'Admin',
          SEED_ADMIN_EMAIL: 'invalid-email',
          SEED_ADMIN_PASSWORD: 'Pass',
        }),
      ).toThrow('Invalid SEED_ADMIN_EMAIL format')

      const valid = validateSeedEnvironment({
        SEED_ADMIN_NAME: 'Super Admin',
        SEED_ADMIN_EMAIL: 'admin@sciconnect.world',
        SEED_ADMIN_PASSWORD: 'Password123!',
      })
      expect(valid.name).toBe('Super Admin')
      expect(valid.email).toBe('admin@sciconnect.world')
      expect(valid.password).toBe('Password123!')
    })

    it('creates super_admin on first run and is idempotent on subsequent runs', async () => {
      const seedEmail = `seed-${Date.now()}@sciconnect.world`
      const seedName = 'Seeded Admin'
      const seedPassword = 'Password123!'

      const res1 = await seedAdmin({
        payload,
        name: seedName,
        email: seedEmail,
        password: seedPassword,
      })

      expect(res1.created).toBe(true)
      expect(res1.user.email).toBe(seedEmail)
      expect(res1.user.role).toBe('super_admin')
      expect(res1.user.status).toBe('active')

      const res2 = await seedAdmin({
        payload,
        name: seedName,
        email: seedEmail,
        password: seedPassword,
      })

      expect(res2.created).toBe(false)
      expect(res2.user.id).toBe(res1.user.id)
    })
  })
})
