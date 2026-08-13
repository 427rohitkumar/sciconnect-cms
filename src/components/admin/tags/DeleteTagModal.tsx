'use client'

import React, { useEffect, useState } from 'react'
import { TagDoc, deleteTagAction, getTagArticleCountAction } from '../../../app/(payload)/admin/actions/tags'

interface DeleteTagModalProps {
  tag: TagDoc
  onClose: () => void
  onSuccess: (deletedId: string | number) => void
}

export const DeleteTagModal: React.FC<DeleteTagModalProps> = ({ tag, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [articleCount, setArticleCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getTagArticleCountAction(tag.id)
      .then((count) => setArticleCount(count))
      .catch(() => setArticleCount(0))
  }, [tag.id])

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await deleteTagAction(tag.id)
      if (result.success) {
        onSuccess(tag.id)
      } else {
        setError(result.message || 'Failed to delete tag.')
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="sciconnect-modal-overlay" tabIndex={-1}>
      <div className="sciconnect-modal" role="dialog" aria-modal="true">
        <div className="sciconnect-modal__header">
          <h3>Delete Tag?</h3>
          <button className="sciconnect-modal__close-btn" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="sciconnect-modal__body">
          {articleCount !== null && articleCount > 0 ? (
            <p style={{ color: 'var(--theme-warning-600, #f59e0b)', marginBottom: '12px' }}>
              This tag is currently used by <strong>{articleCount}</strong> article(s). Are you sure you want to delete it?
            </p>
          ) : (
            <p>
              Are you sure you want to delete tag <strong>&ldquo;{tag.name}&rdquo;</strong>?
            </p>
          )}
          {error && <div className="sciconnect-modal__error-box">{error}</div>}
        </div>

        <div className="sciconnect-modal__footer">
          <button
            type="button"
            className="btn btn--style-secondary btn--size-medium"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--style-primary btn--size-medium sciconnect-btn--danger"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
