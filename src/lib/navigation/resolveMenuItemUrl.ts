export function resolveMenuItemUrl(item: any): string {
  if (item.linkType === 'external' && item.externalUrl) {
    return item.externalUrl
  }

  if (item.linkType === 'internal') {
    if (item.internalType === 'article' && item.article) {
      const slug = typeof item.article === 'object' ? item.article.slug : item.article
      return `/articles/${slug}`
    }

    if (item.internalType === 'category' && item.category) {
      const slug = typeof item.category === 'object' ? item.category.slug : item.category
      return `/category/${slug}`
    }

    if (item.internalType === 'custom' && item.customPath) {
      return item.customPath
    }
  }

  return '#'
}
