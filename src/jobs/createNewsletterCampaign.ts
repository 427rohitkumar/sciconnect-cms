import { Payload } from 'payload'

export const createNewsletterCampaign: any = {
  slug: 'createNewsletterCampaign',
  inputSchema: [
    {
      name: 'articleId',
      type: 'text',
      required: true,
    },
  ],
  handler: async ({ input, payload }: { input: any; payload: Payload }) => {
    const { articleId } = input

    // Find the new article template
    const templates = await payload.find({
      collection: 'email-templates' as any,
      where: {
        type: { equals: 'newArticle' },
        enabled: { equals: true },
      },
      limit: 1,
    })

    const template: any = templates.docs[0]
    if (!template) {
      payload.logger.error('No enabled newArticle template found. Aborting campaign.')
      return { output: { success: false, reason: 'No template' } }
    }

    // Find all active subscribers
    const limit = 100
    let page = 1
    let totalCreated = 0
    let hasMore = true

    while (hasMore) {
      const subscribers = await payload.find({
        collection: 'subscribers' as any,
        where: {
          status: { equals: 'active' },
        },
        limit,
        page,
      })

      for (const subscriberItem of subscribers.docs) {
        const subscriber: any = subscriberItem
        // Idempotency check: see if delivery already exists
        const existing = await payload.find({
          collection: 'newsletter-deliveries' as any,
          where: {
            and: [
              { subscriber: { equals: subscriber.id } },
              { article: { equals: articleId } },
            ],
          },
          limit: 1,
        })

        if (existing.docs.length === 0) {
          // Create delivery record
          const delivery = await payload.create({
            collection: 'newsletter-deliveries' as any,
            data: {
              subscriber: subscriber.id,
              article: articleId,
              email: subscriber.email,
              template: template.id,
              status: 'queued',
              attemptCount: 0,
            } as any,
          })

          // Queue the send job
          if (payload.jobs && payload.jobs.queue) {
             await payload.jobs.queue({
              task: 'sendNewsletterEmail',
              input: {
                deliveryId: delivery.id,
              } as any,
            } as any)
          }
          totalCreated++
        }
      }

      hasMore = subscribers.hasNextPage
      page++
    }

    return {
      output: {
        success: true,
        created: totalCreated,
      },
    }
  },
}
