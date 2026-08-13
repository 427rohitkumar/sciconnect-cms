import { GlobalConfig } from 'payload'

export const EmailSettings: GlobalConfig = {
  slug: 'email-settings',
  label: 'Email Settings',
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'enableEmailSending',
      type: 'checkbox',
      defaultValue: true,
      label: 'Enable Outbound Emails',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'fromName',
          type: 'text',
          required: true,
          defaultValue: 'SciConnectWorld',
        },
        {
          name: 'fromEmail',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'replyTo',
      type: 'text',
      label: 'Reply-To Email',
    },
  ],
}
