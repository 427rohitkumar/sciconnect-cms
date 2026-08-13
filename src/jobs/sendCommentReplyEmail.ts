import { Payload } from 'payload'

export const sendCommentReplyEmail: any = {
  slug: 'sendCommentReplyEmail',
  handler: async ({ req, input }: { req: any; input: any }) => {
    const payload: Payload = req.payload
    const { commentId } = input

    try {
      // Fetch the reply comment
      const reply = await payload.findByID({
        collection: 'comments',
        id: commentId,
        depth: 1, // To get the parent comment and article
      })

      if (!reply) {
        req.payload.logger.error(`sendCommentReplyEmail: Reply comment ${commentId} not found`)
        return { output: { success: false } }
      }

      if (!reply.parentComment) {
        req.payload.logger.error(`sendCommentReplyEmail: Comment ${commentId} has no parent`)
        return { output: { success: false } }
      }

      const parentComment: any = reply.parentComment
      const article: any = reply.article

      // Simple idempotency check via NewsletterDeliveries (used generically for email delivery logs)
      const existingLogs = await payload.find({
        collection: 'newsletter-deliveries',
        where: {
          and: [
            { type: { equals: 'commentReply' } },
            { providerMessageId: { equals: `reply-${reply.id}` } },
          ]
        },
        limit: 1,
      } as any)

      if (existingLogs.docs.length > 0) {
        req.payload.logger.info(`sendCommentReplyEmail: Notification already sent for reply ${reply.id}`)
        return { output: { success: true, duplicate: true } }
      }

      // Find the email template
      const templates = await payload.find({
        collection: 'email-templates',
        where: { type: { equals: 'commentReply' }, enabled: { equals: true } },
        limit: 1,
      })

      const template: any = templates.docs[0]
      if (!template) {
        req.payload.logger.error(`sendCommentReplyEmail: No enabled commentReply template found`)
        return { output: { success: false } }
      }

      // Render template (simple replacement for MVP)
      const frontendUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4001'
      const articleUrl = `${frontendUrl}/articles/${article.slug}`
      const commentUrl = `${articleUrl}#comment-${reply.id}`
      const unsubscribeUrl = `${frontendUrl}/newsletter/unsubscribe` // Simple fallback

      const render = (str: string) => {
        return str
          .replace(/\{\{subscriber\.name\}\}/g, parentComment.name)
          .replace(/\{\{comment\.authorName\}\}/g, parentComment.name)
          .replace(/\{\{comment\.content\}\}/g, parentComment.content)
          .replace(/\{\{reply\.authorName\}\}/g, reply.name)
          .replace(/\{\{reply\.content\}\}/g, reply.content)
          .replace(/\{\{article\.title\}\}/g, article.title)
          .replace(/\{\{article\.url\}\}/g, articleUrl)
          .replace(/\{\{comment\.url\}\}/g, commentUrl)
          .replace(/\{\{site\.name\}\}/g, 'SciConnectWorld')
          .replace(/\{\{unsubscribeUrl\}\}/g, unsubscribeUrl)
      }

      const subject = render(template.subject)
      const htmlBody = render(template.htmlBody)

      // Get email settings
      const settings: any = await payload.findGlobal({
        slug: 'email-settings' as any,
      })

      if (!settings?.enableEmailSending) {
        req.payload.logger.info(`sendCommentReplyEmail: Email sending is disabled in settings`)
        return { output: { success: false, skipped: true } }
      }

      const fromName = settings.fromName || 'SciConnectWorld'
      const fromEmail = settings.fromEmail || process.env.SMTP_FROM_EMAIL || 'noreply@sciconnect.world'
      const replyTo = settings.replyTo || fromEmail

      // Send Email
      let deliveryStatus = 'failed'
      let errorMessage = ''
      
      try {
        await payload.sendEmail({
          to: parentComment.email,
          from: `"${fromName}" <${fromEmail}>`,
          replyTo,
          subject,
          html: htmlBody,
        })
        deliveryStatus = 'sent'
      } catch (err: any) {
        req.payload.logger.error(`sendCommentReplyEmail Error: ${err.message}`)
        errorMessage = err.message
      }

      // Log delivery
      await payload.create({
        collection: 'newsletter-deliveries',
        data: {
          email: parentComment.email,
          article: article.id,
          template: template.id,
          status: deliveryStatus,
          errorMessage: errorMessage,
          providerMessageId: `reply-${reply.id}`,
        } as any,
      })

      return {
        output: { success: deliveryStatus === 'sent' }
      }
    } catch (error: any) {
      req.payload.logger.error(`sendCommentReplyEmail Fatal Error: ${error.message}`)
      return { output: { success: false, error: error.message } }
    }
  },
}
