import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    const res = await payload.db.drizzle.execute('UPDATE _articles_v SET version_author_id = NULL WHERE version_author_id = 1')
    return NextResponse.json({ message: `Fixed orphaned versions` })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
