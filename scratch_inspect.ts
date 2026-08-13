import { getPayload } from 'payload'
import config from './src/payload.config'

async function inspect() {
  const payload = await getPayload({ config: await config })
  
  const articlesCount = await payload.count({ collection: 'articles' })
  const usersCount = await payload.count({ collection: 'users' })
  
  console.log(`Total Articles: ${articlesCount.totalDocs}`)
  console.log(`Total Users: ${usersCount.totalDocs}`)

  if (articlesCount.totalDocs > 0) {
    const articles = await payload.find({
      collection: 'articles',
      limit: 10,
    })
    console.log('Sample Articles:', JSON.stringify(articles.docs.map(a => ({ id: a.id, title: a.title, author: a.author })), null, 2))
  }

  process.exit(0)
}

inspect().catch(err => {
  console.error(err)
  process.exit(1)
})
