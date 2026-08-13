'use client'

import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MenuItemNode } from '../MenuBuilderClient'
import { MenuItemSettings } from './MenuItemSettings'

type Props = {
  item: MenuItemNode & { depth?: number }
  depth: number
  onRemove: () => void
  onUpdate: (updates: Partial<MenuItemNode>) => void
  isGhost?: boolean
  isOverlay?: boolean
}

export function SortableMenuItem({ item, depth, onRemove, onUpdate, isGhost, isOverlay }: Props) {
  const [expanded, setExpanded] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: isOverlay ? 0 : `${depth * 30}px`,
    opacity: isGhost ? 0.4 : 1,
    zIndex: isOverlay ? 1000 : 'auto',
  }

  const getTypeLabel = () => {
    if (item.linkType === 'external') return 'External Link'
    if (item.internalType === 'article') return 'Internal → Article'
    if (item.internalType === 'category') return 'Internal → Category'
    return 'Custom Link'
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`sortable-item ${isOverlay ? 'is-overlay' : ''} ${isDragging ? 'is-dragging' : ''}`}
    >
      <div className="item-header">
        <div 
          className="drag-handle" 
          {...attributes} 
          {...listeners}
          aria-label="Drag to reorder"
        >
          ☰
        </div>
        <div className="item-title" onClick={() => !isOverlay && setExpanded(!expanded)}>
          <span className="label">{item.label}</span>
          <span className="type-badge">{getTypeLabel()}</span>
        </div>
        <div className="item-toggle" onClick={() => !isOverlay && setExpanded(!expanded)}>
          {expanded ? '▲' : '▼'}
        </div>
      </div>
      
      {expanded && !isOverlay && !isDragging && (
        <div className="item-settings-panel">
          <MenuItemSettings 
            item={item} 
            onUpdate={onUpdate} 
            onRemove={() => {
              setExpanded(false)
              onRemove()
            }} 
            onCancel={() => setExpanded(false)}
          />
        </div>
      )}
    </div>
  )
}
