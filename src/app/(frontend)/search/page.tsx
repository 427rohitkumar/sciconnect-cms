import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedParams = await searchParams
  const queryParam = resolvedParams.q
  const query = Array.isArray(queryParam) ? queryParam[0] : queryParam || ''
  
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  
  let results: any[] = []
  if (query.trim()) {
    const data = await payload.find({
      collection: 'articles',
      where: {
        and: [
          {
            _status: {
              equals: 'published',
            }
          },
          {
            or: [
              {
                title: {
                  like: query
                }
              },
              {
                excerpt: {
                  like: query
                }
              }
            ]
          }
        ]
      },
      depth: 1,
      limit: 24,
      sort: '-publishedAt',
    })
    results = data.docs
  }

  return (
    <div className="search-page">
      <header className="search-header">
        <Link href="/" className="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to Home
        </Link>
        <div className="logo-wrap search-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Sci-Connect Logo" src="/logo.png" className="logo-img-small" />
          <span className="brand-name-small">Sci-Connect</span>
        </div>
      </header>

      <main className="search-main">
        <div className="search-hero">
          <h1 className="search-title">Enterprise Search</h1>
          <p className="search-subtitle">Find articles, research, and insights instantly.</p>
          
          <form className="search-form" method="GET" action="/search">
            <div className="search-input-wrapper">
              <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input 
                type="text" 
                name="q" 
                placeholder="Search articles by title, keyword, or excerpt..." 
                defaultValue={query} 
                className="search-input"
                autoFocus
              />
              <button type="submit" className="search-button">Search</button>
            </div>
          </form>
        </div>

        <div className="search-results-container">
          {query && (
            <h2 className="results-heading">
              {results.length > 0 
                ? `Found ${results.length} result${results.length === 1 ? '' : 's'} for "${query}"`
                : `No results found for "${query}"`}
            </h2>
          )}

          {results.length > 0 && (
            <div className="results-grid">
              {results.map((article) => {
                const imageUrl = article.featuredImage?.url || '/fallback-image.jpg'
                return (
                  <article key={article.id} className="result-card">
                    <div className="card-image-wrap">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt={article.title} className="card-image" />
                      <div className="card-type-badge">
                        {article.contentType === 'video' ? 'Video' : 'Article'}
                      </div>
                    </div>
                    <div className="card-content">
                      <h3 className="card-title">{article.title}</h3>
                      {article.excerpt && <p className="card-excerpt">{article.excerpt.length > 120 ? article.excerpt.substring(0, 120) + '...' : article.excerpt}</p>}
                      <div className="card-footer">
                        <span className="card-date">
                          {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <Link href={`/articles/${article.slug}`} className="card-read-more">Read &rarr;</Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
