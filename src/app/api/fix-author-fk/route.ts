import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// ONE-TIME FIX: Run this route ONCE from browser to repair orphan author_id references.
// Visit: http://localhost:3000/api/fix-author-fk
// DELETE this file after it runs successfully.

export async function GET() {
  try {
    const payload = await getPayload({ config })
    const db = payload.db as any

    // Access the raw drizzle pool
    const pool = db.pool || db.drizzle?.session?.client

    if (!pool) {
      return NextResponse.json({ error: 'Could not access raw DB pool' }, { status: 500 })
    }

    const results: string[] = []

    // Drop the broken FK constraint if it exists
    await pool.query('ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_author_id_authors_id_fk')
    results.push('Dropped constraint articles_author_id_authors_id_fk (if existed)')

    // Null out orphan author_ids in articles
    const n1 = await pool.query(`
      UPDATE articles SET author_id = NULL
      WHERE author_id IS NOT NULL
        AND author_id NOT IN (SELECT id FROM authors)
    `)
    results.push(`Nullified ${n1.rowCount} articles with orphan author_id`)

    // Null out orphan version_author_ids in _articles_v
    const n2 = await pool.query(`
      UPDATE _articles_v SET version_author_id = NULL
      WHERE version_author_id IS NOT NULL
        AND version_author_id NOT IN (SELECT id FROM authors)
    `)
    results.push(`Nullified ${n2.rowCount} _articles_v rows with orphan author_id`)

    // Re-add the FK constraint
    await pool.query(`
      ALTER TABLE articles
      ADD CONSTRAINT articles_author_id_authors_id_fk
      FOREIGN KEY (author_id) REFERENCES public.authors(id)
      ON DELETE SET NULL ON UPDATE NO ACTION
    `)
    results.push('Added constraint articles_author_id_authors_id_fk')

    // Re-add FK on _articles_v
    await pool.query('ALTER TABLE _articles_v DROP CONSTRAINT IF EXISTS _articles_v_version_author_id_authors_id_fk')
    await pool.query(`
      ALTER TABLE _articles_v
      ADD CONSTRAINT _articles_v_version_author_id_authors_id_fk
      FOREIGN KEY (version_author_id) REFERENCES public.authors(id)
      ON DELETE SET NULL ON UPDATE NO ACTION
    `)
    results.push('Added constraint _articles_v_version_author_id_authors_id_fk')

    results.push('DONE — now restart npm run dev and DELETE this file: src/app/api/fix-author-fk/route.ts')

    return NextResponse.json({ success: true, results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 })
  }
}
