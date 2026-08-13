'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useDocumentInfo, toast } from '@payloadcms/ui'
import ExplorerTree from './Explorer/ExplorerTree'
import LivePreview from './Preview/LivePreview'
import './NavigationBuilder.scss'

export type TreeNode = {
  id: string
  label: string
  parent: string | null
  order: number
  linkType: 'internal' | 'external'
  internalType?: 'article' | 'category' | 'custom'
  article?: string | object
  category?: string | object
  customPath?: string
  externalUrl?: string
  openInNewTab?: boolean
  cssClass?: string
  status: 'active' | 'inactive'
  isNew?: boolean
  isDeleted?: boolean
}

export default function NavigationBuilderField() {
  const { id: menuId } = useDocumentInfo()
  const [items, setItems] = useState<TreeNode[]>([])
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const fetchTree = useCallback(async () => {
    if (!menuId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/menus/${menuId}/builder`)
      const data = await res.json()
      if (data.items) {
        const normalized = data.items.map((item: any) => ({
          ...item,
          id: String(item.id),
          parent: item.parent ? (typeof item.parent === 'object' ? String(item.parent.id) : String(item.parent)) : null
        }))
        setItems(normalized)
      }
    } catch (e) {
      console.error('Failed to load menu tree', e)
    }
    setLoading(false)
    setIsDirty(false)
    setDeletedIds([])
  }, [menuId])

  useEffect(() => {
    fetchTree()
  }, [fetchTree])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.returnValue = 'You have unsaved changes.'
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const handleTreeChange = (newItems: TreeNode[], removedId?: string) => {
    setItems(newItems)
    setIsDirty(true)
    if (removedId) {
      const removedItem = items.find(i => i.id === removedId)
      if (removedItem && !removedItem.isNew) {
        setDeletedIds(prev => [...prev, removedId])
      }
    }
  }

  const handleSave = async () => {
    if (!isDirty || saving || !menuId) return
    setSaving(true)
    try {
      const res = await fetch(`/api/menus/${menuId}/builder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, deletedIds }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Navigation structure saved successfully!")
        await fetchTree() // Reload fresh tree
      } else {
        const errorMsg = data.error || (data.errors && data.errors[0]?.message) || 'Failed to save'
        toast.error(`Error: ${errorMsg}`)
      }
    } catch (e: any) {
      toast.error(`Error saving menu: ${e.message}`)
    }
    setSaving(false)
  }

  if (!menuId) {
    return <div className="nav-builder-loading">Save the Menu document first before using the Navigation Builder.</div>
  }

  return (
    <div className={`nav-builder-wrapper ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="nav-builder-header">
        <div className="title-area">
          <h3>Navigation Builder</h3>
          <span className="subtitle">Manage nodes for this Menu</span>
        </div>
        <div className="actions-area">
          {isDirty && <span className="dirty-indicator">Unsaved changes</span>}
          <button type="button" className="btn-secondary" onClick={fetchTree} disabled={saving}>
            Refresh Data
          </button>
          <button type="button" className="btn-secondary" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
          <button 
            type="button" 
            className={`btn-primary ${isDirty ? 'active' : ''}`} 
            onClick={handleSave} 
            disabled={!isDirty || saving}
          >
            {saving ? 'Saving...' : (isDirty ? 'Save Changes *' : 'Save Changes')}
          </button>
        </div>
      </div>

      <div className="nav-builder-layout">
        <div className="nav-builder-left">
          {loading ? (
            <div className="p-4">Loading Explorer...</div>
          ) : (
            <ExplorerTree 
              items={items} 
              onChange={handleTreeChange} 
            />
          )}
        </div>
        
        <div className="nav-builder-right">
          <LivePreview items={items} />
        </div>
      </div>
    </div>
  )
}
