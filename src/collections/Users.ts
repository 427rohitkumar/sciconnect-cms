import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import {
  canAccessAdmin,
  canCreateRoleField,
  canCreateUser,
  canDeleteUser,
  canReadUsers,
  canUpdateRoleField,
  canUpdateStatusField,
  canUpdateUser,
  isSuperAdminOrAdmin,
} from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    group: 'Users',
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role', 'status', 'lastLoginAt'],
  },
  auth: {
    tokenExpiration: process.env.AUTH_TOKEN_EXPIRATION
      ? parseInt(process.env.AUTH_TOKEN_EXPIRATION, 10)
      : 28800,
    maxLoginAttempts: process.env.AUTH_MAX_LOGIN_ATTEMPTS
      ? parseInt(process.env.AUTH_MAX_LOGIN_ATTEMPTS, 10)
      : 5,
    lockTime: process.env.AUTH_LOCK_TIME
      ? parseInt(process.env.AUTH_LOCK_TIME, 10)
      : 600000,
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    },
    verify:
      process.env.AUTH_VERIFY_EMAIL === 'true'
        ? {
            generateEmailHTML: (args) => {
              const token = args?.token || ''
              const user = args?.user
              const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
              const url = `${serverUrl}/admin/verify-email?token=${token}`
              return `<p>Hello ${user?.name || user?.email || 'User'},</p><p>Please verify your email address by clicking <a href="${url}">here</a>.</p>`
            },
          }
        : false,
    forgotPassword: {
      generateEmailHTML: (args) => {
        const token = args?.token || ''
        const user = args?.user
        const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
        const resetPasswordURL = `${serverUrl}/admin/reset-password?token=${token}`
        return `<p>Hello ${user?.name || user?.email || 'User'},</p><p>Please reset your password by clicking <a href="${resetPasswordURL}">here</a>.</p>`
      },
    },
  },
  access: {
    admin: canAccessAdmin,
    create: canCreateUser,
    read: canReadUsers,
    update: canUpdateUser,
    delete: canDeleteUser,
    unlock: ({ req: { user } }) => Boolean(user && isSuperAdminOrAdmin(user)),
  },
  hooks: {
    beforeLogin: [
      ({ user, req }) => {
        if (user && user.status !== 'active') {
          req.payload.logger.warn(`Rejected login attempt for non-active user ID ${user.id}`)
          throw new APIError(
            'Your account is currently inactive or suspended. Please contact an administrator.',
            403,
          )
        }
      },
    ],
    afterLogin: [
      ({ user, req }) => {
        setImmediate(async () => {
          try {
            await req.payload.update({
              collection: 'users',
              id: user.id,
              data: {
                lastLoginAt: new Date().toISOString(),
              },
              overrideAccess: true,
            })
          } catch (err) {
            req.payload.logger.error(`Failed to update lastLoginAt for user ${user.id}: ${err}`)
          }
        })
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Super Admin', value: 'super_admin' },
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: {
        create: canCreateRoleField,
        update: canUpdateRoleField,
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Suspended', value: 'suspended' },
      ],
      access: {
        update: canUpdateStatusField,
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'lastLoginAt',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      access: {
        create: () => false,
        update: () => false,
      },
    },
  ],
}
