import { TreeNode } from '../NavigationBuilderField'

export function buildTree(items: TreeNode[]): (TreeNode & { children: any[] })[] {
  const map = new Map<string, TreeNode & { children: any[] }>()
  const roots: (TreeNode & { children: any[] })[] = []

  // Initialize map
  items.forEach(item => {
    map.set(item.id, { ...item, children: [] })
  })

  // Build tree
  items.forEach(item => {
    const node = map.get(item.id)!
    if (item.parent && map.has(item.parent)) {
      map.get(item.parent)!.children.push(node)
    } else {
      roots.push(node)
    }
  })

  // Sort by order
  const sortNodes = (nodes: any[]) => {
    nodes.sort((a, b) => a.order - b.order)
    nodes.forEach(n => sortNodes(n.children))
  }
  sortNodes(roots)

  return roots
}

export function flattenTree(tree: (TreeNode & { children: any[] })[], parentId: string | null = null): TreeNode[] {
  let flat: TreeNode[] = []
  tree.forEach((node, index) => {
    const flatNode = { ...node, parent: parentId, order: index }
    delete (flatNode as any).children
    flat.push(flatNode)
    if (node.children && node.children.length > 0) {
      flat = flat.concat(flattenTree(node.children, node.id))
    }
  })
  return flat
}
