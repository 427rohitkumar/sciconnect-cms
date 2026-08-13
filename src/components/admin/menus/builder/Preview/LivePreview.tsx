import React from 'react'
import { TreeNode } from '../NavigationBuilderField'
import { buildTree } from './treeUtilities'

export default function LivePreview({ items }: { items: TreeNode[] }) {
  // Use the same tree builder logic
  const tree = buildTree(items)

  const renderPreviewNode = (node: TreeNode & { children?: any[] }) => {
    const hasChildren = node.children && node.children.length > 0
    return (
      <div key={node.id} className={`preview-item ${node.status === 'inactive' ? 'inactive' : ''}`}>
        <span>{node.label} {hasChildren ? '▼' : ''}</span>
        {hasChildren && (
          <div className="preview-dropdown">
            {node.children!.map(child => (
              <div key={child.id} className={`preview-dropdown-item ${child.status === 'inactive' ? 'inactive' : ''}`}>
                {child.label}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="live-preview-container">
      <div className="live-preview-header">
        <h4>LIVE PREVIEW</h4>
      </div>
      <div className="preview-navbar">
        {tree.map(node => renderPreviewNode(node))}
      </div>
    </div>
  )
}
