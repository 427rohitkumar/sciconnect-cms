import 'dotenv/config'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

import { seedUsers } from './seeds/seedUsers'
import { seedAuthors } from './seeds/seedAuthors'
import { seedCategories } from './seeds/seedCategories'
import { seedTags } from './seeds/seedTags'
import { seedArticles } from './seeds/seedArticles'
import { seedMenus } from './seeds/seedMenus'
import { seedMenuItems } from './seeds/seedMenuItems'
import { seedSiteSettings } from './seeds/seedSiteSettings'
import { seedEmailTemplates } from './seeds/seedEmailTemplates'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

dotenv.config({
  path: path.resolve(dirname, '../../.env'),
})

export async function main() {
  const isProd = process.env.NODE_ENV === 'production'
  const allowProd = process.env.SEED_ALLOW_PRODUCTION === 'true'
  const isDryRun = process.env.SEED_DRY_RUN === 'true'

  if (isProd && !allowProd) {
    console.error(`
============================================================
[SEED ABORTED] Production Environment Detected
============================================================
Running the seed script in production requires explicit confirmation.
If you are sure you want to run this, use:
SEED_ALLOW_PRODUCTION=true npm run seed
============================================================
    `)
    process.exit(1)
  }

  if (isDryRun) {
    console.log(`
============================================================
[SEED DRY RUN] No database mutations will occur.
============================================================
    `)
  }

  try {
    const payloadConfigModule = await import('../payload.config')
    const payloadConfig = await payloadConfigModule.default
    const payload = await getPayload({ config: payloadConfig })

    console.log('\n--- Starting SciConnectWorld CMS Seed ---\n')

    // 1. Users (Admin)
    const user = await seedUsers(payload, isDryRun)
    const userResult = user ? '1 created/exists' : '0'

    // 2. Authors
    const authors = await seedAuthors(payload, isDryRun)
    const authorResult = `${authors.length} processed`

    // 3. Categories
    const categories = await seedCategories(payload, isDryRun)
    const categoryResult = `${categories.length} processed`

    // 4. Tags
    const tags = await seedTags(payload, isDryRun)
    const tagResult = `${tags.length} processed`

    // 4.5 Articles
    const articles = await seedArticles(payload, isDryRun)
    const articleResult = `${articles.length} processed`

    // 5. Menus
    const menus = await seedMenus(payload, isDryRun)
    const menuResult = `${menus.length} processed`

    // 6. Menu Items
    const menuItemsCount = await seedMenuItems(payload, isDryRun)
    const menuItemsResult = `${menuItemsCount} created`

    // 7. Site Settings
    await seedSiteSettings(payload, isDryRun)

    // 8. Email Templates
    const emailTemplatesCount = await seedEmailTemplates(payload, isDryRun)
    const emailTemplatesResult = `${emailTemplatesCount} created`

    console.log(`
=====================================
SciConnectWorld CMS Seed Summary
=====================================
Users         : ${userResult}
Authors       : ${authorResult}
Categories    : ${categoryResult}
Tags          : ${tagResult}
Articles      : ${articleResult}
Menus         : ${menuResult}
Menu Items    : ${menuItemsResult}
Site Settings : Processed
Templates     : ${emailTemplatesResult}

Seed completed successfully.
=====================================
    `)

    if (process.argv[1] && process.argv[1].endsWith('index.ts')) {
      process.exit(0)
    }
  } catch (error) {
    console.error('\n[SEED FATAL ERROR]', error instanceof Error ? error.message : error)
    if (process.argv[1] && process.argv[1].endsWith('index.ts')) {
      process.exit(1)
    }
    process.exitCode = 1
  }
}

// Automatically run main if invoked as a CLI script
if (process.argv[1] && process.argv[1].endsWith('index.ts')) {
  void main()
}
