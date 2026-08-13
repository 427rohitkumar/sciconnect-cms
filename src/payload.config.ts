import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Authors } from './collections/Authors'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Tags } from './collections/Tags'
import { Articles } from './collections/Articles'
import { Menus } from './collections/Menus'
import { MenuItems } from './collections/MenuItems'
import { Subscribers } from './collections/Subscribers'
import { NewsletterDeliveries } from './collections/NewsletterDeliveries'
import { EmailTemplates } from './collections/EmailTemplates'
import { Comments } from './collections/Comments'
import { SiteSettings } from './globals/SiteSettings'
import { HeroSettings } from './globals/HeroSettings'
import { EmailSettings } from './globals/EmailSettings'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { createNewsletterCampaign } from './jobs/createNewsletterCampaign'
import { sendNewsletterEmail } from './jobs/sendNewsletterEmail'
import { sendVerificationEmail } from './jobs/sendVerificationEmail'
import { sendCommentReplyEmail } from './jobs/sendCommentReplyEmail'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  onInit: async (payload) => {
    try {
      payload.logger.info('Running database migrations...')
      await payload.db.migrate()
      payload.logger.info('Database migrations completed successfully')
    } catch (err: any) {
      // If migrations already up to date, that's fine
      if (err?.message?.includes('No migrations')) {
        payload.logger.info('No pending migrations')
      } else {
        payload.logger.error({ err }, 'Migration error')
      }
    }

    // Temporary auto-schema-fix for production (since push:true doesn't run in production)
    try {
      const { sql } = await import('@payloadcms/db-postgres')
      if (payload.db.drizzle) {
        await payload.db.drizzle.execute(sql`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "cache_revalidate" varchar;`)
        await payload.db.drizzle.execute(sql`ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "is_trending" boolean;`)
        payload.logger.info('Successfully verified/added missing columns (cache_revalidate, is_trending) to production DB.')
      }
    } catch (e) {
      payload.logger.error(e, 'Error auto-fixing missing schema columns')
    }
  },
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Sci-Connect CMS',
      icons: [{ url: '/favicon.ico' }],
    },
    components: {
      Nav: '/components/admin/navigation/CustomNav',
      providers: ['/components/admin/PWASetup#PWASetup'],
      graphics: {
        Logo: '/components/admin/Logo',
        Icon: '/components/admin/Icon',
      },
      views: {
        dashboard: {
          Component: '/components/admin/Dashboard',
        },
        googleAnalytics: {
          Component: '/components/admin/apps/GoogleAnalytics/GoogleAnalyticsPage',
          path: '/apps/google-analytics',
          exact: true,
        },
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Authors, Media, Categories, Tags, Articles, Menus, MenuItems, Subscribers, NewsletterDeliveries, EmailTemplates, Comments],
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000',
  cors: [process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4001', 'http://localhost:3000', 'http://localhost:4000'],
  csrf: [process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4001', 'http://localhost:3000', 'http://localhost:4000'],
  globals: [SiteSettings, HeroSettings, EmailSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    push: true, // Auto-create/sync tables on startup (no migration files needed)
  }),
  sharp,
  jobs: {
    tasks: [createNewsletterCampaign, sendNewsletterEmail, sendVerificationEmail, sendCommentReplyEmail],
  },
  plugins: [],
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: process.env.SMTP_FROM_EMAIL || 'noreply@sciconnect.world',
        defaultFromName: 'SciConnectWorld',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
          },
        },
      })
    : undefined,
})
