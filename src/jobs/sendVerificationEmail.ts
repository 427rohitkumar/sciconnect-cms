import { Payload } from 'payload'

export const sendVerificationEmail: any = {
  slug: 'sendVerificationEmail',
  inputSchema: [
    { name: 'subscriberId', type: 'text', required: true },
    { name: 'rawVerificationToken', type: 'text', required: true },
  ],
  handler: async ({ input, payload }: { input: any; payload: Payload }) => {
    const { subscriberId, rawVerificationToken } = input

    const subscriber: any = await payload.findByID({
      collection: 'subscribers' as any,
      id: subscriberId,
    })

    if (!subscriber || subscriber.status !== 'pending') {
      return { output: { success: false, reason: 'Subscriber not pending' } }
    }

    const templates = await payload.find({
      collection: 'email-templates' as any,
      where: {
        type: { equals: 'subscriptionVerification' },
        enabled: { equals: true },
      },
      limit: 1,
    })

    const template: any = templates.docs[0]
    if (!template) {
      payload.logger.error('No verification template found.')
      return { output: { success: false } }
    }

    const settings: any = await payload.findGlobal({ slug: 'email-settings' as any })
    if (!settings.enableEmailSending) return { output: { success: false } }
    const siteSettings: any = await payload.findGlobal({ slug: 'site-settings' as any })

    const verificationUrl = `${siteSettings.siteUrl}/newsletter/verify?token=${rawVerificationToken}&email=${encodeURIComponent(subscriber.email)}`

    let html = template.htmlBody.replace(/{{verificationUrl}}/g, verificationUrl)
    let subject = template.subject

    const message = {
      to: subscriber.email,
      from: `"${settings.fromName || 'SciConnectWorld'}" <${settings.fromEmail || 'noreply@sciconnect.world'}>`,
      replyTo: settings.replyTo,
      subject,
      html,
    }

    await payload.sendEmail(message)

    return { output: { success: true } }
  },
}
