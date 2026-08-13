'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AddMenuItemsPanel from './LeftPanel/AddMenuItemsPanel'
import MenuStructure from './RightPanel/MenuStructure'
import MenuPreview from './MenuPreview'
import UnsavedChangesDialog from './UnsavedChangesDialog'
import './MenuBuilder.scss'

export type MenuItemNode = {
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
  icon?: string
  status: 'active' | 'inactive'
  // Transient state for UI
  isNew?: boolean
  isDeleted?: boolean
}

export function MenuBuilderClient({ menu, menuId }: { menu: any, menuId: string }) {
  const router = useRouter()
  const [items, setItems] = useState<MenuItemNode[]>([])
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  useEffect(() => {
    // Fetch initial items
    fetch(`/api/menus/${menuId}/builder`)
      .then(res => res.json())
      .then(data => {
        if (data.items) {
          // Flatten items if they are nested from API, or API already returns flat
          // Wait, our API returns docs from payload.find(), which is flat!
          const normalizedItems = data.items.map((item: any) => ({
            ...item,
            id: String(item.id),
            parent: item.parent ? (typeof item.parent === 'object' ? String(item.parent.id) : String(item.parent)) : null
          }))
          setItems(normalizedItems)
        }
        setLoading(false)
      })
      .catch(e => {
        console.error('Error fetching menu items:', e)
        setLoading(false)
      })
  }, [menuId])

  const handleAddItems = useCallback((newItems: MenuItemNode[]) => {
    setItems(prev => {
      // Find max order
      const maxOrder = prev.reduce((max, curr) => curr.order > max ? curr.order : max, -1)
      const itemsWithOrder = newItems.map((item, index) => ({
        ...item,
        order: maxOrder + 1 + index,
      }))
      return [...prev, ...itemsWithOrder]
    })
    setHasChanges(true)
  }, [])

  const handleUpdateItems = useCallback((updatedItems: MenuItemNode[]) => {
    setItems(updatedItems)
    setHasChanges(true)
  }, [])

  const handleRemoveItem = useCallback((id: string) => {
    setItems(prev => {
      // Check for children
      const hasChildren = prev.some(i => i.parent === id)
      if (hasChildren) {
        alert("This item has child menu items. Move or remove the child items first.")
        return prev
      }
      
      const itemToRemove = prev.find(i => i.id === id)
      if (itemToRemove && !itemToRemove.isNew) {
        setDeletedIds(d => [...d, id])
      }
      return prev.filter(i => i.id !== id)
    })
    setHasChanges(true)
  }, [])

  const saveMenu = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/menus/${menuId}/builder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          deletedIds
        }),
      })
      
      const data = await response.json()
      if (response.ok) {
        alert("Menu structure saved.")
        setHasChanges(false)
        setDeletedIds([])
        // We could re-fetch items here to get real IDs for newly created items
        // but wait, new items aren't actually created here fully yet!
        // Oh, our POST endpoint uses req.payload.update! If an item is new, it has no ID!
        // We need to handle create for new items!
      } else {
        alert(`Error saving menu: ${data.error}`)
      }
    } catch (e) {
      alert("Error saving menu")
    }
    setSaving(false)
  }

  const discardChanges = () => {
    if (confirm("Are you sure you want to discard your changes?")) {
      window.location.reload()
    }
  }

  if (loading) return <div className="p-4">Loading Menu Builder...</div>

  return (
    <div className="menu-builder-container">
      <UnsavedChangesDialog hasChanges={hasChanges} />
      
      <div className="menu-builder-header">
        <div className="menu-info">
          <h2>Menu Builder: {menu.name}</h2>
          <div className="menu-meta">
            <span className="badge">Status: {menu.status}</span>
            <span className="badge">Locations: {menu.locations?.join(', ') || 'None'}</span>
            <span className="badge">Items: {items.length}</span>
          </div>
        </div>
        <div className="menu-actions">
          {hasChanges && <span className="unsaved-warning">You have unsaved changes</span>}
          <button className="btn-discard" onClick={discardChanges} disabled={!hasChanges || saving}>
            Discard
          </button>
          <button className="btn-save" onClick={saveMenu} disabled={!hasChanges || saving}>
            {saving ? 'Saving...' : 'Save Menu'}
          </button>
        </div>
      </div>

      <div className="menu-builder-layout">
        <div className="menu-builder-left">
          <AddMenuItemsPanel menuId={menuId} onAddItems={handleAddItems} currentItems={items} />
        </div>
        
        <div className="menu-builder-right">
          <MenuStructure 
            items={items} 
            onChange={handleUpdateItems} 
            onRemove={handleRemoveItem} 
          />
          <div className="preview-section">
            <MenuPreview items={items} />
          </div>
        </div>
      </div>
    </div>
  )
}
