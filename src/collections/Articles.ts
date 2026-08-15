import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import { lexicalEditor, FixedToolbarFeature } from '@payloadcms/richtext-lexical'
import {
  canCreateArticle,
  canDeleteArticle,
  canReadArticle,
  canReadArticleVersions,
  canUpdateArticle,
  canUpdateAuthorField,
  isSuperAdminOrAdmin,
} from '../access/roles'
import { getParentId, toKebabCase } from './Categories'
import { extractYouTubeVideoId } from '../utils/youtube'
const isValidHttpUrl = (val: string): boolean => {
  try {
    const parsed = new URL(val)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export const Articles: CollectionConfig = {
  slug: 'articles',
  defaultSort: '-publishedAt',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['featuredImage', 'title', 'contentType', 'slug', 'author', 'categories', '_status', 'publishedAt'],
    listSearchableFields: ['title', 'slug'],
    components: {
      beforeListTable: ['/components/admin/articles/ArticlesBulkActionCleanup'],
    },
  },
  access: {
    create: canCreateArticle,
    read: canReadArticle,
    update: canUpdateArticle,
    delete: canDeleteArticle,
    readVersions: canReadArticleVersions,
  },
  versions: {
    maxPerDoc: 2,
    drafts: {
      autosave: {
        interval: 1500,
      },
    },
  },
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, req }) => {
        if (!data) return data

        const user = req.user
        const isStaff = isSuperAdminOrAdmin(user)
        const isPublishing =
          data._status === 'published' || (!data._status && originalDoc?._status === 'published')

        // 1. Author Validation for Publishing
        if (isPublishing) {
          const authorId = getParentId(data.author)
          if (!authorId) {
            throw new APIError('Author is required to publish an article.', 400)
          }

          try {
            const authorDoc = await req.payload.findByID({
              collection: 'authors',
              id: authorId,
              depth: 0,
            })

            if (!authorDoc || authorDoc.status !== 'active') {
              throw new APIError('Selected author is inactive and cannot be used for publishing.', 400)
            }
          } catch (err: any) {
            if (err instanceof APIError) throw err
            throw new APIError('Invalid author reference or selected author is inactive.', 400)
          }
        }

        // 2. Author Field Permissions
        if (user && !isStaff) {
          if ('author' in data) {
            data.author = originalDoc?.author
          }
        }

        // 3. Status Transition Security
        if (!isStaff && data._status === 'published' && originalDoc?._status !== 'published') {
          throw new APIError('Only administrators can publish articles directly.', 403)
        }

        // 4. Slug Generation & Stability Logic
        let targetSlug = data.slug ? toKebabCase(data.slug) : ''

        if (!targetSlug && data.title) {
          if (originalDoc?._status === 'published' && originalDoc?.slug) {
            targetSlug = originalDoc.slug
          } else if (originalDoc?.slug && data.title) {
            const originalDefaultSlug = toKebabCase(originalDoc.title || '')
            if (originalDoc.slug !== originalDefaultSlug) {
              targetSlug = originalDoc.slug
            } else {
              targetSlug = toKebabCase(data.title)
            }
          } else {
            targetSlug = toKebabCase(data.title)
          }
        } else if (!targetSlug && originalDoc?.slug) {
          targetSlug = originalDoc.slug
        }

        if (targetSlug) {
          data.slug = targetSlug
        } else {
          data.slug = null
        }

        if (data.slug) {
          const currentId = originalDoc?.id || (data as any)?.id
          const existing = await req.payload.find({
            collection: 'articles',
            where: {
              slug: {
                equals: data.slug,
              },
            },
            limit: 1,
          })

          if (existing.docs.length > 0 && String(existing.docs[0].id) !== String(currentId)) {
            throw new APIError(`Article with slug "${data.slug}" already exists.`, 400)
          }
        }

        // 5. Publishing Timestamp Logic
        if (isPublishing && !data.publishedAt && !originalDoc?.publishedAt) {
          data.publishedAt = new Date().toISOString()
        }

        // 6. Publishing Validations
        if (isPublishing) {
          if (!data.title || !data.title.trim()) {
            throw new APIError('Title is required to publish an article.', 400)
          }

          if (data.contentType === 'video') {
            if (!data.video?.youtubeUrl || !data.video.youtubeUrl.trim()) {
              throw new APIError('YouTube URL is required to publish a video article.', 400)
            }
            if (!data.video?.youtubeVideoId) {
              throw new APIError('Valid YouTube URL is required to publish a video article.', 400)
            }
          } else {
            if (!data.content) {
              throw new APIError('Content is required to publish an article.', 400)
            }
          }

          if (!data.slug || !data.slug.trim()) {
            throw new APIError('Slug is required to publish an article.', 400)
          }

          if (!data.categories || data.categories.length === 0) {
            throw new APIError('At least one category is required to publish an article.', 400)
          }
        }

        // 7. Categories Validation
        if (data.categories && Array.isArray(data.categories)) {
          for (const categoryItem of data.categories) {
            const categoryId = getParentId(categoryItem)
            if (!categoryId) {
              throw new APIError('Invalid category reference.', 400)
            }

            try {
              const categoryDoc = await req.payload.findByID({
                collection: 'categories',
                id: categoryId,
                depth: 0,
              })

              if (!categoryDoc) {
                throw new APIError(`Category with ID ${categoryId} does not exist.`, 400)
              }

              if (isPublishing && categoryDoc.status !== 'active') {
                throw new APIError('Cannot publish an article assigned to an inactive category.', 400)
              }
            } catch (err) {
              if (err instanceof APIError) throw err
              throw new APIError('Error validating category reference.', 400)
            }
          }
        }

        // 8. Tag Validation & Deduplication
        if (data.tags && Array.isArray(data.tags)) {
          const rawTagIds = data.tags.map(getParentId).filter(Boolean) as (string | number)[]
          const uniqueTags: (string | number)[] = []
          const uniqueTagSet = new Set<string>()

          for (const tid of rawTagIds) {
            const strId = String(tid)
            if (uniqueTagSet.has(strId)) {
              throw new APIError(`Duplicate tag reference detected: ID ${strId}. Tags must be unique.`, 400)
            }
            uniqueTagSet.add(strId)
            uniqueTags.push(tid)
          }

          for (const tid of uniqueTags) {
            try {
              const tagDoc = await req.payload.findByID({
                collection: 'tags',
                id: tid,
                depth: 0,
              })
              if (!tagDoc) {
                throw new APIError(`Tag with ID ${tid} does not exist.`, 400)
              }
            } catch (err) {
              if (err instanceof APIError) throw err
              throw new APIError(`Tag with ID ${tid} does not exist.`, 400)
            }
          }

          data.tags = uniqueTags
        }

        // 9. Featured Image Media Validation
        if (data.featuredImage) {
          const mediaId = getParentId(data.featuredImage)
          if (mediaId) {
            try {
              const mediaDoc = await req.payload.findByID({
                collection: 'media',
                id: mediaId,
                depth: 0,
              })
              if (!mediaDoc) {
                throw new APIError(`Featured image media with ID ${mediaId} does not exist.`, 400)
              }
            } catch (err) {
              if (err instanceof APIError) throw err
              throw new APIError(`Featured image media with ID ${mediaId} does not exist.`, 400)
            }
          }
        }

        // 10. SEO Group Validation
        if (data.seo) {
          if (data.seo.ogImage) {
            const ogMediaId = getParentId(data.seo.ogImage)
            if (ogMediaId) {
              try {
                const ogMediaDoc = await req.payload.findByID({
                  collection: 'media',
                  id: ogMediaId,
                  depth: 0,
                })
                if (!ogMediaDoc) {
                  throw new APIError(`OG image media with ID ${ogMediaId} does not exist.`, 400)
                }
              } catch (err) {
                if (err instanceof APIError) throw err
                throw new APIError(`OG image media with ID ${ogMediaId} does not exist.`, 400)
              }
            }
          }

          if (data.seo.metaTitle && data.seo.metaTitle.length > 60) {
            throw new APIError('SEO Meta Title must be 60 characters or fewer.', 400)
          }

          if (data.seo.metaDescription && data.seo.metaDescription.length > 160) {
            throw new APIError('SEO Meta Description must be 160 characters or fewer.', 400)
          }

          if (data.seo.canonicalUrl && !isValidHttpUrl(data.seo.canonicalUrl)) {
            throw new APIError('Canonical URL must be a valid absolute HTTP or HTTPS URL.', 400)
          }
        }

        // 11. Video Validation
        if (data.contentType === 'video' && data.video?.youtubeUrl) {
          const videoId = extractYouTubeVideoId(data.video.youtubeUrl)
          if (!videoId) {
            throw new APIError('Invalid YouTube URL.', 400)
          }
          data.video.youtubeVideoId = videoId
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req, operation }) => {
        // Trigger newsletter on transition to published, or first publish
        if (operation === 'create' && doc._status === 'published') {
          await req.payload.jobs?.queue({
            task: 'createNewsletterCampaign',
            input: { articleId: doc.id } as any,
          } as any)
        } else if (
          operation === 'update' &&
          doc._status === 'published' &&
          previousDoc?._status !== 'published'
        ) {
          await req.payload.jobs?.queue({
            task: 'createNewsletterCampaign',
            input: { articleId: doc.id } as any,
          } as any)
        }
      },
    ],
  },
  fields: [
    // --- MAIN CONTENT COLUMN ---
    {
      name: 'contentType',
      type: 'radio',
      options: [
        { label: 'Article', value: 'article' },
        { label: 'Video', value: 'video' },
      ],
      defaultValue: 'article',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      required: false,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: false,
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
      }),
      required: false,
      admin: {
        condition: (data) => data?.contentType !== 'video',
      },
    },
    {
      name: 'video',
      type: 'group',
      admin: {
        condition: (data) => data?.contentType === 'video',
      },
      fields: [
        {
          name: 'videoProvider',
          type: 'select',
          options: [
            { label: 'YouTube', value: 'youtube' },
          ],
          defaultValue: 'youtube',
          required: false,
        },
        {
          name: 'youtubeUrl',
          label: 'YouTube URL',
          type: 'text',
          required: false,
        },
        {
          name: 'youtubeVideoId',
          type: 'text',
          admin: {
            hidden: true,
          },
        },
        {
          name: 'videoTitle',
          type: 'text',
          admin: {
            description: 'Leave blank to use the article title.',
          },
        },
        {
          name: 'videoDescription',
          type: 'textarea',
          admin: {
            description: 'Leave blank to use the article excerpt.',
          },
        },
        {
          name: 'duration',
          type: 'text',
          admin: {
            description: 'Format: MM:SS or HH:MM:SS (e.g., 15:33). Used for video SEO.',
          },
        },
      ],
    },
    {
      name: 'transcript',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
      }),
      required: false,
      admin: {
        condition: (data) => data?.contentType === 'video',
      },
    },
    {
      name: 'featuredImage',
      label: 'Cover Image',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        components: {
          Cell: '@/components/admin/articles/CoverImageCell',
        },
      },
    },

    // --- SIDEBAR COLUMN ---
    {
      name: 'isFeatured',
      label: 'Feature this Article',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'isTrending',
      label: 'Mark as Trending',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'newsletterStatus',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/components/admin/articles/NewsletterStatusField',
        }
      }
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: false,
      index: true,
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
      required: false,
      index: true,
      filterOptions: ({ siblingData }) => {
        const data = siblingData as Record<string, any> | undefined
        const authorVal = data?.author
        if (authorVal) {
          const currentAuthorId =
            typeof authorVal === 'object' && authorVal !== null ? authorVal.id : authorVal
          if (currentAuthorId) {
            return {
              or: [
                { status: { equals: 'active' } },
                { id: { equals: currentAuthorId } },
              ],
            } as any
          }
        }
        return {
          status: { equals: 'active' },
        } as any
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      required: false,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      required: false,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: false,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'seo',
      type: 'group',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          required: false,
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          required: false,
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          required: false,
        },
        {
          name: 'canonicalUrl',
          type: 'text',
          required: false,
        },
        {
          name: 'noIndex',
          type: 'checkbox',
          defaultValue: false,
          required: false,
        },
      ],
    },
  ],
}
