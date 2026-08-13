import { GlobalConfig } from 'payload'
import { canReadSiteSettings, canUpdateSiteSettings } from '../access/roles'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: canReadSiteSettings,
    update: canUpdateSiteSettings,
  },
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              name: 'siteName',
              type: 'text',
              required: true,
              defaultValue: 'SciConnect',
            },
            {
              name: 'siteDescription',
              type: 'textarea',
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              required: false,
            },
            {
              name: 'favicon',
              type: 'upload',
              relationTo: 'media',
              required: false,
            },

          ],
        },
        {
          label: 'Header',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'brandDisplay',
                  type: 'select',
                  label: 'Header Brand Display Style',
                  defaultValue: 'logo-text',
                  options: [
                    { label: 'Logo & Text', value: 'logo-text' },
                    { label: 'Logo Only', value: 'logo-only' },
                    { label: 'Text Only', value: 'text-only' },
                  ],
                },
                {
                  name: 'brandLogoHeight',
                  type: 'number',
                  label: 'Header Logo Height (px)',
                  defaultValue: 32,
                  admin: {
                    condition: (data) => data.brandDisplay !== 'text-only',
                  },
                },
                {
                  name: 'brandTextSize',
                  type: 'number',
                  label: 'Header Text Size (px)',
                  defaultValue: 18,
                  admin: {
                    condition: (data) => data.brandDisplay !== 'logo-only',
                  },
                },
              ],
            },
            {
              name: 'headerMenu',
              type: 'relationship',
              relationTo: 'menus',
              filterOptions: {
                status: {
                  equals: 'active',
                },
              },
            },
            {
              name: 'headerLayout',
              type: 'select',
              defaultValue: 'default',
              options: [
                { label: 'Default', value: 'default' },
                { label: 'Centered', value: 'centered' },
                { label: 'Minimal', value: 'minimal' },
                { label: 'Minimal CTA', value: 'minimal-cta' },
                { label: 'Compact', value: 'compact' },
              ],
              admin: {
                components: {
                  Field: '@/components/admin/site-settings/HeaderLayoutSelector',
                },
              },
            },
            {
              type: 'group',
              name: 'mobileNavigation',
              label: 'Mobile Navigation',
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  defaultValue: true,
                },
                {
                  name: 'mobileMenu',
                  type: 'relationship',
                  relationTo: 'menus',
                  filterOptions: {
                    status: {
                      equals: 'active',
                    },
                  },
                  admin: {
                    description: 'Choose a different menu specifically for mobile. If empty, the Header Menu will be used.',
                  },
                },
                {
                  name: 'layout',
                  type: 'select',
                  defaultValue: 'drawer-left',
                  options: [
                    { label: 'Drawer Left', value: 'drawer-left' },
                    { label: 'Drawer Right', value: 'drawer-right' },
                    { label: 'Fullscreen', value: 'fullscreen' },
                    { label: 'Dropdown', value: 'dropdown' },
                  ],
                  admin: {
                    components: {
                      Field: '@/components/admin/site-settings/MobileMenuLayoutSelector',
                    },
                  },
                },
                {
                  type: 'collapsible',
                  label: 'Mobile Menu Behavior',
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'closeAfterNavigation', type: 'checkbox', defaultValue: true },
                        { name: 'closeOnOutsideClick', type: 'checkbox', defaultValue: true },
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        { name: 'closeOnEscape', type: 'checkbox', defaultValue: true },
                        { name: 'lockBodyScroll', type: 'checkbox', defaultValue: true },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'group',
              name: 'mobileHeader',
              label: 'Mobile Header',
              fields: [
                {
                  name: 'style',
                  type: 'select',
                  defaultValue: 'standard',
                  options: [
                    { label: 'Standard', value: 'standard' },
                    { label: 'Centered Logo', value: 'centered' },
                    { label: 'Logo + Search', value: 'logo-search' },
                    { label: 'Minimal', value: 'minimal' },
                  ],
                  admin: {
                    components: {
                      Field: '@/components/admin/site-settings/MobileHeaderStyleSelector',
                    },
                  },
                },
                {
                  name: 'triggerStyle',
                  type: 'select',
                  defaultValue: 'hamburger',
                  options: [
                    { label: 'Hamburger', value: 'hamburger' },
                    { label: 'Menu + Text', value: 'menu-text' },
                    { label: 'Circle', value: 'circle' },
                    { label: 'Square', value: 'square' },
                  ],
                  admin: {
                    components: {
                      Field: '@/components/admin/site-settings/MobileMenuTriggerSelector',
                    },
                  },
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'showSearch', type: 'checkbox', defaultValue: true },
                    { name: 'showSubscribe', type: 'checkbox', defaultValue: true },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'showLogo', type: 'checkbox', defaultValue: true },
                    { name: 'showMenuLabel', type: 'checkbox', defaultValue: false },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Footer',
          fields: [
            {
              name: 'footerMenu',
              type: 'relationship',
              relationTo: 'menus',
              filterOptions: {
                status: {
                  equals: 'active',
                },
              },
            },
            {
              name: 'footerLayout',
              type: 'select',
              defaultValue: 'default',
              options: [
                { label: 'Default', value: 'default' },
                { label: 'Multi Column', value: 'multi-column' },
                { label: 'Compact', value: 'compact' },
                { label: 'Minimal', value: 'minimal' },
              ],
              admin: {
                components: {
                  Field: '@/components/admin/site-settings/FooterLayoutSelector',
                },
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'footerBrandDisplay',
                  type: 'select',
                  label: 'Footer Brand Display Style',
                  defaultValue: 'logo-text',
                  options: [
                    { label: 'Logo & Text', value: 'logo-text' },
                    { label: 'Logo Only', value: 'logo-only' },
                    { label: 'Text Only', value: 'text-only' },
                  ],
                },
                {
                  name: 'footerBrandLogoHeight',
                  type: 'number',
                  label: 'Footer Logo Height (px)',
                  defaultValue: 32,
                  admin: {
                    condition: (data) => data.footerBrandDisplay !== 'text-only',
                  },
                },
                {
                  name: 'footerBrandTextSize',
                  type: 'number',
                  label: 'Footer Text Size (px)',
                  defaultValue: 18,
                  admin: {
                    condition: (data) => data.footerBrandDisplay !== 'logo-only',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Social',
          fields: [
            {
              name: 'socialLinks',
              type: 'array',
              label: 'Social Links',
              labels: {
                singular: 'Social Link',
                plural: 'Social Links',
              },
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Facebook', value: 'facebook' },
                    { label: 'Twitter / X', value: 'twitter' },
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'YouTube', value: 'youtube' },
                    { label: 'WhatsApp', value: 'whatsapp' },
                    { label: 'GitHub', value: 'github' },
                  ]
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  label: 'Profile URL'
                }
              ]
            }
          ]
        },
        {
          label: 'Theme',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'primaryColor',
                  type: 'text',
                  defaultValue: '#2563EB',
                  admin: {
                    components: {
                      Field: '@/components/admin/site-settings/ColorPickerField',
                    },
                  },
                  validate: (val: string | null | undefined) => {
                    if (!val) return true
                    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val) ? true : 'Must be a valid HEX color code (e.g. #2563EB)'
                  },
                },
                {
                  name: 'secondaryColor',
                  type: 'text',
                  defaultValue: '#1E40AF',
                  admin: {
                    components: {
                      Field: '@/components/admin/site-settings/ColorPickerField',
                    },
                  },
                  validate: (val: string | null | undefined) => {
                    if (!val) return true
                    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val) ? true : 'Must be a valid HEX color code'
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'accentColor',
                  type: 'text',
                  defaultValue: '#06B6D4',
                  admin: {
                    components: {
                      Field: '@/components/admin/site-settings/ColorPickerField',
                    },
                  },
                  validate: (val: string | null | undefined) => {
                    if (!val) return true
                    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val) ? true : 'Must be a valid HEX color code'
                  },
                },
                {
                  name: 'backgroundColor',
                  type: 'text',
                  defaultValue: '#FFFFFF',
                  admin: {
                    components: {
                      Field: '@/components/admin/site-settings/ColorPickerField',
                    },
                  },
                  validate: (val: string | null | undefined) => {
                    if (!val) return true
                    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val) ? true : 'Must be a valid HEX color code'
                  },
                },
              ],
            },
            {
              name: 'textColor',
              type: 'text',
              defaultValue: '#111827',
              admin: {
                components: {
                  Field: '@/components/admin/site-settings/ColorPickerField',
                },
              },
              validate: (val: string | null | undefined) => {
                if (!val) return true
                return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val) ? true : 'Must be a valid HEX color code'
              },
            },
          ],
        },
        {
          label: 'Maintenance',
          fields: [
            {
              name: 'maintenanceEnabled',
              type: 'checkbox',
              defaultValue: false,
              label: 'Enable Maintenance Mode',
            },
            {
              name: 'maintenanceTitle',
              type: 'text',
              admin: {
                condition: (data) => data.maintenanceEnabled,
              },
            },
            {
              name: 'maintenanceMessage',
              type: 'textarea',
              admin: {
                condition: (data) => data.maintenanceEnabled,
              },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'metaTitle',
              type: 'text',
              maxLength: 60,
              admin: {
                description: 'Maximum 60 characters.',
              },
            },
            {
              name: 'metaDescription',
              type: 'textarea',
              maxLength: 160,
              admin: {
                description: 'Maximum 160 characters.',
              },
            },
            {
              name: 'siteUrl',
              type: 'text',
              required: true,
              defaultValue: 'https://sciconnect.world',
              validate: (val: string | null | undefined) => {
                if (!val) return 'Site URL is required'
                try {
                  const url = new URL(val)
                  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                    return 'Must start with http:// or https://'
                  }
                  return true
                } catch {
                  return 'Must be a valid absolute URL'
                }
              },
            },
            {
              name: 'ogTitle',
              type: 'text',
              label: 'Open Graph Title',
              admin: {
                description: 'Defaults to Meta Title if left blank.',
              },
            },
            {
              name: 'ogDescription',
              type: 'textarea',
              label: 'Open Graph Description',
              admin: {
                description: 'Defaults to Meta Description if left blank.',
              },
            },
            {
              name: 'ogImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Open Graph Image',
            },
            {
              name: 'canonicalUrl',
              type: 'text',
              label: 'Canonical URL',
            },
            {
              name: 'noIndex',
              type: 'checkbox',
              label: 'No Index',
              defaultValue: false,
              admin: {
                description: 'Check to prevent search engines from indexing the site by default.',
              },
            },
          ],
        },
        {
          label: 'Analytics & Tracking',
          fields: [
            {
              name: 'googleAnalyticsEnabled',
              type: 'checkbox',
              defaultValue: false,
              label: 'Enable Google Analytics',
            },
            {
              name: 'ga4Id',
              type: 'text',
              label: 'GA4 Measurement ID',
              admin: {
                condition: (data) => data.googleAnalyticsEnabled,
                description: 'Format: G-XXXXXXXXXX',
              },
              validate: (val: string | null | undefined, { data }: { data?: Record<string, any> }) => {
                if (!data?.googleAnalyticsEnabled) return true
                if (!val) return 'GA4 ID is required when enabled'
                return /^G-[A-Z0-9]+$/.test(val) ? true : 'Must match format G-XXXXXXXXXX'
              },
            },
            {
              name: 'googleTagManagerEnabled',
              type: 'checkbox',
              defaultValue: false,
              label: 'Enable Google Tag Manager',
            },
            {
              name: 'gtmId',
              type: 'text',
              label: 'GTM Container ID',
              admin: {
                condition: (data) => data.googleTagManagerEnabled,
                description: 'Format: GTM-XXXXXXX',
              },
              validate: (val: string | null | undefined, { data }: { data?: Record<string, any> }) => {
                if (!data?.googleTagManagerEnabled) return true
                if (!val) return 'GTM ID is required when enabled'
                return /^GTM-[A-Z0-9]+$/.test(val) ? true : 'Must match format GTM-XXXXXXX'
              },
            },
            {
              type: 'ui',
              name: 'dashboardSeparator',
              admin: {
                components: {
                  Field: '@/components/admin/site-settings/DashboardSeparator',
                },
              },
            },
            {
              name: 'enableAnalyticsApp',
              type: 'checkbox',
              defaultValue: true,
              label: 'Enable Analytics App',
            },
            {
              name: 'lookerStudioEmbedUrl',
              type: 'text',
              required: false,
              label: 'Looker Studio Embed URL',
              admin: {
                condition: (data) => data.enableAnalyticsApp,
                description: 'Create or open your Looker Studio report, choose Embed report, and paste the generated Embed URL here.',
              },
              validate: (val: string | null | undefined, { data }: { data?: Record<string, any> }) => {
                if (!data?.enableAnalyticsApp) return true
                if (!val) return true
                
                try {
                  const url = new URL(val)
                  if (url.protocol !== 'https:') {
                    return 'URL must use https:// protocol'
                  }
                  if (url.hostname !== 'lookerstudio.google.com' && url.hostname !== 'datastudio.google.com') {
                    return 'Only official Google Data Studio / Looker Studio embed URLs are allowed.'
                  }
                  if (!url.pathname.startsWith('/embed/')) {
                    return 'Must be an official embed URL (e.g., https://lookerstudio.google.com/embed/...)'
                  }
                  return true
                } catch {
                  return 'Please enter a valid Looker Studio Embed URL.'
                }
              },
            },
          ],
        },
      ],
    },
  ],
}
