import type { Access, FieldAccess, PayloadRequest, Where } from 'payload'

export type UserRole = 'super_admin' | 'admin' | 'editor'
export type UserStatus = 'active' | 'inactive' | 'suspended'

export const isSuperAdmin = (user: any): boolean => {
  return Boolean(user && user.role === 'super_admin')
}

export const isAdmin = (user: any): boolean => {
  return Boolean(user && user.role === 'admin')
}

export const isSuperAdminOrAdmin = (user: any): boolean => {
  return Boolean(user && (user.role === 'super_admin' || user.role === 'admin'))
}

export const isActive = (user: any): boolean => {
  return Boolean(user && user.status === 'active')
}

/**
 * Access control for Payload Admin Panel access.
 * Required: authenticated user + status === 'active' + role in [super_admin, admin, editor].
 */
export const canAccessAdmin = ({ req: { user } }: { req: PayloadRequest }): boolean => {
  if (!user) return false
  const validRoles: UserRole[] = ['super_admin', 'admin', 'editor']
  return isActive(user) && validRoles.includes(user.role as UserRole)
}

/**
 * Collection-level access: Create users
 */
export const canCreateUser: Access = ({ req: { user } }) => {
  if (!user) return false
  if (!isActive(user)) return false
  return isSuperAdminOrAdmin(user)
}

/**
 * Collection-level access: Read users
 */
export const canReadUsers: Access = ({ req: { user } }) => {
  if (!user) return false
  if (!isActive(user)) return false
  if (isSuperAdminOrAdmin(user)) return true
  const query: Where = {
    id: {
      equals: user.id,
    },
  }
  return query
}

/**
 * Collection-level access: Update users
 */
export const canUpdateUser: Access = ({ req: { user } }) => {
  if (!user) return false
  if (!isActive(user)) return false
  if (isSuperAdmin(user)) return true
  if (isAdmin(user)) {
    const adminQuery: Where = {
      role: {
        not_equals: 'super_admin',
      },
    }
    return adminQuery
  }
  const selfQuery: Where = {
    id: {
      equals: user.id,
    },
  }
  return selfQuery
}

/**
 * Collection-level access: Delete users
 */
export const canDeleteUser: Access = ({ req: { user } }) => {
  if (!user) return false
  if (!isActive(user)) return false
  if (isSuperAdmin(user)) return true
  if (isAdmin(user)) {
    const deleteQuery: Where = {
      and: [
        {
          role: {
            not_equals: 'super_admin',
          },
        },
        {
          id: {
            not_equals: user.id,
          },
        },
      ],
    }
    return deleteQuery
  }
  return false
}

/**
 * Field-level access: Create Role
 */
export const canCreateRoleField: FieldAccess = ({ req: { user }, data }) => {
  if (!user) return true // Allow initial first user creation flow
  if (!isActive(user)) return false
  if (isSuperAdmin(user)) return true
  if (isAdmin(user)) {
    return data?.role !== 'super_admin'
  }
  return false
}

/**
 * Field-level access: Update Role
 */
export const canUpdateRoleField: FieldAccess = ({ req: { user }, data, doc }) => {
  if (!user || !isActive(user)) return false
  if (isSuperAdmin(user)) return true
  if (isAdmin(user)) {
    if (data?.role === 'super_admin') return false
    if (doc?.role === 'super_admin') return false
    return true
  }
  return false
}

/**
 * Field-level access: Update Status
 */
export const canUpdateStatusField: FieldAccess = ({ req: { user } }) => {
  if (!user || !isActive(user)) return false
  return isSuperAdminOrAdmin(user)
}

/**
 * Media access: Create media (super_admin, admin, editor)
 */
export const canCreateMedia: Access = ({ req: { user } }) => {
  if (!user || !isActive(user)) return false
  const validRoles: UserRole[] = ['super_admin', 'admin', 'editor']
  return validRoles.includes(user.role as UserRole)
}

/**
 * Media access: Read media (Public)
 */
export const canReadMedia: Access = () => {
  return true
}

/**
 * Media access: Update media (super_admin, admin, editor)
 */
export const canUpdateMedia: Access = ({ req: { user } }) => {
  if (!user || !isActive(user)) return false
  const validRoles: UserRole[] = ['super_admin', 'admin', 'editor']
  return validRoles.includes(user.role as UserRole)
}

/**
 * Media access: Delete media (super_admin, admin ONLY; editor denied)
 */
export const canDeleteMedia: Access = ({ req: { user } }) => {
  if (!user || !isActive(user)) return false
  return isSuperAdminOrAdmin(user)
}

/**
 * Category access: Create category (super_admin, admin, editor)
 */
export const canCreateCategory: Access = ({ req: { user } }) => {
  if (!user || !isActive(user)) return false
  const validRoles: UserRole[] = ['super_admin', 'admin', 'editor']
  return validRoles.includes(user.role as UserRole)
}

/**
 * Category access: Read (Public for active categories)
 */
export const canReadCategory: Access = ({ req: { user } }) => {
  if (user && isActive(user)) {
    const validRoles: UserRole[] = ['super_admin', 'admin', 'editor']
    if (validRoles.includes(user.role as UserRole)) {
      return true
    }
  }
  return {
    status: {
      equals: 'active',
    },
  } as Where
}

/**
 * Category access: Update category (super_admin, admin, editor)
 */
export const canUpdateCategory: Access = ({ req: { user } }) => {
  if (!user || !isActive(user)) return false
  const validRoles: UserRole[] = ['super_admin', 'admin', 'editor']
  return validRoles.includes(user.role as UserRole)
}

/**
 * Category access: Delete category (super_admin, admin ONLY; editor denied)
 */
export const canDeleteCategory: Access = ({ req: { user } }) => {
  if (!user || !isActive(user)) return false
  return isSuperAdminOrAdmin(user)
}

/**
 * Tag access: Create tag (super_admin, admin, editor)
 */
export const canCreateTag: Access = ({ req: { user } }) => {
  if (!user || !isActive(user)) return false
  const validRoles: UserRole[] = ['super_admin', 'admin', 'editor']
  return validRoles.includes(user.role as UserRole)
}

/**
 * Tag access: Read tag (Public)
 */
export const canReadTag: Access = () => {
  return true
}

/**
 * Tag access: Update tag (super_admin, admin, editor)
 */
export const canUpdateTag: Access = ({ req: { user } }) => {
  if (!user || !isActive(user)) return false
  const validRoles: UserRole[] = ['super_admin', 'admin', 'editor']
  return validRoles.includes(user.role as UserRole)
}

/**
 * Tag access: Delete tag (super_admin, admin ONLY; editor denied)
 */
export const canDeleteTag: Access = ({ req: { user } }) => {
  if (!user || !isActive(user)) return false
  return isSuperAdminOrAdmin(user)
}

/**
 * Article access: Create article (super_admin, admin, editor)
 */
export const canCreateArticle: Access = ({ req: { user } }) => {
  if (!user || !isActive(user)) return false
  const validRoles: UserRole[] = ['super_admin', 'admin', 'editor']
  return validRoles.includes(user.role as UserRole)
}

/**
 * Article access: Read article
 * - CMS staff (super_admin, admin, editor): Can read any article (including drafts)
 * - Public / Unauthenticated: Can read ONLY published articles with active categories
 */
export const canReadArticle: Access = ({ req: { user } }) => {
  if (user && isActive(user)) {
    const validRoles: UserRole[] = ['super_admin', 'admin', 'editor']
    if (validRoles.includes(user.role as UserRole)) {
      return true
    }
  }

  return {
    and: [
      {
        _status: {
          equals: 'published',
        },
      },
      {
        'categories.status': {
          equals: 'active',
        },
      },
    ],
  } as Where
}

/**
 * Article access: Update article (super_admin, admin, editor)
 */
export const canUpdateArticle: Access = ({ req: { user } }) => {
  if (!user || !isActive(user)) return false
  const validRoles: UserRole[] = ['super_admin', 'admin', 'editor']
  return validRoles.includes(user.role as UserRole)
}

/**
 * Article access: Delete article (super_admin, admin ONLY; editor denied)
 */
export const canDeleteArticle: Access = ({ req: { user } }) => {
  if (!user || !isActive(user)) return false
  return isSuperAdminOrAdmin(user)
}

/**
 * Field-level access: Update Author
 * Allows super_admin and admin to reassign author; editors cannot reassign author.
 */
export const canUpdateAuthorField: FieldAccess = ({ req: { user } }) => {
  if (!user || !isActive(user)) return false
  return isSuperAdminOrAdmin(user)
}

/**
 * Article Versions access: Read versions (super_admin, admin, editor)
 */
export const canReadArticleVersions: Access = ({ req: { user } }) => {
  if (!user || !isActive(user)) return false
  const validRoles: UserRole[] = ['super_admin', 'admin', 'editor']
  return validRoles.includes(user.role as UserRole)
}

/**
 * Author collection access control
 */
export const canCreateAuthor: Access = ({ req: { user } }) => {
  if (!user || !isActive(user)) return false
  const validRoles: UserRole[] = ['super_admin', 'admin', 'editor']
  return validRoles.includes(user.role as UserRole)
}

export const canReadAuthor: Access = ({ req: { user } }) => {
  if (user && isActive(user)) {
    const validRoles: UserRole[] = ['super_admin', 'admin', 'editor']
    if (validRoles.includes(user.role as UserRole)) {
      return true
    }
  }
  return {
    status: {
      equals: 'active',
    },
  } as Where
}

export const canUpdateAuthor: Access = ({ req: { user } }) => {
  if (!user || !isActive(user)) return false
  const validRoles: UserRole[] = ['super_admin', 'admin', 'editor']
  return validRoles.includes(user.role as UserRole)
}

export const canDeleteAuthor: Access = ({ req: { user } }) => {
  if (!user || !isActive(user)) return false
  return isSuperAdminOrAdmin(user)
}

export const canCreateMenu: Access = ({ req: { user } }) => {
  if (!user || !isActive(user)) return false
  const validRoles: UserRole[] = ['super_admin', 'admin', 'editor']
  return validRoles.includes(user.role as UserRole)
}

export const canReadMenu: Access = ({ req: { user } }) => {
  if (user && isActive(user)) {
    const validRoles: UserRole[] = ['super_admin', 'admin', 'editor']
    if (validRoles.includes(user.role as UserRole)) {
      return true
    }
  }
  return {
    status: {
      equals: 'active',
    },
  } as Where
}

export const canUpdateMenu: Access = ({ req: { user } }) => {
  if (!user || !isActive(user)) return false
  const validRoles: UserRole[] = ['super_admin', 'admin', 'editor']
  return validRoles.includes(user.role as UserRole)
}

export const canDeleteMenu: Access = ({ req: { user } }) => {
  if (!user || !isActive(user)) return false
  return isSuperAdminOrAdmin(user)
}

export const canCreateMenuItem: Access = ({ req: { user } }) => {
  if (!user || !isActive(user)) return false
  const validRoles: UserRole[] = ['super_admin', 'admin', 'editor']
  return validRoles.includes(user.role as UserRole)
}

export const canReadMenuItem: Access = ({ req: { user } }) => {
  if (user && isActive(user)) {
    const validRoles: UserRole[] = ['super_admin', 'admin', 'editor']
    if (validRoles.includes(user.role as UserRole)) {
      return true
    }
  }
  return {
    status: {
      equals: 'active',
    },
  } as Where
}

export const canUpdateMenuItem: Access = ({ req: { user } }) => {
  if (!user || !isActive(user)) return false
  const validRoles: UserRole[] = ['super_admin', 'admin', 'editor']
  return validRoles.includes(user.role as UserRole)
}

export const canDeleteMenuItem: Access = ({ req: { user } }) => {
  if (!user || !isActive(user)) return false
  return isSuperAdminOrAdmin(user)
}

/**
 * SiteSettings access: Read (Public)
 */
export const canReadSiteSettings: Access = () => {
  return true
}

/**
 * SiteSettings access: Update (super_admin, admin ONLY; editor denied)
 */
export const canUpdateSiteSettings: Access = ({ req: { user } }) => {
  if (!user || !isActive(user)) return false
  return isSuperAdminOrAdmin(user)
}
