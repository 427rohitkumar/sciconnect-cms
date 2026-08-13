'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { toKebabCase } from '../../../../collections/Categories'

export interface TagDoc {
  id: string | number
  name: string
  slug: string
  description?: string | null
  status: 'active' | 'inactive'
  createdAt?: string
  updatedAt?: string
}

export interface FetchTagsResponse {
  docs: TagDoc[]
  totalDocs: number
  totalPages: number
  page: number
  canDelete: boolean
  canCreate: boolean
}

export async function getCurrentUserPermissionsAction() {
  const payload = await getPayload({ config })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    return { authenticated: false, role: null, canDelete: false, canCreate: false, canUpdate: false }
  }

  const role = (user as any).role || 'editor'
  const canDelete = role === 'super_admin' || role === 'admin'
  const canCreate = ['super_admin', 'admin', 'editor'].includes(role)
  const canUpdate = ['super_admin', 'admin', 'editor'].includes(role)

  return { authenticated: true, role, canDelete, canCreate, canUpdate }
}

export async function fetchTagsAction(params: {
  search?: string
  page?: number
  limit?: number
}): Promise<FetchTagsResponse> {
  const payload = await getPayload({ config })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  const permissions = await getCurrentUserPermissionsAction()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const page = params.page || 1
  const limit = params.limit || 60
  const search = params.search ? params.search.trim() : ''
  const normalizedSearch = search ? toKebabCase(search) : ''

  const whereCondition: any = {}
  if (search) {
    const searchOr: any[] = [{ name: { contains: search } }]
    if (normalizedSearch) {
      searchOr.push({ slug: { contains: normalizedSearch } })
    }
    whereCondition.or = searchOr
  }

  const result = await payload.find({
    collection: 'tags',
    where: whereCondition,
    sort: 'name',
    page,
    limit,
  })

  return {
    docs: result.docs as any as TagDoc[],
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page || page,
    canDelete: permissions.canDelete,
    canCreate: permissions.canCreate,
  }
}

export async function checkExistingTagNamesAction(names: string[]): Promise<Record<string, boolean>> {
  const payload = await getPayload({ config })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    throw new Error('Unauthorized')
  }

  const normalizedInputs = names.map((n) => ({
    original: n,
    normalized: n.trim().toLowerCase(),
    slug: toKebabCase(n),
  }))

  const existingTags = await payload.find({
    collection: 'tags',
    limit: 2000,
  })

  const resultMap: Record<string, boolean> = {}

  for (const item of normalizedInputs) {
    const exists = existingTags.docs.some(
      (doc: any) =>
        doc.name.trim().toLowerCase() === item.normalized ||
        doc.slug === item.slug,
    )
    resultMap[item.original] = exists
  }

  return resultMap
}

export async function bulkCreateTagsAction(names: string[]): Promise<{
  createdCount: number
  skippedCount: number
  createdTags: TagDoc[]
  skippedTags: Array<{ name: string; reason: string }>
}> {
  const payload = await getPayload({ config })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    throw new Error('Unauthorized')
  }

  const permissions = await getCurrentUserPermissionsAction()
  if (!permissions.canCreate) {
    throw new Error('Permission denied: You do not have rights to create tags.')
  }

  const createdTags: TagDoc[] = []
  const skippedTags: Array<{ name: string; reason: string }> = []

  const processedNames = new Set<string>()

  for (const rawName of names) {
    const trimmed = rawName.trim()
    if (!trimmed) continue

    const normalizedKey = trimmed.toLowerCase()
    if (processedNames.has(normalizedKey)) {
      skippedTags.push({ name: trimmed, reason: 'Duplicate in request list' })
      continue
    }
    processedNames.add(normalizedKey)

    try {
      const newTag = await payload.create({
        collection: 'tags',
        data: {
          name: trimmed,
          status: 'active',
        },
      })
      createdTags.push(newTag as any as TagDoc)
    } catch (err: any) {
      skippedTags.push({
        name: trimmed,
        reason: err?.message || 'Already exists or invalid',
      })
    }
  }

  return {
    createdCount: createdTags.length,
    skippedCount: skippedTags.length,
    createdTags,
    skippedTags,
  }
}

export async function getTagArticleCountAction(id: string | number): Promise<number> {
  const payload = await getPayload({ config })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user) return 0

  const referencedArticles = await payload.find({
    collection: 'articles',
    where: {
      tags: {
        contains: id,
      },
    },
    limit: 1,
  })

  return referencedArticles.totalDocs
}

export async function deleteTagAction(id: string | number): Promise<{ success: boolean; message?: string }> {
  const payload = await getPayload({ config })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    throw new Error('Unauthorized')
  }

  const permissions = await getCurrentUserPermissionsAction()
  if (!permissions.canDelete) {
    return { success: false, message: 'Permission denied: You do not have rights to delete tags.' }
  }

  try {
    await payload.delete({
      collection: 'tags',
      id,
    })
    return { success: true }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to delete tag.' }
  }
}

export async function updateTagAction(data: {
  id: string | number
  name: string
  description?: string
  status?: 'active' | 'inactive'
}): Promise<{ success: boolean; tag?: TagDoc; message?: string }> {
  const payload = await getPayload({ config })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    throw new Error('Unauthorized')
  }

  const permissions = await getCurrentUserPermissionsAction()
  if (!permissions.canUpdate) {
    return { success: false, message: 'Permission denied: You do not have rights to update tags.' }
  }

  try {
    const updated = await payload.update({
      collection: 'tags',
      id: data.id,
      data: {
        name: data.name,
        description: data.description || '',
        status: data.status || 'active',
      },
    })
    return { success: true, tag: updated as any as TagDoc }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to update tag.' }
  }
}
