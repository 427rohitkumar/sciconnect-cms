import { CollectionConfig, APIError } from 'payload'
import crypto from 'crypto'

export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    useAsTitle: 'name',
    group: 'Comments',
    defaultColumns: ['name', 'article', 'status', 'createdAt'],
  },
  access: {
    // Anyone can create a comment (e.g. from the public frontend API)
    create: () => true,
    // Public can only read approved comments. Admins can read all.
    read: ({ req: { user } }) => {
      if (user) return true
      return { status: { equals: 'approved' } }
    },
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          // Security: force default status and authorType for unauthenticated users
          if (!req.user) {
            data.status = 'pending'
            data.authorType = 'reader'
          } else {
            // If admin creates a comment/reply from CMS, default to approved
            if (!data.status) data.status = 'approved'
            data.authorType = data.authorType || 'admin'
          }

          // Validate parentComment belongs to the same article
          if (data.parentComment) {
            const parent = await req.payload.findByID({
              collection: 'comments',
              id: data.parentComment,
              depth: 0,
            })
            if (!parent) throw new APIError('Parent comment not found.', 400)
            
            const parentArticleId = typeof parent.article === 'object' ? parent.article.id : parent.article
            const dataArticleId = typeof data.article === 'object' ? data.article.id : data.article
            
            if (String(parentArticleId) !== String(dataArticleId)) {
              throw new APIError('A reply must belong to the same article as its parent comment.', 400)
            }
          }

          // Compute Avatar Info
          if (data.email) {
            const normalizedEmail = data.email.trim().toLowerCase()
            const hash = crypto.createHash('sha256').update(normalizedEmail).digest('hex')
            // Using d=404 so that if Gravatar doesn't exist, it returns 404 and the frontend can fallback to initials
            data.avatarUrl = `https://www.gravatar.com/avatar/${hash}?d=404&s=96`
          }

          if (data.name) {
            const parts = data.name.trim().split(/\s+/)
            if (parts.length > 1) {
              data.initials = (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
            } else if (parts.length === 1) {
              data.initials = parts[0].charAt(0).toUpperCase()
            } else {
              data.initials = 'U'
            }
          }
        }

        // Always clean HTML from content to prevent XSS (only allow plain text)
        if (data.content) {
          data.content = data.content.replace(/<[^>]*>?/gm, '').trim()
        }

        return data
      }
    ],
    afterChange: [
      async ({ doc, previousDoc, req, operation }) => {
        // If status changed to approved, and it's a reply, send email to parent
        if (
          doc.status === 'approved' && 
          doc.parentComment && 
          (operation === 'create' || (operation === 'update' && previousDoc?.status !== 'approved'))
        ) {
          await req.payload.jobs?.queue({
            task: 'sendCommentReplyEmail',
            input: { commentId: doc.id } as any,
          } as any)
        }
      }
    ]
  },
  fields: [
    {
      name: 'article',
      type: 'relationship',
      relationTo: 'articles',
      required: true,
      index: true,
    },
    {
      name: 'parentComment',
      type: 'relationship',
      relationTo: 'comments',
      required: false,
      index: true,
      filterOptions: ({ data }) => {
        // When selecting a parent comment in the admin UI, restrict it to comments from the same article
        if (data.article) {
          return {
            article: { equals: data.article },
          }
        }
        return true
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      access: {
        // Do not expose email in public API responses
        read: ({ req: { user } }) => Boolean(user),
      }
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Spam', value: 'spam' },
        { label: 'Deleted', value: 'deleted' },
      ],
      access: {
        update: ({ req: { user } }) => Boolean(user),
      },
      admin: {
        position: 'sidebar',
      }
    },
    {
      name: 'authorType',
      type: 'select',
      defaultValue: 'reader',
      options: [
        { label: 'Reader', value: 'reader' },
        { label: 'Author', value: 'author' },
        { label: 'Admin', value: 'admin' },
      ],
      access: {
        update: ({ req: { user } }) => Boolean(user),
      },
      admin: {
        position: 'sidebar',
      }
    },
    {
      name: 'avatarUrl',
      type: 'text',
      admin: {
        readOnly: true,
      },
      access: {
        create: () => false,
        update: () => false,
      }
    },
    {
      name: 'initials',
      type: 'text',
      admin: {
        readOnly: true,
      },
      access: {
        create: () => false,
        update: () => false,
      }
    }
  ]
}
