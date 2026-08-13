import type { CollectionConfig, FieldHook } from 'payload'
import { toKebabCase } from './Categories'
import { canCreateAuthor, canReadAuthor, canUpdateAuthor, canDeleteAuthor } from '../access/roles'

const populateSlug: FieldHook = ({ data, originalDoc, value }) => {
  if (typeof value === 'string' && value.length > 0) {
    return toKebabCase(value)
  }

  if (data?.name) {
    return toKebabCase(data.name)
  }

  return originalDoc?.slug || ''
}

export const Authors: CollectionConfig = {
  slug: 'authors',
  admin: {
    group: 'Users',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'designation', 'status', 'createdAt'],
    listSearchableFields: ['name', 'slug', 'designation'],
  },
  access: {
    create: canCreateAuthor,
    read: canReadAuthor,
    update: canUpdateAuthor,
    delete: canDeleteAuthor,
  },
  hooks: {
    beforeDelete: [
      async ({ req, id }) => {
        const articles = await req.payload.find({
          collection: 'articles',
          where: {
            author: {
              equals: id,
            },
          },
          limit: 1,
        })

        if (articles.totalDocs > 0) {
          throw new Error(
            'Cannot delete this author because they are assigned to existing articles. Set the author to inactive instead.',
          )
        }
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
      hooks: {
        beforeValidate: [populateSlug],
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'bio',
      type: 'textarea',
      required: false,
    },
    {
      name: 'designation',
      type: 'text',
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
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'social',
      type: 'group',
      required: false,
      admin: {
        position: 'sidebar',
      },
      fields: [
        { name: 'facebook', type: 'text', required: false },
        { name: 'instagram', type: 'text', required: false },
        { name: 'x', type: 'text', required: false },
        { name: 'linkedin', type: 'text', required: false },
        { name: 'youtube', type: 'text', required: false },
        { name: 'website', type: 'text', required: false },
      ],
    },
  ],
}

export default Authors
