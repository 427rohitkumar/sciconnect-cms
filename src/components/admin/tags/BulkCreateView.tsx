'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  TagDoc,
  bulkCreateTagsAction,
  checkExistingTagNamesAction,
} from '../../../app/(payload)/admin/actions/tags'

interface PendingTagItem {
  id: string
  name: string
  existsInDb?: boolean
  checking?: boolean
}

export const BulkCreateView: React.FC = () => {
  const router = useRouter()
  const [inputValue, setInputValue] = useState('')
  const [pendingTags, setPendingTags] = useState<PendingTagItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resultSummary, setResultSummary] = useState<{
    createdCount: number
    skippedCount: number
    createdTags: TagDoc[]
    skippedTags: Array<{ name: string; reason: string }>
  } | null>(null)

  // Validate existing DB tags when pendingTags list changes
  useEffect(() => {
    const unverifiedNames = pendingTags
      .filter((t) => t.existsInDb === undefined && !t.checking)
      .map((t) => t.name)

    if (unverifiedNames.length === 0) return

    setPendingTags((prev) =>
      prev.map((t) => (unverifiedNames.includes(t.name) ? { ...t, checking: true } : t)),
    )

    checkExistingTagNamesAction(unverifiedNames)
      .then((existsMap) => {
        setPendingTags((prev) =>
          prev.map((t) => {
            if (existsMap[t.name] !== undefined) {
              return { ...t, existsInDb: existsMap[t.name], checking: false }
            }
            return t
          }),
        )
      })
      .catch((err) => {
        console.error('Failed to check existing tags:', err)
        setPendingTags((prev) =>
          prev.map((t) => (unverifiedNames.includes(t.name) ? { ...t, checking: false } : t)),
        )
      })
  }, [pendingTags])

  const addTagNames = (rawString: string) => {
    if (!rawString.trim()) return

    // Support comma separated strings
    const parts = rawString
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean)

    if (parts.length === 0) return

    setPendingTags((prev) => {
      const updated = [...prev]
      const existingKeys = new Set(updated.map((t) => t.name.toLowerCase()))

      for (const name of parts) {
        const key = name.toLowerCase()
        if (!existingKeys.has(key)) {
          existingKeys.add(key)
          updated.push({
            id: Math.random().toString(36).substring(2, 9),
            name,
          })
        }
      }

      return updated
    })

    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      addTagNames(inputValue)
    }
  }

  const removePendingTag = (id: string) => {
    setPendingTags((prev) => prev.filter((t) => t.id !== id))
  }

  const validPendingTags = pendingTags.filter((t) => !t.existsInDb)
  const validCount = validPendingTags.length

  const handleSaveValidTags = async () => {
    if (validCount === 0 || isSubmitting) return

    setIsSubmitting(true)
    try {
      const namesToCreate = validPendingTags.map((t) => t.name)
      const res = await bulkCreateTagsAction(namesToCreate)
      setResultSummary(res)
    } catch (err: any) {
      alert(err?.message || 'Failed to bulk create tags.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFinish = () => {
    router.push('/admin/collections/tags')
  }

  return (
    <div className="sciconnect-bulk-tags">
      {/* Top Header Bar */}
      <div className="sciconnect-bulk-tags__header">
        <div>
          <h1 className="sciconnect-bulk-tags__title">Bulk Create Tags</h1>
          <p className="sciconnect-bulk-tags__subtitle">
            Type a tag and press Enter or Tab to add it to the list.
          </p>
        </div>
        <div className="sciconnect-bulk-tags__actions">
          <Link
            href="/admin/collections/tags"
            className="btn btn--style-secondary btn--size-medium"
            style={{ marginRight: '8px' }}
          >
            Cancel
          </Link>
          <button
            type="button"
            className="btn btn--style-primary btn--size-medium"
            onClick={handleSaveValidTags}
            disabled={validCount === 0 || isSubmitting}
          >
            {isSubmitting ? 'Saving Tags...' : 'Save Valid Tags'}
          </button>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="sciconnect-bulk-tags__card">
        <div className="sciconnect-form-group">
          <label htmlFor="bulk-tag-input" className="sciconnect-bulk-tags__input-label">
            Tag Name
          </label>
          <input
            id="bulk-tag-input"
            type="text"
            className="sciconnect-input sciconnect-bulk-tags__input"
            placeholder="e.g. Cricket, Bollywood, Breaking News..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (inputValue.trim()) addTagNames(inputValue)
            }}
          />
        </div>

        {/* Pending Tags Section */}
        <div className="sciconnect-bulk-tags__pending-section">
          <h3 className="sciconnect-bulk-tags__pending-title">
            Tags to be created ({pendingTags.length})
          </h3>

          {pendingTags.length === 0 ? (
            <div className="sciconnect-bulk-tags__empty-box">
              No tags added yet. Type above and press Enter.
            </div>
          ) : (
            <div className="sciconnect-tag-cloud">
              {pendingTags.map((item) => (
                <div
                  key={item.id}
                  className={`sciconnect-tag-chip ${
                    item.existsInDb ? 'sciconnect-tag-chip--exists' : ''
                  }`}
                >
                  <span className="sciconnect-tag-chip__name">
                    {item.name}
                    {item.existsInDb && (
                      <span className="sciconnect-tag-chip__badge">Already exists</span>
                    )}
                  </span>
                  <button
                    type="button"
                    className="sciconnect-tag-chip__delete"
                    onClick={() => removePendingTag(item.id)}
                    title={`Remove "${item.name}"`}
                    aria-label={`Remove ${item.name}`}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Result Modal / Summary Dialog */}
      {resultSummary && (
        <div className="sciconnect-modal-overlay" tabIndex={-1}>
          <div className="sciconnect-modal" role="dialog" aria-modal="true">
            <div className="sciconnect-modal__header">
              <h3>Bulk Creation Summary</h3>
            </div>
            <div className="sciconnect-modal__body">
              <p>
                Successfully created <strong>{resultSummary.createdCount}</strong> tag(s).
              </p>
              {resultSummary.skippedCount > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <p style={{ fontWeight: 600, color: 'var(--theme-warning-600, #f59e0b)' }}>
                    Skipped ({resultSummary.skippedCount}):
                  </p>
                  <ul className="sciconnect-summary-list">
                    {resultSummary.skippedTags.map((st, idx) => (
                      <li key={idx}>
                        <strong>{st.name}</strong> — {st.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="sciconnect-modal__footer">
              <button
                type="button"
                className="btn btn--style-primary btn--size-medium"
                onClick={handleFinish}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BulkCreateView
