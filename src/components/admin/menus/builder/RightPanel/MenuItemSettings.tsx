'use client'

import React from 'react'
import { MenuItemNode } from '../MenuBuilderClient'

type Props = {
  item: MenuItemNode
  onUpdate: (updates: Partial<MenuItemNode>) => void
  onRemove: () => void
  onCancel: () => void
}

export function MenuItemSettings({ item, onUpdate, onRemove, onCancel }: Props) {
  return (
    <div className="item-settings">
      <div className="form-group">
        <label>Navigation Label</label>
        <input 
          type="text" 
          value={item.label} 
          onChange={(e) => onUpdate({ label: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Target URL / Link</label>
        <input 
          type="text" 
          value={item.linkType === 'external' ? (item.externalUrl || '') : (item.customPath || '')} 
          onChange={(e) => {
            if (item.linkType === 'external') {
              onUpdate({ externalUrl: e.target.value })
            } else if (item.internalType === 'custom') {
              onUpdate({ customPath: e.target.value })
            }
          }}
          disabled={item.internalType === 'article' || item.internalType === 'category'}
          readOnly={item.internalType === 'article' || item.internalType === 'category'}
          title={item.internalType === 'article' || item.internalType === 'category' ? "Use the backend to edit the target article/category." : undefined}
        />
        {(item.internalType === 'article' || item.internalType === 'category') && (
          <small className="help-text">Internal targets cannot be changed here.</small>
        )}
      </div>

      <div className="form-group-inline">
        <label>
          <input 
            type="checkbox" 
            checked={item.openInNewTab || false} 
            onChange={(e) => onUpdate({ openInNewTab: e.target.checked })}
          />
          Open link in new tab
        </label>
      </div>

      <div className="form-group">
        <label>CSS Classes (Optional)</label>
        <input 
          type="text" 
          value={item.cssClass || ''} 
          onChange={(e) => onUpdate({ cssClass: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Status</label>
        <select 
          value={item.status} 
          onChange={(e) => onUpdate({ status: e.target.value as 'active'|'inactive' })}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="settings-actions">
        <button type="button" className="btn-remove" onClick={onRemove}>Remove</button>
        <div className="right-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>Close</button>
        </div>
      </div>
    </div>
  )
}
