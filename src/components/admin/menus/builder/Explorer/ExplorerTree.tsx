import React, { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { TreeNode } from '../NavigationBuilderField'
import { SortableNode } from './SortableNode'
import { NodeModal } from './NodeModal'
import { buildTree, flattenTree } from '../Preview/treeUtilities'

type Props = {
  items: TreeNode[]
  onChange: (items: TreeNode[], removedId?: string) => void
}

export default function ExplorerTree({ items, onChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingNode, setEditingNode] = useState<TreeNode | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Compute depth for visual rendering
  const getDepth = (id: string): number => {
    let depth = 0
    let current = items.find(i => i.id === id)
    while (current?.parent) {
      depth++
      // Prevent infinite loop in case of circular logic
      if (depth > 10) break
      current = items.find(i => i.id === current!.parent)
    }
    return depth
  }

  // To support basic vertical reordering visually we sort them hierarchically first
  const tree = buildTree(items)
  const flatVisible = flattenTree(tree)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = flatVisible.findIndex((i) => i.id === active.id)
      const newIndex = flatVisible.findIndex((i) => i.id === over.id)
      
      const newFlat = arrayMove(flatVisible, oldIndex, newIndex)
      
      // Update order and parent based on new flat structure
      // For a truly complex tree drag-drop, we would calculate indentation.
      // For this simplified version, dragging just changes order among siblings,
      // or if it moves next to a different parent's children, we adopt that parent.
      
      // We will re-assign order and parent based on the new arrayMove result.
      // A simple heuristic: take the parent of the item immediately above it.
      // If it's a completely flat list, this might flatten the tree.
      // To preserve nesting, we should rely on explicit Edit Modal for changing parent,
      // and only use DND for reordering among the same level.
      
      const oldParent = items.find(i => i.id === active.id)?.parent
      
      // Re-sort just the children of the oldParent
      const sameParentItems = items.filter(i => i.parent === oldParent).sort((a,b) => a.order - b.order)
      const oldLocalIndex = sameParentItems.findIndex(i => i.id === active.id)
      
      // This is a naive reordering that preserves tree structure but updates absolute order
      // Let's just update the exact items array
      const activeItem = items.find(i => i.id === active.id)!
      const overItem = items.find(i => i.id === over.id)!
      
      // If they have the same parent, just swap their orders
      if (activeItem.parent === overItem.parent) {
        const mapped = items.map(item => {
          if (item.parent === activeItem.parent) {
            // Recalculate order
            const siblings = items.filter(i => i.parent === activeItem.parent).sort((a,b) => a.order - b.order)
            const fromIdx = siblings.findIndex(i => i.id === activeItem.id)
            const toIdx = siblings.findIndex(i => i.id === overItem.id)
            const newSiblings = arrayMove(siblings, fromIdx, toIdx)
            const myNewIdx = newSiblings.findIndex(i => i.id === item.id)
            if (myNewIdx !== -1) return { ...item, order: myNewIdx }
          }
          return item
        })
        onChange(mapped)
      } else {
        // If they have different parents, move activeItem to overItem's parent
        const mapped = items.map(item => {
          if (item.id === activeItem.id) {
            return { ...item, parent: overItem.parent, order: overItem.order + 1 }
          }
          return item
        })
        onChange(mapped)
      }
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this node and all its children?')) {
      const idsToRemove = new Set<string>([id])
      let added = true
      while (added) {
        added = false
        items.forEach(item => {
          if (item.parent && idsToRemove.has(item.parent) && !idsToRemove.has(item.id)) {
            idsToRemove.add(item.id)
            added = true
          }
        })
      }
      const filtered = items.filter(i => !idsToRemove.has(i.id))
      // Call onChange for the primary deleted id so it tracks it
      onChange(filtered, id)
    }
  }

  const handleDuplicate = (id: string) => {
    const node = items.find(i => i.id === id)
    if (!node) return
    const newNode: TreeNode = {
      ...node,
      id: `new-${Date.now()}`,
      label: `${node.label} (Copy)`,
      isNew: true,
      order: node.order + 1
    }
    onChange([...items, newNode])
  }

  const handleSaveNode = (node: TreeNode) => {
    if (editingNode) {
      onChange(items.map(i => i.id === node.id ? node : i))
    } else {
      onChange([...items, node])
    }
    setModalOpen(false)
    setEditingNode(null)
  }

  return (
    <div className="explorer-container">
      <div className="explorer-header">
        <h4>EXPLORER</h4>
        <button 
          type="button"
          className="btn-add" 
          onClick={() => {
            setEditingNode(null)
            setModalOpen(true)
          }}
        >
          + Add Node
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={flatVisible.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="tree-list">
            {flatVisible.map((item) => (
              <SortableNode
                key={item.id}
                item={item}
                depth={getDepth(item.id)}
                onEdit={() => {
                  setEditingNode(item)
                  setModalOpen(true)
                }}
                onDelete={() => handleDelete(item.id)}
                onDuplicate={() => handleDuplicate(item.id)}
                onToggleStatus={() => {
                  const mapped = items.map(i => 
                    i.id === item.id 
                      ? { ...i, status: (i.status === 'inactive' ? 'active' : 'inactive') as 'active' | 'inactive' } 
                      : i
                  )
                  onChange(mapped)
                }}
              />
            ))}
            {flatVisible.length === 0 && (
              <div className="p-4 text-center text-gray-500">No nodes added yet.</div>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {modalOpen && (
        <NodeModal
          items={items}
          node={editingNode}
          onSave={handleSaveNode}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
