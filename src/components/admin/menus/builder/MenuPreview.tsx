'use client'

import React from 'react'
import { MenuItemNode } from './MenuBuilderClient'
import { buildTree } from './RightPanel/treeUtilities'

type Props = {
  items: MenuItemNode[]
}

export default function MenuPreview({ items }: Props) {
  const tree = buildTree([...items].sort((a, b) => a.order - b.order))

  const renderTree = (nodes: any[]) => {
    if (!nodes || nodes.length === 0) return null
    return (
      <ul>
        {nodes.map(node => (
          <li key={node.id}>
            <span className="preview-label">{node.label}</span>
            {node.children && node.children.length > 0 && renderTree(node.children)}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="menu-preview-container">
      <h4>Live Preview</h4>
      <nav className="preview-nav">
        {renderTree(tree)}
      </nav>
    </div>
  )
}
