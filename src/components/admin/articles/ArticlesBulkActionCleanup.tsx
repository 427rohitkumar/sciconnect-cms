'use client'

import React, { useEffect } from 'react'

export const ArticlesBulkActionCleanup: React.FC = () => {
  useEffect(() => {
    const cleanBulkToolbar = () => {
      const selectionToolbar = document.querySelector('.list-selection, [class*="ListSelection"]')
      if (!selectionToolbar) return

      const actionItems = selectionToolbar.querySelectorAll(
        'button, a, [role="button"], [class*="EditMany"], [class*="PublishMany"], [class*="UnpublishMany"]'
      )

      actionItems.forEach((el) => {
        const text = (el.textContent || '').trim().toLowerCase()
        const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase()
        const className = typeof el.className === 'string' ? el.className : ''

        const isDelete =
          text.includes('delete') ||
          ariaLabel.includes('delete') ||
          className.includes('delete') ||
          className.includes('DeleteMany')

        if (!isDelete) {
          const isEditPublishUnpublish =
            text.includes('edit') ||
            text.includes('publish') ||
            text.includes('unpublish') ||
            ariaLabel.includes('edit') ||
            ariaLabel.includes('publish') ||
            ariaLabel.includes('unpublish') ||
            className.includes('EditMany') ||
            className.includes('PublishMany') ||
            className.includes('UnpublishMany')

          if (isEditPublishUnpublish) {
            ;(el as HTMLElement).style.display = 'none'
          }
        }
      })
    }

    const observer = new MutationObserver(cleanBulkToolbar)
    observer.observe(document.body, { childList: true, subtree: true })
    cleanBulkToolbar()

    return () => observer.disconnect()
  }, [])

  return (
    <style>{`
      .list-selection [class*="EditMany"],
      .list-selection [class*="PublishMany"],
      .list-selection [class*="UnpublishMany"],
      [class*="ListSelection"] [class*="EditMany"],
      [class*="ListSelection"] [class*="PublishMany"],
      [class*="ListSelection"] [class*="UnpublishMany"] {
        display: none !important;
      }
    `}</style>
  )
}

export default ArticlesBulkActionCleanup
