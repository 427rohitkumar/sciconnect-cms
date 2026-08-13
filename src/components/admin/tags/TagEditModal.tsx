'use client'

import React, { useState } from 'react'
import { TagDoc, updateTagAction } from '../../../app/(payload)/admin/actions/tags'

interface TagEditModalProps {
  tag: TagDoc
  onClose: () => void
  onSuccess: (updatedTag: TagDoc) => void
}

export const TagEditModal: React.FC<TagEditModalProps> = ({ tag, onClose, onSuccess }) => {
  const [name, setName] = useState(tag.name)
  const [description, setDescription] = useState(tag.description || '')
  const [status, setStatus] = useState<'active' | 'inactive'>(tag.status || 'active')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Tag name is required.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await updateTagAction({
        id: tag.id,
        name: name.trim(),
        description: description.trim(),
        status,
      })

      if (res.success && res.tag) {
        onSuccess(res.tag)
      } else {
        setError(res.message || 'Failed to update tag.')
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
        <form onSubmit={handleSubmit}>
          <div className="sciconnect-modal__header">
            <h3>Edit Tag</h3>
            <button
              type="button"
              className="sciconnect-modal__close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          <div className="sciconnect-modal__body">
            {error && <div className="sciconnect-modal__error-box">{error}</div>}

            <div className="sciconnect-form-group">
              <label htmlFor="tag-edit-name">Tag Name *</label>
              <input
                id="tag-edit-name"
                type="text"
                className="sciconnect-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="sciconnect-form-group">
              <label htmlFor="tag-edit-slug">Slug (Auto-generated)</label>
              <input
                id="tag-edit-slug"
                type="text"
                className="sciconnect-input"
                value={tag.slug}
                disabled
              />
            </div>

            <div className="sciconnect-form-group">
              <label htmlFor="tag-edit-desc">Description</label>
              <textarea
                id="tag-edit-desc"
                className="sciconnect-textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="sciconnect-form-group">
              <label htmlFor="tag-edit-status">Status *</label>
              <select
                id="tag-edit-status"
                className="sciconnect-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
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
              type="submit"
              className="btn btn--style-primary btn--size-medium"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
