import { Payload } from 'payload'

export const sendNewsletterEmail: any = {
  slug: 'sendNewsletterEmail',
  inputSchema: [
    {
      name: 'deliveryId',
      type: 'text',
      required: true,
    },
  ],
  handler: async ({ input, payload }: { input: any; payload: Payload }) => {
    const { deliveryId } = input

    // 1. Fetch delivery
    const delivery = await payload.findByID({
      collection: 'newsletter-deliveries' as any,
      id: deliveryId,
      depth: 2, // to get subscriber, article, and template data
    })

    if (!delivery || delivery.status !== 'queued') {
      return { output: { success: false, reason: 'Invalid or already processed delivery' } }
    }

    // Mark as sending
    await payload.update({
      collection: 'newsletter-deliveries' as any,
      id: deliveryId,
      data: {
        status: 'sending',
        attemptCount: (delivery.attemptCount || 0) + 1,
      } as any,
    })

    try {
      const subscriber: any = typeof delivery.subscriber === 'object' ? delivery.subscriber : null
      const article: any = typeof delivery.article === 'object' ? delivery.article : null
      const template: any = typeof delivery.template === 'object' ? delivery.template : null

      if (!subscriber || !template) {
        throw new Error('Missing subscriber or template data')
      }

      // 2. Fetch email settings
      const settings: any = await payload.findGlobal({
        slug: 'email-settings' as any,
      })

      if (!settings.enableEmailSending) {
        await payload.update({
          collection: 'newsletter-deliveries' as any,
          id: deliveryId,
          data: { status: 'skipped', errorMessage: 'Email sending disabled globally' } as any,
        })
        return { output: { success: false, skipped: true } }
      }

      const siteSettings: any = await payload.findGlobal({
        slug: 'site-settings' as any,
      })

      // 3. Render Template
      let html = template.htmlBody
      let subject = template.subject

      // Very simple replacement logic
      const vars: Record<string, string> = {
        '{{subscriber.email}}': subscriber.email,
        '{{site.name}}': siteSettings.siteName || 'SciConnectWorld',
        '{{site.url}}': siteSettings.siteUrl || 'https://sciconnect.world',
      }

      if (article) {
        vars['{{article.title}}'] = article.title
        vars['{{article.excerpt}}'] = article.excerpt || ''
        vars['{{article.url}}'] = `${siteSettings.siteUrl}/articles/${article.slug}`
        vars['{{article.category}}'] = typeof article.category === 'object' ? article.category?.title || '' : ''
      }
      
      // Allow passing raw unhashed tokens from context (for verification/unsubscribe emails sent directly)
      // Usually these jobs might receive it via input if it's not a campaign
      if (input.rawVerificationToken) {
        vars['{{verificationUrl}}'] = `${siteSettings.siteUrl}/newsletter/verify?token=${input.rawVerificationToken}&email=${encodeURIComponent(subscriber.email)}`
      }
      if (input.rawUnsubscribeToken) {
         vars['{{unsubscribeUrl}}'] = `${siteSettings.siteUrl}/newsletter/unsubscribe?token=${input.rawUnsubscribeToken}&email=${encodeURIComponent(subscriber.email)}`
      }

      // If this is a campaign, we don't have the raw unsubscribe token because it's hashed in DB!
      // Wait, how does unsubscribe work for newsletter campaigns?
      // A common pattern is that the campaign email includes an unsubscribe link. But we only have the hash.
      // Usually, when creating a subscriber, we generate a UUID for unsubscribe and store it raw in DB if it's just a UUID,
      // or we issue a short-lived token. If we store a hash, we can't reconstruct the URL.
      // The user feedback said: "verificationToken and unsubscribeToken ko plaintext me database me rakhna avoid karna better hai. Use verificationTokenHash... Database me SHA-256(rawToken)... Isse DB leak hone par active links directly usable nahi honge."
      // BUT if the unsubscribe token is hashed in DB, how do we send the unsubscribe link in a newsletter?
      // We'd have to generate a new unsubscribe token for EVERY newsletter, or use a JWT that includes the subscriber ID and is signed by PAYLOAD_SECRET.
      // Let's generate a stateless unsubscribe token signed by PAYLOAD_SECRET for the campaign emails.
      // Or we can use the `payload.secret`.
      // Actually, since I don't have crypto easily available here, I'll just use a JWT or HMAC for the unsubscribe URL in the campaign.
      // Let's require the `crypto` module.
      
      const crypto = await import('crypto')
      const hmac = crypto.createHmac('sha256', process.env.PAYLOAD_SECRET || 'secret')
      hmac.update(subscriber.id.toString())
      const statelessUnsubscribeToken = hmac.digest('hex')
      const statelessUnsubscribeUrl = `${siteSettings.siteUrl}/newsletter/unsubscribe?subscriberId=${subscriber.id}&token=${statelessUnsubscribeToken}`
      
      vars['{{unsubscribeUrl}}'] = statelessUnsubscribeUrl

      for (const [key, value] of Object.entries(vars)) {
        html = html.replace(new RegExp(key, 'g'), value)
        subject = subject.replace(new RegExp(key, 'g'), value)
      }

      // 4. Send Email
      const message = {
        to: subscriber.email,
        from: `"${settings.fromName || 'SciConnectWorld'}" <${settings.fromEmail || 'noreply@sciconnect.world'}>`,
        replyTo: settings.replyTo,
        subject,
        html,
      }

      await payload.sendEmail(message)

      // 5. Mark as sent
      await payload.update({
        collection: 'newsletter-deliveries' as any,
        id: deliveryId,
        data: {
          status: 'sent',
          errorMessage: null,
        } as any,
      })
      
      // 6. Update subscriber last sent count
      // Need a custom query since subscriber might not have these fields yet, but we'll try
      try {
         await payload.update({
            collection: 'subscribers' as any,
            id: subscriber.id,
            data: {
              // We'd have lastEmailSentAt and emailCount if we added them to the schema.
            } as any
         })
      } catch (e) {
          // Ignore
      }

      return { output: { success: true } }
    } catch (err: any) {
      payload.logger.error(`Error sending newsletter delivery ${deliveryId}: ${err.message}`)
      
      const attemptCount = (delivery.attemptCount || 0) + 1
      const isPermanent = attemptCount >= 3

      await payload.update({
        collection: 'newsletter-deliveries' as any,
        id: deliveryId,
        data: {
          status: isPermanent ? 'failed' : 'queued', // Re-queue if not permanent
          errorMessage: err.message,
        } as any,
      })

      if (isPermanent) {
         return { output: { success: false, reason: 'Max attempts reached' } }
      } else {
         throw err // Throwing causes the jobs plugin to mark it as failed for retry based on its own config
      }
    }
  },
}
