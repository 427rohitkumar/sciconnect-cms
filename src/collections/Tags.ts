import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import {
  canCreateTag,
  canDeleteTag,
  canReadTag,
  canUpdateTag,
  canUpdateStatusField,
} from '../access/roles'
import { toKebabCase } from './Categories'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'createdAt'],
    listSearchableFields: ['name', 'slug'],
    components: {
      views: {
        list: {
          Component: '/components/admin/tags/TagManagerView',
        },
        bulkCreate: {
          Component: '/components/admin/tags/BulkCreateView',
          path: '/bulk-create',
          exact: true,
        },
      },
    },
  },
  access: {
    create: canCreateTag,
    read: canReadTag,
    update: canUpdateTag,
    delete: canDeleteTag,
  },
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, req }) => {
        if (!data) return data

        // 1. Slug generation & custom slug preservation logic
        let targetSlug = data.slug ? toKebabCase(data.slug) : ''
        if (!targetSlug && data.name) {
          targetSlug = toKebabCase(data.name)
        }

        // If name changed but slug was custom in originalDoc, preserve original custom slug
        if (originalDoc?.slug && !data.slug && data.name) {
          const originalDefaultSlug = toKebabCase(originalDoc.name || '')
          if (originalDoc.slug !== originalDefaultSlug) {
            targetSlug = originalDoc.slug
          }
        }

        data.slug = targetSlug

        const currentId = originalDoc?.id || (data as any)?.id

        // 2. Application-level Unique Slug Check
        if (data.slug) {
          const existingSlugDoc = await req.payload.find({
            collection: 'tags',
            where: {
              slug: {
                equals: data.slug,
              },
            },
            limit: 1,
          })

          if (
            existingSlugDoc.docs.length > 0 &&
            String(existingSlugDoc.docs[0].id) !== String(currentId)
          ) {
            throw new APIError(`Tag with slug "${data.slug}" already exists.`, 400)
          }
        }

        // 3. Application-level Case-Insensitive Duplicate Name Check
        if (data.name) {
          const normalizedInputName = data.name.trim().toLowerCase()

          const existingTags = await req.payload.find({
            collection: 'tags',
            limit: 200,
          })

          const duplicateNameDoc = existingTags.docs.find(
            (doc) =>
              doc.name.trim().toLowerCase() === normalizedInputName &&
              String(doc.id) !== String(currentId),
          )

          if (duplicateNameDoc) {
            throw new APIError(`Tag with name "${data.name}" already exists.`, 400)
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
        hidden: true,
      },
    },
  ],
}
