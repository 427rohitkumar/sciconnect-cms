'use client'

import React, { useState } from 'react'
import { MenuItemNode } from '../MenuBuilderClient'

type Props = {
  onAddItems: (items: MenuItemNode[]) => void
}

export function CustomLinkForm({ onAddItems }: Props) {
  const [url, setUrl] = useState('')
  const [label, setLabel] = useState('')

  const handleAdd = () => {
    if (!url || !label) return

    const isExternal = url.startsWith('http://') || url.startsWith('https://')
    
    const newItem: MenuItemNode = {
      id: `temp_${Date.now()}`,
      label,
      parent: null,
      order: 0,
      linkType: isExternal ? 'external' : 'internal',
      internalType: isExternal ? undefined : 'custom',
      customPath: isExternal ? undefined : url,
      externalUrl: isExternal ? url : undefined,
      status: 'active',
      isNew: true,
    }

    onAddItems([newItem])
    
    // Reset form
    setUrl('')
    setLabel('')
  }

  return (
    <div className="custom-link-form">
      <div className="form-group">
        <label>URL</label>
        <input 
          type="text" 
          placeholder="https:// or /path" 
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Link Text</label>
        <input 
          type="text" 
          placeholder="Menu Label" 
          value={label}
          onChange={e => setLabel(e.target.value)}
        />
      </div>
      <button 
        type="button" 
        onClick={handleAdd} 
        className="btn-add" 
        disabled={!url || !label}
      >
        Add to Menu
      </button>
    </div>
  )
}
