'use client'

import React, { useState } from 'react'
import { ArticlePicker } from './ArticlePicker'
import { CategoryPicker } from './CategoryPicker'
import { CustomLinkForm } from './CustomLinkForm'
import { MenuItemNode } from '../MenuBuilderClient'

type Props = {
  menuId: string
  onAddItems: (items: MenuItemNode[]) => void
  currentItems: MenuItemNode[]
}

export default function AddMenuItemsPanel({ menuId, onAddItems, currentItems }: Props) {
  const [openSection, setOpenSection] = useState<string | null>('articles')

  const toggleSection = (section: string) => {
    setOpenSection(prev => prev === section ? null : section)
  }

  return (
    <div className="add-menu-items-panel">
      <h3>Add Menu Items</h3>
      
      <div className="accordion-section">
        <button 
          className="accordion-header" 
          onClick={() => toggleSection('articles')}
          aria-expanded={openSection === 'articles'}
        >
          <span>Articles</span>
          <span className="icon">{openSection === 'articles' ? '▾' : '▸'}</span>
        </button>
        {openSection === 'articles' && (
          <div className="accordion-content">
            <ArticlePicker onAddItems={onAddItems} currentItems={currentItems} />
          </div>
        )}
      </div>

      <div className="accordion-section">
        <button 
          className="accordion-header" 
          onClick={() => toggleSection('categories')}
          aria-expanded={openSection === 'categories'}
        >
          <span>Categories</span>
          <span className="icon">{openSection === 'categories' ? '▾' : '▸'}</span>
        </button>
        {openSection === 'categories' && (
          <div className="accordion-content">
            <CategoryPicker onAddItems={onAddItems} currentItems={currentItems} />
          </div>
        )}
      </div>

      <div className="accordion-section">
        <button 
          className="accordion-header" 
          onClick={() => toggleSection('custom')}
          aria-expanded={openSection === 'custom'}
        >
          <span>Custom Links</span>
          <span className="icon">{openSection === 'custom' ? '▾' : '▸'}</span>
        </button>
        {openSection === 'custom' && (
          <div className="accordion-content">
            <CustomLinkForm onAddItems={onAddItems} />
          </div>
        )}
      </div>
    </div>
  )
}
