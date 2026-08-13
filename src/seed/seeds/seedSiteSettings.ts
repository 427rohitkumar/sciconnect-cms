import { Payload } from 'payload'
import { seedLogger } from '../utils/logger'
import { findBySlug } from '../utils/findBySlug'
import { seedSiteSettingsData } from '../data/siteSettings'

export async function seedSiteSettings(payload: Payload, isDryRun: boolean = false) {
  const logger = seedLogger('Site Settings')
  
  let existingSettings;
  if (!isDryRun) {
    existingSettings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  }

  // Determine if it's completely uninitialized (e.g., site name missing)
  const isUninitialized = !existingSettings || !existingSettings.siteName

  let existingHeroSettings;
  if (!isDryRun) {
    existingHeroSettings = await payload.findGlobal({ slug: 'hero-settings', depth: 0 })
  }

  if (isUninitialized) {
    logger.info('Site Settings appears uninitialized. Initializing full defaults...')
    
    // Resolve menu IDs
    let headerMenuId, footerMenuId
    if (!isDryRun) {
      const headerMenu = await findBySlug(payload, 'menus', 'main-header')
      const footerMenu = await findBySlug(payload, 'menus', 'main-footer')
      headerMenuId = headerMenu?.id
      footerMenuId = footerMenu?.id
    } else {
      headerMenuId = 'dry-run-header-menu'
      footerMenuId = 'dry-run-footer-menu'
    }

    const dataToSeed: any = {
      ...seedSiteSettingsData,
      headerMenu: headerMenuId as any,
      mobileNavigation: {
        ...seedSiteSettingsData.mobileNavigation,
        mobileMenu: headerMenuId as any
      },
      footerMenu: footerMenuId as any
    }

    if (isDryRun) {
      logger.success(`[DRY RUN] Would initialize Site Settings and Hero Settings with: ${JSON.stringify(dataToSeed)}`)
    } else {
      await payload.updateGlobal({
        slug: 'site-settings',
        data: dataToSeed
      })
      await payload.updateGlobal({
        slug: 'hero-settings',
        data: {
          enableHero: true,
          heroLayout: 'default',
          eyebrow: 'SCIENCE • TECHNOLOGY • INNOVATION',
          title: 'Exploring Science, Technology & Ideas That Shape Our Future',
          description: 'Dive into groundbreaking research, emerging technologies, and the stories behind the innovations transforming India and the world.',
        }
      })
      logger.success('Site Settings fully initialized.')
    }
  } else {
    logger.info('Site Settings already contain data. Checking for missing foundational menu links...')
    
    // Gently patch missing menu links without destroying custom themes/settings
    let updated = false
    const patchData: any = {}

    if (existingSettings && !existingSettings.headerMenu) {
      const headerMenu = await findBySlug(payload, 'menus', 'main-header')
      if (headerMenu) {
        patchData.headerMenu = headerMenu.id
        // Ensure mobile nav also has it if missing
        if (!existingSettings?.mobileNavigation?.mobileMenu) {
          patchData.mobileNavigation = {
            ...(existingSettings.mobileNavigation || {}),
            mobileMenu: headerMenu.id
          }
        }
        updated = true
      }
    }

    if (existingSettings && !existingSettings.footerMenu) {
      const footerMenu = await findBySlug(payload, 'menus', 'main-footer')
      if (footerMenu) {
        patchData.footerMenu = footerMenu.id
      }
      if (!existingHeroSettings || !existingHeroSettings.title) {
        if (!isDryRun) {
          await payload.updateGlobal({
            slug: 'hero-settings',
            data: {
              enableHero: true,
              heroLayout: 'default',
              eyebrow: 'SCIENCE • TECHNOLOGY • INNOVATION',
              title: 'Exploring Science, Technology & Ideas That Shape Our Future',
              description: 'Dive into groundbreaking research, emerging technologies, and the stories behind the innovations transforming India and the world.',
            }
          })
        }
        updated = true
      }
    }

    if (updated) {
      if (isDryRun) {
        logger.success('[DRY RUN] Would patch missing menu relations in Site Settings.')
      } else {
        await payload.updateGlobal({
          slug: 'site-settings',
          data: patchData
        })
        logger.success('Site Settings gently patched with missing menu relations.')
      }
    } else {
      logger.info('Site Settings already fully configured. No changes made.')
    }
  }
}
