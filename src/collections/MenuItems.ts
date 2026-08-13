import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import {
  canCreateMenuItem,
  canDeleteMenuItem,
  canReadMenuItem,
  canUpdateMenuItem,
  canUpdateStatusField,
} from '../access/roles'
import { getParentId } from './Categories'

const MAX_DEPTH = 4

export const MenuItems: CollectionConfig = {
  slug: 'menu-items',
  admin: {
    group: 'Content',
    useAsTitle: 'label',
    defaultColumns: ['label', 'menu', 'parent', 'linkType', 'order', 'status'],
    hidden: true,
  },
  access: {
    create: canCreateMenuItem,
    read: canReadMenuItem,
    update: canUpdateMenuItem,
    delete: canDeleteMenuItem,
  },
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, req }) => {
        if (!data) return data

        const currentId = originalDoc?.id || (data as any)?.id
        const menuId = getParentId(data.menu)

        // 1. Menu Ownership & Hierarchy Validations
        if ('parent' in data && data.parent) {
          const newParentId = getParentId(data.parent)

          // B. Self-parent protection
          if (currentId && newParentId && String(currentId) === String(newParentId)) {
            throw new APIError('A menu item cannot be its own parent.', 400)
          }

          if (newParentId) {
            // Check parent menu ownership
            const parentDoc = await req.payload.findByID({
              collection: 'menu-items' as any,
              id: newParentId,
              depth: 0,
            })

            if (parentDoc) {
              const parentMenuId = getParentId(parentDoc.menu)
              if (String(parentMenuId) !== String(menuId)) {
                throw new APIError('Parent menu item must belong to the same menu.', 400)
              }
            }

            // C. Circular hierarchy & Depth protection
            const visited = new Set<string>()
            if (currentId) {
              visited.add(String(currentId))
            }

            let currParentId: number | string | null = newParentId
            let depth = 1

            while (currParentId !== null) {
              depth++
              if (depth > MAX_DEPTH) {
                throw new APIError(`Maximum menu nesting depth of ${MAX_DEPTH} exceeded.`, 400)
              }

              const currKey = String(currParentId)
              if (visited.has(currKey)) {
                throw new APIError('Circular parent relationship detected.', 400)
              }
              visited.add(currKey)

              try {
                const ancestorDoc = await req.payload.findByID({
                  collection: 'menu-items' as any,
                  id: currParentId,
                  depth: 0,
                })
                if (!ancestorDoc) break
                currParentId = getParentId(ancestorDoc.parent)
              } catch {
                break
              }
            }
          }
        }

        // 2. Link Integrity & Consistency Validations
        if (data.linkType === 'internal') {
          if (!data.internalType) {
            throw new APIError('Internal link type must be specified.', 400)
          }

          if (data.internalType === 'article') {
            if (!data.article) {
              throw new APIError('An article must be selected.', 400)
            }
            // Verify article exists
            try {
              await req.payload.findByID({
                collection: 'articles',
                id: getParentId(data.article) as string,
                depth: 0,
              })
            } catch (e) {
              throw new APIError('Selected article does not exist.', 400)
            }
          }

          if (data.internalType === 'category') {
            if (!data.category) {
              throw new APIError('A category must be selected.', 400)
            }
            // Verify category exists and is active
            try {
              const cat = await req.payload.findByID({
                collection: 'categories',
                id: getParentId(data.category) as string,
                depth: 0,
              })
              if (cat.status !== 'active') {
                throw new APIError('Selected category is inactive and cannot be used as a menu target.', 400)
              }
            } catch (e) {
              if (e instanceof APIError) throw e
              throw new APIError('Selected category does not exist.', 400)
            }
          }

          if (data.internalType === 'custom') {
            if (!data.customPath) {
              throw new APIError('A custom path must be provided.', 400)
            }
            const path = data.customPath as string
            if (!path.startsWith('/') && !path.startsWith('#')) {
              throw new APIError('Custom internal path must start with "/" or "#".', 400)
            }
            if (path.match(/^(http|https|javascript|data):/i)) {
              throw new APIError('Custom path cannot contain external protocols.', 400)
            }
          }
        }

        if (data.linkType === 'external') {
          if (!data.externalUrl) {
            throw new APIError('An external URL must be provided.', 400)
          }
          const url = data.externalUrl as string
          if (!url.match(/^https?:\/\//i)) {
            throw new APIError('External URL must start with http:// or https://', 400)
          }
        }

        return data
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        // Prevent deletion if children exist
        const children = await req.payload.find({
          collection: 'menu-items' as any,
          where: {
            parent: {
              equals: id,
            },
          },
          limit: 1,
        })

        if (children.docs.length > 0) {
          throw new APIError(
            'Cannot delete this menu item because it contains child menu items. Remove its child items first.',
            400,
          )
        }
      },
    ],
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'menu',
      type: 'relationship',
      relationTo: 'menus' as any,
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'menu-items' as any,
      required: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        position: 'sidebar',
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
      ],
      access: {
        update: canUpdateStatusField,
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'linkType',
          type: 'select',
          required: true,
          options: [
            { label: 'Internal', value: 'internal' },
            { label: 'External', value: 'external' },
          ],
        },
        {
          name: 'openInNewTab',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    // Internal Link Fields
    {
      name: 'internalType',
      type: 'select',
      admin: {
        condition: (data) => data?.linkType === 'internal',
      },
      options: [
        { label: 'Article', value: 'article' },
        { label: 'Category', value: 'category' },
        { label: 'Custom Path', value: 'custom' },
      ],
    },
    {
      name: 'article',
      type: 'relationship',
      relationTo: 'articles',
      admin: {
        condition: (data) => data?.linkType === 'internal' && data?.internalType === 'article',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        condition: (data) => data?.linkType === 'internal' && data?.internalType === 'category',
      },
    },
    {
      name: 'customPath',
      type: 'text',
      admin: {
        condition: (data) => data?.linkType === 'internal' && data?.internalType === 'custom',
        description: 'Example: /about, /search',
      },
    },
    // External Link Fields
    {
      name: 'externalUrl',
      type: 'text',
      admin: {
        condition: (data) => data?.linkType === 'external',
        description: 'Must include http:// or https://',
      },
    },
    // Display / Icon
    {
      name: 'cssClass',
      type: 'text',
      required: false,
      admin: {
        description: 'Optional CSS class for custom styling',
      },
    },
    {
      name: 'icon',
      type: 'text',
      required: false,
      admin: {
        description: 'Optional icon identifier (e.g., "home", "search")',
      },
    },
  ],
}
