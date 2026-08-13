'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { TagDoc, fetchTagsAction } from '../../../app/(payload)/admin/actions/tags'
import { DeleteTagModal } from './DeleteTagModal'
import { TagEditModal } from './TagEditModal'

export const TagManagerView: React.FC = () => {
  const [tags, setTags] = useState<TagDoc[]>([])
  const [totalDocs, setTotalDocs] = useState<number>(0)
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [search, setSearch] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [canDelete, setCanDelete] = useState<boolean>(false)
  const [canCreate, setCanCreate] = useState<boolean>(true)

  // Modals state
  const [tagToDelete, setTagToDelete] = useState<TagDoc | null>(null)
  const [tagToEdit, setTagToEdit] = useState<TagDoc | null>(null)

  const loadInitialTags = useCallback(async (searchQuery: string) => {
    setLoading(true)
    try {
      const res = await fetchTagsAction({ search: searchQuery, page: 1, limit: 60 })
      setTags(res.docs)
      setTotalDocs(res.totalDocs)
      setTotalPages(res.totalPages)
      setPage(1)
      setCanDelete(res.canDelete)
      setCanCreate(res.canCreate)
    } catch (err) {
      console.error('Failed to load tags:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      loadInitialTags(search)
    }, 300)
    return () => clearTimeout(handler)
  }, [search, loadInitialTags])

  const handleLoadMore = async () => {
    if (page >= totalPages || loadingMore) return
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const res = await fetchTagsAction({ search, page: nextPage, limit: 60 })
      setTags((prev) => [...prev, ...res.docs])
      setPage(nextPage)
    } catch (err) {
      console.error('Failed to load more tags:', err)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleDeleteSuccess = (deletedId: string | number) => {
    setTags((prev) => prev.filter((t) => String(t.id) !== String(deletedId)))
    setTotalDocs((prev) => Math.max(0, prev - 1))
    setTagToDelete(null)
  }

  const handleEditSuccess = (updatedTag: TagDoc) => {
    setTags((prev) =>
      prev.map((t) => (String(t.id) === String(updatedTag.id) ? updatedTag : t)),
    )
    setTagToEdit(null)
  }

  return (
    <div className="sciconnect-tags-manager">
      {/* Header */}
      <div className="sciconnect-tags-manager__header">
        <div>
          <h1 className="sciconnect-tags-manager__title">Tags</h1>
          <p className="sciconnect-tags-manager__subtitle">
            Manage tags used across your content. Total tags: <strong>{totalDocs}</strong>
          </p>
        </div>
        {canCreate && (
          <Link
            href="/admin/collections/tags/bulk-create"
            className="btn btn--style-primary btn--size-medium"
          >
            Create New
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <div className="sciconnect-tags-manager__search-bar">
        <div className="sciconnect-tags-manager__search-input-wrap">
          <svg className="sciconnect-tags-manager__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="sciconnect-tags-manager__search-input"
            placeholder="Search tags by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="sciconnect-tags-manager__search-clear"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="sciconnect-tags-manager__loading">
          <div className="sciconnect-spinner" />
          <p>Loading tags...</p>
        </div>
      ) : tags.length === 0 ? (
        <div className="sciconnect-tags-manager__empty">
          <p className="sciconnect-tags-manager__empty-title">
            {search ? 'No tags found matching your search.' : 'No tags created yet.'}
          </p>
          <p className="sciconnect-tags-manager__empty-desc">
            {search ? 'Try clearing your search query.' : 'Create your first tag to get started.'}
          </p>
          {!search && canCreate && (
            <Link
              href="/admin/collections/tags/bulk-create"
              className="btn btn--style-primary btn--size-medium"
              style={{ marginTop: '16px' }}
            >
              Create New Tag
            </Link>
          )}
        </div>
      ) : (
        <div className="sciconnect-tags-manager__content">
          <div className="sciconnect-tag-cloud">
            {tags.map((tag) => (
              <div key={tag.id} className="sciconnect-tag-chip">
                <button
                  type="button"
                  className="sciconnect-tag-chip__name"
                  onClick={() => setTagToEdit(tag)}
                  title={`Edit "${tag.name}"`}
                >
                  {tag.name}
                </button>
                {canDelete && (
                  <button
                    type="button"
                    className="sciconnect-tag-chip__delete"
                    onClick={() => setTagToDelete(tag)}
                    title={`Delete "${tag.name}"`}
                    aria-label={`Delete ${tag.name}`}
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>

          {page < totalPages && (
            <div className="sciconnect-tags-manager__load-more">
              <button
                type="button"
                className="btn btn--style-secondary btn--size-medium"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading more...' : 'Load More Tags'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {tagToDelete && (
        <DeleteTagModal
          tag={tagToDelete}
          onClose={() => setTagToDelete(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}

      {tagToEdit && (
        <TagEditModal
          tag={tagToEdit}
          onClose={() => setTagToEdit(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  )
}

export default TagManagerView
