import { Payload } from 'payload'

const defaultTemplates = [
  {
    name: 'Subscription Verification',
    slug: 'subscription-verification',
    type: 'subscriptionVerification',
    subject: 'Confirm your SciConnectWorld subscription',
    htmlBody: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Welcome to {{site.name}}</h2>
  <p>Please confirm your email address to start receiving our science, technology and innovation stories.</p>
  <div style="margin: 30px 0;">
    <a href="{{verificationUrl}}" style="background-color: #2563EB; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Confirm Subscription</a>
  </div>
  <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
</div>
    `,
    textBody: 'Please confirm your email address by visiting: {{verificationUrl}}',
  },
  {
    name: 'New Article Notification',
    slug: 'new-article',
    type: 'newArticle',
    subject: 'New on {{site.name}}: {{article.title}}',
    htmlBody: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #111;">{{article.title}}</h2>
  <p style="color: #444; font-size: 16px; line-height: 1.5;">{{article.excerpt}}</p>
  <div style="margin: 30px 0;">
    <a href="{{article.url}}" style="background-color: #2563EB; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Read Article</a>
  </div>
  <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
  <p style="color: #666; font-size: 12px; text-align: center;">
    You are receiving this because you subscribed to {{site.name}}.<br>
    <a href="{{unsubscribeUrl}}" style="color: #999;">Unsubscribe</a>
  </p>
</div>
    `,
    textBody: 'Read our new article: {{article.title}}\n\n{{article.excerpt}}\n\nRead here: {{article.url}}\n\nUnsubscribe: {{unsubscribeUrl}}',
  },
]

export async function seedEmailTemplates(payload: Payload, isDryRun: boolean) {
  let createdCount = 0

  for (const template of defaultTemplates) {
    const existing = await payload.find({
      collection: 'email-templates',
      where: { slug: { equals: template.slug } },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      if (!isDryRun) {
        await payload.create({
          collection: 'email-templates',
          data: template as any,
        })
      }
      createdCount++
    }
  }

  return createdCount
}
