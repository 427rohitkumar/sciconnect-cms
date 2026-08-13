import { Payload } from 'payload'
import { seedLogger } from '../utils/logger'

export interface SeedEnv {
  SEED_ADMIN_NAME?: string
  SEED_ADMIN_EMAIL?: string
  SEED_ADMIN_PASSWORD?: string
  [key: string]: string | undefined
}

export function validateSeedEnvironment(env: SeedEnv): {
  name: string
  email: string
  password: string
} {
  const missing: string[] = []

  if (!env.SEED_ADMIN_NAME || !env.SEED_ADMIN_NAME.trim()) {
    missing.push('SEED_ADMIN_NAME')
  }
  if (!env.SEED_ADMIN_EMAIL || !env.SEED_ADMIN_EMAIL.trim()) {
    missing.push('SEED_ADMIN_EMAIL')
  }
  if (!env.SEED_ADMIN_PASSWORD || !env.SEED_ADMIN_PASSWORD.trim()) {
    missing.push('SEED_ADMIN_PASSWORD')
  }

  if (missing.length > 0) {
    throw new Error(`Missing required seed environment variable(s): ${missing.join(', ')}`)
  }

  const email = env.SEED_ADMIN_EMAIL!.trim()
  if (!email.includes('@') || !email.includes('.')) {
    throw new Error(`Invalid SEED_ADMIN_EMAIL format: "${email}"`)
  }

  return {
    name: env.SEED_ADMIN_NAME!.trim(),
    email,
    password: env.SEED_ADMIN_PASSWORD!,
  }
}

export async function seedUsers(payload: Payload, isDryRun: boolean = false) {
  const logger = seedLogger('Users')
  
  let name, email, password;
  try {
    const env = validateSeedEnvironment(process.env)
    name = env.name
    email = env.email
    password = env.password
  } catch (err: any) {
    logger.warn(`Skipping Users seed: ${err.message}`)
    return
  }

  const existingUsers = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: email,
      },
    },
    limit: 1,
  })

  if (existingUsers.docs.length > 0) {
    logger.info(`Seed administrator (${email}) already exists.`)
    return existingUsers.docs[0]
  }

  if (isDryRun) {
    logger.info(`[DRY RUN] Would create seed administrator (${email}).`)
    return { id: 'dry-run-user-id', email }
  }

  const newUser = await payload.create({
    collection: 'users',
    data: {
      name,
      email,
      password,
      role: 'super_admin',
      status: 'active',
    },
  })

  logger.success(`Seed administrator created successfully (${email}).`)
  return newUser
}
