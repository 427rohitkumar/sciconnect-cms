'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimation,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { MenuItemNode } from '../MenuBuilderClient'
import { buildTree, flattenTree } from './treeUtilities'
import { SortableMenuItem } from './SortableMenuItem'

type Props = {
  items: MenuItemNode[]
  onChange: (items: MenuItemNode[]) => void
  onRemove: (id: string) => void
}

export default function MenuStructure({ items, onChange, onRemove }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [projectedDepth, setProjectedDepth] = useState<number | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // Needs a small drag distance to activate, allowing clicks on buttons inside
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // We maintain a flattened version of the tree for DndKit
  const flattenedItems = useMemo(() => {
    // Sort items by order first
    const sorted = [...items].sort((a, b) => a.order - b.order)
    const tree = buildTree(sorted)
    return flattenTree(tree)
  }, [items])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
    setProjectedDepth(null)
  }

  const handleDragMove = (event: DragOverEvent) => {
    const { delta } = event
    
    // Very simple projected depth based on X drag distance (approx 20px per level)
    if (activeId) {
      const activeItem = flattenedItems.find(i => i.id === activeId)
      if (activeItem) {
        const rawDepth = activeItem.depth + Math.floor(delta.x / 20)
        // Clamp depth between 0 and 3 (Max depth is 4 levels, i.e., depths 0,1,2,3)
        const newDepth = Math.max(0, Math.min(rawDepth, 3))
        setProjectedDepth(newDepth)
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setProjectedDepth(null)

    if (over && active.id !== over.id) {
      const oldIndex = flattenedItems.findIndex(i => i.id === active.id)
      let newIndex = flattenedItems.findIndex(i => i.id === over.id)
      
      const movedItems = arrayMove(flattenedItems, oldIndex, newIndex)
      
      // Now rebuild parents and orders based on the new flat array and projected depths
      // This is a simplified tree rebuilding algorithm for DndKit flat-to-tree conversion
      const newItems = [...items]
      const activeItem = newItems.find(i => i.id === active.id)
      
      if (activeItem) {
        // If we have a projected depth, we need to find the appropriate new parent
        // The parent would be the last item before this one that has depth = projectedDepth - 1
        let newParentId: string | null = null
        
        if (projectedDepth && projectedDepth > 0) {
          for (let i = newIndex - 1; i >= 0; i--) {
             if (movedItems[i].depth === projectedDepth - 1) {
               newParentId = movedItems[i].id
               break
             }
          }
        } else if (projectedDepth === null) {
          // If no depth change, just use the parent of the item we dropped over
          const overItem = flattenedItems[newIndex]
          newParentId = overItem.parent
        }
        
        activeItem.parent = newParentId
      }

      // Re-assign orders based on their new positions
      const finalOrderedItems = movedItems.map((flatItem, index) => {
         const original = newItems.find(i => i.id === flatItem.id)
         if (original) {
            original.order = index
         }
         return original
      }).filter(Boolean) as MenuItemNode[]

      onChange(finalOrderedItems)
    } else if (projectedDepth !== null && active.id) {
      // Just a depth change without moving past another item
      const newItems = [...items]
      const activeItem = newItems.find(i => i.id === active.id)
      const currentIndex = flattenedItems.findIndex(i => i.id === active.id)

      if (activeItem) {
        let newParentId: string | null = null
        if (projectedDepth > 0) {
          for (let i = currentIndex - 1; i >= 0; i--) {
             if (flattenedItems[i].depth === projectedDepth - 1) {
               newParentId = flattenedItems[i].id
               break
             }
          }
        }
        activeItem.parent = newParentId
        onChange(newItems)
      }
    }
  }

  const handleItemUpdate = (id: string, updates: Partial<MenuItemNode>) => {
    const newItems = items.map(item => item.id === id ? { ...item, ...updates } : item)
    onChange(newItems)
  }

  return (
    <div className="menu-structure">
      <h3>Menu Structure</h3>
      <p className="subtitle">Drag items to reorder them or move them into another level.</p>
      
      {items.length === 0 && <div className="empty-state">No menu items yet. Add items from the left panel.</div>}
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={flattenedItems.map(i => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="tree-container">
            {flattenedItems.map((item) => (
              <SortableMenuItem 
                key={item.id} 
                item={item} 
                depth={activeId === item.id && projectedDepth !== null ? projectedDepth : item.depth}
                onRemove={() => onRemove(item.id)}
                onUpdate={(updates) => handleItemUpdate(item.id, updates)}
                isGhost={activeId === item.id}
              />
            ))}
          </div>
        </SortableContext>
        
        <DragOverlay dropAnimation={defaultDropAnimation}>
          {activeId ? (
            <SortableMenuItem 
              item={flattenedItems.find(i => i.id === activeId)!} 
              depth={projectedDepth ?? flattenedItems.find(i => i.id === activeId)?.depth ?? 0}
              onRemove={() => {}}
              onUpdate={() => {}}
              isOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
