import { CollectionConfig } from 'payload'

export const NewsletterDeliveries: CollectionConfig = {
  slug: 'newsletter-deliveries',
  admin: {
    useAsTitle: 'email',
    group: 'Newsletter',
  },
  access: {
    read: () => true,
    create: () => false, // only via system
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'subscriber',
      type: 'relationship',
      relationTo: 'subscribers' as any,
      required: true,
      index: true,
    },
    {
      name: 'article',
      type: 'relationship',
      relationTo: 'articles' as any,
      required: false,
    },
    {
      name: 'email',
      type: 'text',
      required: true,
    },
    {
      name: 'template',
      type: 'relationship',
      relationTo: 'email-templates' as any,
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'queued',
      options: [
        { label: 'Queued', value: 'queued' },
        { label: 'Sending', value: 'sending' },
        { label: 'Sent', value: 'sent' },
        { label: 'Failed', value: 'failed' },
        { label: 'Skipped', value: 'skipped' },
      ],
      required: true,
    },
    {
      name: 'errorMessage',
      type: 'textarea',
    },
    {
      name: 'attemptCount',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'providerMessageId',
      type: 'text',
    },
  ],
}
