import { CollectionConfig } from 'payload'
import crypto from 'crypto'

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  admin: {
    useAsTitle: 'email',
    group: 'Newsletter',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user), // Admins only
    create: () => true, // Publicly creatable
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  endpoints: [
    {
      path: '/verify',
      method: 'post',
      handler: async (req) => {
        const { token, email } = req.body as any
        if (!token || !email) return new Response(JSON.stringify({ success: false, message: 'Missing token or email' }), { status: 400 })

        const hash = crypto.createHash('sha256').update(token).digest('hex')
        
        const subscribers = await req.payload.find({
          collection: 'subscribers' as any,
          where: {
            email: { equals: email.toLowerCase() },
            verificationTokenHash: { equals: hash },
          } as any,
          limit: 1,
        })

        if (subscribers.docs.length === 0) {
          return new Response(JSON.stringify({ success: false, message: 'Invalid or expired token.' }), { status: 400 })
        }

        const subscriber: any = subscribers.docs[0]
        
        if (new Date(subscriber.verificationTokenExpiresAt) < new Date()) {
          return new Response(JSON.stringify({ success: false, message: 'Token expired.' }), { status: 400 })
        }

        await req.payload.update({
          collection: 'subscribers' as any,
          id: subscriber.id,
          data: {
            status: 'active',
            verificationTokenHash: null,
            verificationTokenExpiresAt: null,
            verifiedAt: new Date().toISOString(),
          } as any,
        })

        return new Response(JSON.stringify({ success: true, message: 'Subscription verified successfully.' }), { status: 200 })
      },
    },
    {
      path: '/unsubscribe',
      method: 'post',
      handler: async (req) => {
        const { token, email, subscriberId } = req.body as any
        
        if (!email && !subscriberId) return new Response(JSON.stringify({ success: false, message: 'Missing identifiers' }), { status: 400 })

        let subscriber = null

        // If it's a stateless campaign unsubscribe
        if (subscriberId && token) {
           const hmac = crypto.createHmac('sha256', process.env.PAYLOAD_SECRET || 'secret')
           hmac.update(subscriberId.toString())
           const expectedToken = hmac.digest('hex')
           
           if (token !== expectedToken) {
              return new Response(JSON.stringify({ success: false, message: 'Invalid token' }), { status: 400 })
           }
           
           subscriber = await req.payload.findByID({ collection: 'subscribers' as any, id: subscriberId })
        } 
        // If it's a stateful direct unsubscribe (e.g. from welcome email)
        else if (email && token) {
           const hash = crypto.createHash('sha256').update(token).digest('hex')
           const subs = await req.payload.find({
             collection: 'subscribers' as any,
             where: { email: { equals: email.toLowerCase() }, unsubscribeTokenHash: { equals: hash } } as any,
             limit: 1
           })
           if (subs.docs.length > 0) subscriber = subs.docs[0]
        }

        if (!subscriber) {
          return new Response(JSON.stringify({ success: false, message: 'Subscriber not found or invalid token.' }), { status: 400 })
        }

        await req.payload.update({
          collection: 'subscribers' as any,
          id: subscriber.id,
          data: {
            status: 'unsubscribed',
            unsubscribedAt: new Date().toISOString(),
          } as any,
        })

        return new Response(JSON.stringify({ success: true, message: 'Unsubscribed successfully.' }), { status: 200 })
      },
    },
  ],
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      admin: {
        description: 'Subscriber email address',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Active', value: 'active' },
        { label: 'Unsubscribed', value: 'unsubscribed' },
        { label: 'Bounced', value: 'bounced' },
        { label: 'Blocked', value: 'blocked' },
      ],
      required: true,
    },
    {
      name: 'verificationTokenHash',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Do not edit directly. Automatically generated hash.',
      },
      access: {
        read: () => false, // Do not expose in GraphQL/REST API reads
      },
    },
    {
      name: 'verificationTokenExpiresAt',
      type: 'date',
    },
    {
      name: 'unsubscribeTokenHash',
      type: 'text',
      admin: {
        readOnly: true,
      },
      access: {
        read: () => false,
      },
    },
    {
      name: 'source',
      type: 'text',
      defaultValue: 'website',
    },
    {
      name: 'verifiedAt',
      type: 'date',
    },
    {
      name: 'unsubscribedAt',
      type: 'date',
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && data) {
          // Force lower case and trim email
          if (data.email) {
            data.email = data.email.toLowerCase().trim()
          }
          // Set status to pending on create
          data.status = 'pending'

          // Generate tokens
          const rawVerificationToken = crypto.randomBytes(32).toString('hex')
          const rawUnsubscribeToken = crypto.randomBytes(32).toString('hex')

          // Hash tokens
          data.verificationTokenHash = crypto.createHash('sha256').update(rawVerificationToken).digest('hex')
          data.unsubscribeTokenHash = crypto.createHash('sha256').update(rawUnsubscribeToken).digest('hex')

          // Expiration in 24 hours
          const expiresAt = new Date()
          expiresAt.setHours(expiresAt.getHours() + 24)
          data.verificationTokenExpiresAt = expiresAt.toISOString()

          // Attach raw tokens temporarily to req.context so afterChange hook can send the email
          req.context.rawVerificationToken = rawVerificationToken
          req.context.rawUnsubscribeToken = rawUnsubscribeToken
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation === 'create' && req.context.rawVerificationToken) {
          if (req.payload.jobs && req.payload.jobs.queue) {
            await req.payload.jobs.queue({
              task: 'sendVerificationEmail',
              input: {
                subscriberId: doc.id,
                rawVerificationToken: req.context.rawVerificationToken,
              } as any,
            } as any)
          }
        }
      }
    ]
  },
}
