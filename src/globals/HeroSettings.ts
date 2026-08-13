import { GlobalConfig } from 'payload'
import { canReadSiteSettings, canUpdateSiteSettings } from '../access/roles'

export const HeroSettings: GlobalConfig = {
  slug: 'hero-settings',
  label: 'Hero Section',
  access: {
    read: canReadSiteSettings,
    update: canUpdateSiteSettings,
  },
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'enableHero',
      type: 'checkbox',
      defaultValue: true,
      label: 'Enable Hero',
    },
    {
      name: 'heroLayout',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Default Split', value: 'default' },
        { label: 'Full Image', value: 'full-image' },
        { label: 'Centered', value: 'centered' },
        { label: 'Slider Gallery', value: 'slider' },
      ],
      admin: {
        components: {
          Field: '@/components/admin/site-settings/HeroLayoutSelector',
        },
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          required: false,
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          defaultValue: 'Exploring Science, Technology & Ideas That Shape Our Future',
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
    },
    {
      type: 'group',
      name: 'primaryCTA',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'enabled', type: 'checkbox', defaultValue: false },
            { name: 'openInNewTab', type: 'checkbox', defaultValue: false, admin: { condition: (data, siblingData) => siblingData.enabled } },
          ]
        },
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', admin: { condition: (data, siblingData) => siblingData.enabled } },
            { name: 'url', type: 'text', admin: { condition: (data, siblingData) => siblingData.enabled } },
          ]
        }
      ]
    },
    {
      type: 'group',
      name: 'secondaryCTA',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'enabled', type: 'checkbox', defaultValue: false },
            { name: 'openInNewTab', type: 'checkbox', defaultValue: false, admin: { condition: (data, siblingData) => siblingData.enabled } },
          ]
        },
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', admin: { condition: (data, siblingData) => siblingData.enabled } },
            { name: 'url', type: 'text', admin: { condition: (data, siblingData) => siblingData.enabled } },
          ]
        }
      ]
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        condition: (data) => data.heroLayout !== 'slider'
      }
    },
    {
      name: 'heroGallery',
      type: 'array',
      maxRows: 5,
      admin: {
        condition: (data) => data.heroLayout === 'slider',
        description: 'Maximum 5 images',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
          required: false,
        }
      ]
    },
    {
      name: 'featuredArticle',
      type: 'relationship',
      relationTo: 'articles',
      required: false,
      filterOptions: {
        _status: {
          equals: 'published',
        },
      },
    }
  ],
}
