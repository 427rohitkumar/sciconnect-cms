'use client'

import React, { useState, useEffect } from 'react'
import { MenuItemNode } from '../MenuBuilderClient'

type Props = {
  onAddItems: (items: MenuItemNode[]) => void
  currentItems: MenuItemNode[]
}

export function ArticlePicker({ onAddItems, currentItems }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  // Use a simple debounce for search
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchResults(query)
    }, 300)
    return () => clearTimeout(delay)
  }, [query])

  const fetchResults = async (searchQuery: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/menus/search/articles?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      if (data.docs) {
        setResults(data.docs)
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const selectAll = () => {
    const selectable = results.filter(r => !currentItems.some(i => i.article === r.id))
    setSelectedIds(new Set(selectable.map(r => String(r.id))))
  }

  const handleAdd = () => {
    if (selectedIds.size === 0) return

    const itemsToAdd: MenuItemNode[] = Array.from(selectedIds).map(id => {
      const article = results.find(r => String(r.id) === id)
      return {
        id: `temp_${Date.now()}_${id}`, // Temporary ID
        label: article?.title || 'Unknown Article',
        parent: null,
        order: 0,
        linkType: 'internal',
        internalType: 'article',
        article: id,
        status: 'active',
        isNew: true,
      }
    })

    onAddItems(itemsToAdd)
    setSelectedIds(new Set())
    setQuery('') // Reset search
  }

  return (
    <div className="picker-container">
      <input 
        type="text" 
        placeholder="Search articles..." 
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="search-input"
      />
      
      {loading ? (
        <div className="loading-spinner">Searching...</div>
      ) : (
        <div className="results-list">
          {results.length === 0 && <div className="no-results">No articles found.</div>}
          {results.map(article => {
            // Check if already in menu
            const isAlreadyAdded = currentItems.some(item => {
              if (item.internalType === 'article') {
                return (typeof item.article === 'object' && (item.article as any)?.id === article.id) || item.article === String(article.id)
              }
              return false
            })

            return (
              <label key={article.id} className={`result-item ${isAlreadyAdded ? 'disabled' : ''}`}>
                <input 
                  type="checkbox" 
                  disabled={isAlreadyAdded}
                  checked={selectedIds.has(String(article.id))}
                  onChange={() => toggleSelect(String(article.id))}
                />
                <span className="result-title">{article.title}</span>
                {isAlreadyAdded && <span className="already-added">(Already in menu)</span>}
              </label>
            )
          })}
        </div>
      )}

      <div className="picker-actions">
        <button type="button" onClick={selectAll} className="btn-select-all" disabled={results.length === 0}>
          Select All
        </button>
        <button type="button" onClick={handleAdd} className="btn-add" disabled={selectedIds.size === 0}>
          Add to Menu
        </button>
      </div>
    </div>
  )
}
