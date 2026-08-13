import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { resolveMenuItemUrl } from './resolveMenuItemUrl'

export interface NavigationNode {
  id: string
  label: string
  href: string
  openInNewTab: boolean
  icon?: string
  cssClass?: string
  children: NavigationNode[]
}

export async function getMenuTree(menuId: string | number): Promise<NavigationNode[]> {
  const payload = await getPayload({ config: configPromise })

  // Fetch all active menu items for this menu
  const { docs: items } = await payload.find({
    collection: 'menu-items' as any,
    where: {
      and: [
        { menu: { equals: menuId } },
        { status: { equals: 'active' } },
      ],
    },
    depth: 1, // Depth 1 to resolve article/category relationships
    pagination: false,
    sort: 'order', // Sort by order ascending
  })

  // Build the tree
  const itemMap = new Map<string, any>()
  const roots: any[] = []

  // First pass: map them and initialize children
  items.forEach((item) => {
    itemMap.set(String(item.id), { ...item, children: [] })
  })

  // Second pass: attach to parents
  items.forEach((item) => {
    const node = itemMap.get(String(item.id))
    
    const typedItem = item as any
    // Check if it has a parent
    let parentId = null
    if (typedItem.parent) {
      parentId = typeof typedItem.parent === 'object' ? String(typedItem.parent.id) : String(typedItem.parent)
    }

    if (parentId && itemMap.has(parentId)) {
      itemMap.get(parentId).children.push(node)
    } else {
      roots.push(node)
    }
  })

  // Recursive formatter
  const formatNode = (node: any): NavigationNode => {
    return {
      id: String(node.id),
      label: node.label,
      href: resolveMenuItemUrl(node),
      openInNewTab: Boolean(node.openInNewTab),
      icon: node.icon || undefined,
      cssClass: node.cssClass || undefined,
      children: node.children.map(formatNode),
    }
  }

  return roots.map(formatNode)
}

export async function getMenuByLocation(location: string): Promise<{ menu: any, items: NavigationNode[] } | null> {
  const payload = await getPayload({ config: configPromise })

  const { docs: menus } = await payload.find({
    collection: 'menus' as any,
    where: {
      and: [
        { status: { equals: 'active' } },
        { locations: { equals: location as any } },
      ],
    },
    depth: 0,
    limit: 1,
  })

  if (!menus.length) {
    return null
  }

  const menu = menus[0]
  const items = await getMenuTree(menu.id)

  return {
    menu,
    items,
  }
}
