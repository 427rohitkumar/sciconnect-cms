import 'dotenv/config'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload, Payload } from 'payload'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

dotenv.config({
  path: path.resolve(dirname, '../.env'),
})

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

export async function seedAdmin({
  payload,
  name,
  email,
  password,
}: {
  payload: Payload
  name: string
  email: string
  password: string
}) {
  console.log('[SciConnectWorld] Starting database seed...')
  console.log('[SciConnectWorld] Checking seed administrator...')

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
    console.log('[SciConnectWorld] Seed administrator already exists.')
    console.log('[SciConnectWorld] No changes required.')
    return {
      created: false,
      user: existingUsers.docs[0],
    }
  }

  console.log('[SciConnectWorld] Seed administrator not found.')
  console.log('[SciConnectWorld] Creating super_admin...')

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

  console.log('[SciConnectWorld] Seed administrator created successfully.')
  console.log(`[SciConnectWorld] Email: ${newUser.email}`)

  return {
    created: true,
    user: newUser,
  }
}

export async function main() {
  try {
    const { name, email, password } = validateSeedEnvironment(process.env)
    const payloadConfigModule = await import('./payload.config')
    const payloadConfig = await payloadConfigModule.default
    const payload = await getPayload({ config: payloadConfig })
    await seedAdmin({ payload, name, email, password })
    if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
      process.exit(0)
    }
  } catch (error) {
    console.error('[SciConnectWorld] Seed error:', error instanceof Error ? error.message : error)
    if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
      process.exit(1)
    }
    process.exitCode = 1
  }
}

// Automatically run main if invoked as a CLI script
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  void main()
}
