import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TreeNode } from '../NavigationBuilderField'

type Props = {
  item: TreeNode
  depth: number
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onToggleStatus: () => void
}

export function SortableNode({ item, depth, onEdit, onDelete, onDuplicate, onToggleStatus }: Props) {
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
    marginLeft: `${depth * 2}rem`,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as any,
    zIndex: isDragging ? 10 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className={`tree-node ${item.status === 'inactive' ? 'inactive' : ''}`}>
      <div className="node-drag-handle" {...attributes} {...listeners}>
        ☰
      </div>
      <div className="node-content">
        <span className="node-label">{item.label}</span>
        <span className="node-type">
          {item.linkType === 'internal' ? item.internalType : 'custom link'}
        </span>
      </div>
      <div className="node-actions">
        <button type="button" onClick={onToggleStatus} title={item.status === 'inactive' ? 'Show Node' : 'Hide Node'}>
          {item.status === 'inactive' ? '👁‍🗨' : '👁'}
        </button>
        <button type="button" onClick={onEdit} title="Edit">✎</button>
        <button type="button" onClick={onDuplicate} title="Duplicate">⎘</button>
        <button type="button" onClick={onDelete} title="Delete">🗑</button>
      </div>
    </div>
  )
}
