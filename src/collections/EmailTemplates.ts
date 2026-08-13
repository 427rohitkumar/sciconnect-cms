import { CollectionConfig } from 'payload'

export const EmailTemplates: CollectionConfig = {
  slug: 'email-templates',
  admin: {
    useAsTitle: 'name',
    group: 'Newsletter',
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
      required: true,
      unique: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Subscription Verification', value: 'subscriptionVerification' },
        { label: 'Welcome', value: 'welcome' },
        { label: 'New Article', value: 'newArticle' },
        { label: 'Unsubscribe Confirmation', value: 'unsubscribeConfirmation' },
        { label: 'Comment Reply Notification', value: 'commentReply' },
      ],
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
    },
    {
      name: 'htmlBody',
      type: 'code',
      admin: {
        language: 'html',
      },
      required: true,
    },
    {
      name: 'textBody',
      type: 'textarea',
    },
    {
      name: 'preview',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/admin/TemplatePreview',
        },
      },
    },
  ],
}
