import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import {
  canCreateCategory,
  canDeleteCategory,
  canReadCategory,
  canUpdateCategory,
  canUpdateStatusField,
} from '../access/roles'
import { iconField } from '../fields/iconField'

export const toKebabCase = (val: string): string => {
  return val
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export const getParentId = (val: any): number | string | null => {
  if (!val) return null
  if (typeof val === 'object' && val !== null && 'id' in val) {
    return val.id
  }
  if (typeof val === 'number' || typeof val === 'string') {
    return val
  }
  return null
}

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'parent', 'isFeatured', 'status', 'createdAt'],
    listSearchableFields: ['name', 'slug'],
  },
  access: {
    create: canCreateCategory,
    read: canReadCategory,
    update: canUpdateCategory,
    delete: canDeleteCategory,
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
            collection: 'categories',
            where: {
              slug: {
                equals: data.slug,
              },
            },
            limit: 1,
          })

          const currentId = originalDoc?.id || (data as any)?.id
          if (existing.docs.length > 0 && String(existing.docs[0].id) !== String(currentId)) {
            throw new APIError(`Category with slug "${data.slug}" already exists.`, 400)
          }
        }

        // 3. Self-Parenting & Circular Hierarchy Validation
        if ('parent' in data) {
          const currentId = originalDoc?.id
          const newParentId = getParentId(data.parent)

          if (currentId && newParentId && String(currentId) === String(newParentId)) {
            throw new APIError('A category cannot be its own parent.', 400)
          }

          if (newParentId) {
            const visited = new Set<string>()
            if (currentId) {
              visited.add(String(currentId))
            }

            let currParentId: number | string | null = newParentId

            while (currParentId !== null) {
              const currKey = String(currParentId)
              if (visited.has(currKey)) {
                throw new APIError('Circular parent relationship detected.', 400)
              }
              visited.add(currKey)

              try {
                const parentDoc = await req.payload.findByID({
                  collection: 'categories',
                  id: currParentId,
                  depth: 0,
                })

                if (!parentDoc) break
                currParentId = getParentId(parentDoc.parent)
              } catch {
                break
              }
            }
          }
        }

        return data
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
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      label: 'Featured Category',
      admin: {
        description: 'Showcase this category on the homepage',
        position: 'sidebar',
      },
    },
    iconField,
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      required: false,
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
  ],
}
