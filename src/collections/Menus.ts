import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import {
  canCreateMenu,
  canDeleteMenu,
  canReadMenu,
  canUpdateMenu,
  canUpdateStatusField,
} from '../access/roles'
import { toKebabCase } from './Categories'

const parseId = (id: any) => {
  if (!id || typeof id !== 'string') return id
  return isNaN(Number(id)) ? id : Number(id)
}

export const Menus: CollectionConfig = {
  slug: 'menus',
  endpoints: [
    {
      path: '/:id/builder',
      method: 'get',
      handler: async (req) => {
        const menuId = req.routeParams?.id as string
        const { docs: items } = await req.payload.find({
          collection: 'menu-items' as any,
          where: { menu: { equals: menuId } },
          depth: 1, // Get some basic info for articles/categories
          pagination: false,
          sort: 'order',
        })
        return Response.json({ items })
      },
    },
    {
      path: '/:id/builder',
      method: 'post',
      handler: async (req) => {
        if (!req.user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        const menuId = req.routeParams?.id as string
        const body = (req.json ? await req.json() : req.data) || {}
        const { items, deletedIds } = body as any
        // items should be a flat array of all menu items with updated parent and order
        
        if (!Array.isArray(items)) {
          return Response.json({ error: 'Invalid items array' }, { status: 400 })
        }

        // Process deletions first
        if (Array.isArray(deletedIds) && deletedIds.length > 0) {
          for (const id of deletedIds) {
            try {
              await req.payload.delete({
                collection: 'menu-items' as any,
                id,
                req, // Enforces delete permissions and hooks
              })
            } catch (e: any) {
              return Response.json({ error: `Failed to delete item ${id}: ${e.message}` }, { status: 400 })
            }
          }
        }

        // Process all updates in a transaction/sequentially
        const updatedIds: string[] = []
        try {
          for (let i = 0; i < items.length; i++) {
            const item = items[i]
            
            if (item.isNew) {
              // Create new item
              const created = await req.payload.create({
                collection: 'menu-items' as any,
                data: {
                  menu: parseId(menuId),
                  label: item.label,
                  linkType: item.linkType,
                  internalType: item.internalType,
                  article: parseId(item.article),
                  category: parseId(item.category),
                  customPath: item.customPath,
                  externalUrl: item.externalUrl,
                  parent: parseId(item.parent) || null,
                  order: item.order ?? i,
                  status: item.status || 'active',
                },
                req,
              })
              
              // Map the old temp ID to the new real ID so children can reference it
              const oldId = item.id
              item.id = created.id
              // Update children that might be referencing this temp ID
              for (const child of items) {
                if (child.parent === oldId) {
                  child.parent = created.id
                }
              }
              updatedIds.push(created.id as string)
            } else {
              if (!item.id) continue
              
              // Update existing item
              await req.payload.update({
                collection: 'menu-items' as any,
                id: parseId(item.id),
                data: {
                  parent: parseId(item.parent) || null,
                  order: item.order ?? i,
                  label: item.label,
                  linkType: item.linkType,
                  internalType: item.internalType,
                  article: parseId(item.article),
                  category: parseId(item.category),
                  customPath: item.customPath,
                  externalUrl: item.externalUrl,
                  status: item.status || 'active',
                },
                req,
              })
              updatedIds.push(item.id)
            }
          }
        } catch (e: any) {
          return Response.json({ error: `Save failed: ${e.message}` }, { status: 400 })
        }

        // Return updated tree
        return Response.json({ success: true, updatedCount: updatedIds.length })
      },
    },
    {
      path: '/search/:type',
      method: 'get',
      handler: async (req) => {
        const type = req.routeParams?.type as string // 'articles' or 'categories'
        const url = new URL(req.url || 'http://localhost')
        const query = url.searchParams.get('q') || ''
        
        if (type !== 'articles' && type !== 'categories') {
          return Response.json({ error: 'Invalid search type' }, { status: 400 })
        }

        const where: any = {}
        if (query) {
          if (type === 'articles') {
            where.or = [
              { title: { like: query } },
              { slug: { like: query } },
            ]
          } else {
            where.or = [
              { name: { like: query } },
              { slug: { like: query } },
            ]
          }
        }

        // No status field on Articles/Categories currently
        // If they had drafts, we would use _status: { equals: 'published' }
        if (!where.or) {
          // If query is empty, we still need a valid where clause if we're passing it, 
          // or we just omit where entirely.
        }

        const results = await req.payload.find({
          collection: type as any,
          ...(Object.keys(where).length > 0 ? { where } : {}),
          limit: 20,
          depth: 0,
        })
        
        return Response.json({ docs: results.docs })
      },
    }
  ],
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'locations', 'status', 'createdAt'],
  },
  access: {
    create: canCreateMenu,
    read: canReadMenu,
    update: canUpdateMenu,
    delete: canDeleteMenu,
  },
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, req }) => {
        if (!data) return data

        // 1. Slug generation and customization preservation
        let targetSlug = data.slug ? toKebabCase(data.slug) : ''
        if (!targetSlug && data.name) {
          targetSlug = toKebabCase(data.name)
        }

        if (originalDoc?.slug && !data.slug && data.name) {
          const originalDefaultSlug = toKebabCase(originalDoc.name || '')
          if (originalDoc.slug !== originalDefaultSlug) {
            targetSlug = originalDoc.slug
          }
        }

        data.slug = targetSlug

        // 2. Application-level Unique Slug Check
        if (data.slug) {
          const existing = await req.payload.find({
            collection: 'menus' as any,
            where: {
              slug: {
                equals: data.slug,
              },
            },
            limit: 1,
          })

          const currentId = originalDoc?.id || (data as any)?.id
          if (existing.docs.length > 0 && String(existing.docs[0].id) !== String(currentId)) {
            throw new APIError(`Menu with slug "${data.slug}" already exists.`, 400)
          }
        }

        // 3. Location uniqueness check
        // Only one active menu can be assigned to a particular location.
        if (data.status === 'active' && data.locations && Array.isArray(data.locations) && data.locations.length > 0) {
          for (const location of data.locations) {
            const existingActive = await req.payload.find({
              collection: 'menus' as any,
              where: {
                and: [
                  { status: { equals: 'active' } },
                  { locations: { equals: location as any } }
                ]
              },
              limit: 1,
            })
            
            const currentId = originalDoc?.id || (data as any)?.id
            if (existingActive.docs.length > 0 && String(existingActive.docs[0].id) !== String(currentId)) {
              throw new APIError(`Cannot assign this menu to "${location}" because another active menu is already assigned to this location.`, 400)
            }
          }
        }

        return data
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        // Prevent deletion if menu items exist
        const items = await req.payload.find({
          collection: 'menu-items' as any,
          where: {
            menu: {
              equals: id
            }
          },
          limit: 1
        })
        
        if (items.docs.length > 0) {
          throw new APIError('Cannot delete this menu because it contains menu items. Remove all menu items first.', 400)
        }
      }
    ]
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: false,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
    },
    {
      name: 'locations',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Header', value: 'header' },
        { label: 'Footer', value: 'footer' },
      ],
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
      name: 'navigationBuilder',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/admin/menus/builder/NavigationBuilderField',
        },
      },
    },
  ],
}
