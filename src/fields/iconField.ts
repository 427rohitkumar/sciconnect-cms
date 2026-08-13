import type { Field } from 'payload'

export const iconField: Field = {
  name: 'icon',
  type: 'text',
  admin: {
    description: 'Select an icon to display with this item',
    position: 'sidebar',
    components: {
      Field: '@/src/fields/IconPicker/index.tsx',
    }
  },
}
