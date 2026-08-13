import React, { useState, useEffect } from 'react'
import { toast } from '@payloadcms/ui'
import { TreeNode } from '../NavigationBuilderField'

type Props = {
  items: TreeNode[]
  node: TreeNode | null
  onSave: (node: TreeNode) => void
  onClose: () => void
}

export function NodeModal({ items, node, onSave, onClose }: Props) {
  const [formData, setFormData] = useState<Partial<TreeNode>>(
    node || {
      id: `new-${Date.now()}`,
      label: '',
      linkType: 'internal',
      internalType: 'article',
      status: 'active',
      parent: null,
      order: items.length,
      isNew: true
    }
  )

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedName, setSelectedName] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  // Fetch search results for internal links
  useEffect(() => {
    if (formData.linkType !== 'internal' || !searchQuery || searchQuery.length < 2 || searchQuery === selectedName) {
      setSearchResults([])
      return
    }

    const type = formData.internalType === 'article' ? 'articles' : 'categories'
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/menus/search/${type}?q=${encodeURIComponent(searchQuery)}`)
        const data = await res.json()
        if (data.docs) setSearchResults(data.docs)
      } catch (e) {
        console.error(e)
      }
      setSearching(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, formData.internalType, formData.linkType])

  const handleChange = (field: keyof TreeNode, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSelectTarget = (doc: any) => {
    const field = formData.internalType === 'article' ? 'article' : 'category'
    const name = doc.title || doc.name
    handleChange(field as any, doc.id)
    // Auto-fill label if empty
    if (!formData.label) {
      handleChange('label', name)
    }
    setSearchQuery(name)
    setSelectedName(name)
    setSearchResults([])
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    if (selectedName) {
      setSelectedName('')
      // clear the selected id from formData so they must select again
      const field = formData.internalType === 'article' ? 'article' : 'category'
      handleChange(field as any, null)
    }
  }

  const handleSave = () => {
    if (!formData.label) {
      toast.error('Label is required')
      return
    }
    // ensure target is selected for internal links
    if (formData.linkType === 'internal') {
      if (formData.internalType === 'article' && !formData.article) {
        toast.error('Please search and select an Article to link.')
        return
      }
      if (formData.internalType === 'category' && !formData.category) {
        toast.error('Please search and select a Category to link.')
        return
      }
    }
    onSave(formData as TreeNode)
  }

  // Filter out self and children for parent selection
  const getValidParents = () => {
    if (!node) return items
    
    const invalidIds = new Set<string>([node.id])
    let added = true
    while (added) {
      added = false
      items.forEach(item => {
        if (item.parent && invalidIds.has(item.parent) && !invalidIds.has(item.id)) {
          invalidIds.add(item.id)
          added = true
        }
      })
    }
    
    return items.filter(i => !invalidIds.has(i.id))
  }

  const getDerivedNodeType = () => {
    if (formData.linkType === 'external') return 'external'
    return formData.internalType || 'article'
  }

  const handleNodeTypeChange = (val: string) => {
    if (val === 'external') {
      handleChange('linkType', 'external')
    } else {
      handleChange('linkType', 'internal')
      handleChange('internalType', val) // 'article', 'category', or 'custom'
    }
  }

  return (
    <div className="node-modal-overlay">
      <div className="node-modal-content">
        <h3>{node ? 'Edit Node' : 'Add Node'}</h3>

        <div className="form-group">
          <label>Node Type</label>
          <select 
            value={getDerivedNodeType()} 
            onChange={(e) => handleNodeTypeChange(e.target.value)}
          >
            <option value="article">Article</option>
            <option value="category">Category</option>
            <option value="custom">Custom Internal Path (e.g. Home Page)</option>
            <option value="external">External Link</option>
          </select>
        </div>

        {formData.linkType === 'internal' && formData.internalType !== 'custom' && (
          <>
            <div className="form-group">
              <label>Search and Link {formData.internalType === 'article' ? 'Article' : 'Category'}</label>
              <p style={{ fontSize: '12px', color: '#888', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                Type the exact name/title of the {formData.internalType} you want to link, then click on the result to connect it.
              </p>
              <input 
                type="text" 
                placeholder={`Type ${formData.internalType} name here...`}
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searching && <small>Searching...</small>}
              
              {searchResults.length > 0 && (
                <div style={{ border: '1px solid #ccc', maxHeight: '150px', overflowY: 'auto' }}>
                  {searchResults.map(res => (
                    <div 
                      key={res.id} 
                      onClick={() => handleSelectTarget(res)}
                      style={{ padding: '0.5rem', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                    >
                      {res.title || res.name} ({res.slug})
                    </div>
                  ))}
                </div>
              )}

              {/* Show selected target */}
              {formData.internalType === 'article' && formData.article && (
                <div style={{ marginTop: '0.5rem', color: 'green', fontSize: '13px' }}>✓ Article Linked</div>
              )}
              {formData.internalType === 'category' && formData.category && (
                <div style={{ marginTop: '0.5rem', color: 'green', fontSize: '13px' }}>✓ Category Linked</div>
              )}
            </div>
          </>
        )}

        {formData.linkType === 'internal' && formData.internalType === 'custom' && (
          <div className="form-group">
            <label>Internal Path</label>
            <input 
              type="text" 
              value={formData.customPath || ''} 
              onChange={(e) => handleChange('customPath', e.target.value)}
              placeholder="e.g. / for Home, /about for About Us"
            />
          </div>
        )}

        {formData.linkType === 'external' && (
          <div className="form-group">
            <label>External URL</label>
            <input 
              type="text" 
              value={formData.externalUrl || ''} 
              onChange={(e) => handleChange('externalUrl', e.target.value)}
              placeholder="https://xyz.com"
            />
          </div>
        )}

        <div className="form-group">
          <label>Navigation Label</label>
          <input 
            type="text" 
            value={formData.label || ''} 
            onChange={(e) => handleChange('label', e.target.value)} 
            placeholder="e.g. About Us, Contact, Latest News"
          />
        </div>

        <div className="form-group">
          <label>Parent Node</label>
          <select 
            value={formData.parent || ''} 
            onChange={(e) => handleChange('parent', e.target.value || null)}
          >
            <option value="">(Root level)</option>
            {getValidParents().map(parentItem => (
              <option key={parentItem.id} value={parentItem.id}>{parentItem.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Status</label>
          <select 
            value={formData.status} 
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-save" onClick={handleSave}>Apply Changes</button>
        </div>
      </div>
    </div>
  )
}
