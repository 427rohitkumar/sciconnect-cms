'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'
import './MobileMenuLayoutSelector.scss'

type LayoutOption = {
  value: string
  label: string
}

const LAYOUTS: LayoutOption[] = [
  { value: 'drawer-left', label: 'Drawer Left' },
  { value: 'drawer-right', label: 'Drawer Right' },
  { value: 'fullscreen', label: 'Fullscreen' },
  { value: 'dropdown', label: 'Dropdown' },
]

const MobileMenuLayoutSelector: React.FC<{ path: string }> = ({ path }) => {
  const { value, setValue } = useField<string>({ path })
  const selectedValue = value || 'drawer-left'

  return (
    <div className="field-type mobile-menu-layout-selector">
      <label className="field-label">Mobile Menu Layout</label>
      <p className="field-description">Choose how the mobile menu opens and animates.</p>
      
      <div className="layout-grid" role="radiogroup" aria-label="Mobile Menu Layout">
        {LAYOUTS.map((layout) => (
          <div
            key={layout.value}
            className={`layout-card ${selectedValue === layout.value ? 'selected' : ''}`}
            onClick={() => setValue(layout.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setValue(layout.value)
              }
            }}
            role="radio"
            aria-checked={selectedValue === layout.value}
            tabIndex={0}
          >
            <div className={`layout-preview layout-${layout.value}`} aria-hidden="true">
              <div className="mobile-frame">
                <div className="mock-header">
                  <div className="mock-hamburger">
                    <span /><span /><span />
                  </div>
                </div>
                <div className="mock-menu">
                  <div className="mock-item" />
                  <div className="mock-item" />
                  <div className="mock-item" />
                </div>
              </div>
            </div>
            
            <div className="layout-info">
              <span className="layout-label">{layout.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MobileMenuLayoutSelector
