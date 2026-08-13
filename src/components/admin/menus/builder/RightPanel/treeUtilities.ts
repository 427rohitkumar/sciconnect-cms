import { MenuItemNode } from '../MenuBuilderClient'

// Convert flat items to nested tree
export function buildTree(items: MenuItemNode[]): any[] {
  const itemMap = new Map<string, any>()
  const roots: any[] = []

  items.forEach(item => {
    itemMap.set(item.id, { ...item, children: [] })
  })

  items.forEach(item => {
    const node = itemMap.get(item.id)
    if (item.parent && itemMap.has(item.parent)) {
      itemMap.get(item.parent).children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

// Convert nested tree to flat list with depth
export function flattenTree(items: any[], depth = 0): any[] {
  return items.reduce((acc, item) => {
    return [...acc, { ...item, depth }, ...flattenTree(item.children, depth + 1)]
  }, [])
}
