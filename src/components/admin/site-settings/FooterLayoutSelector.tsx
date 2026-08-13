'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'
import './FooterLayoutSelector.scss'

type LayoutOption = {
  value: string
  label: string
  description: string
  preview: React.ReactNode
}

const LAYOUTS: LayoutOption[] = [
  {
    value: 'default',
    label: 'Default',
    description: 'Logo, navigation links, and info across standard columns.',
    preview: (
      <div className="preview-layout default-layout">
        <div className="row top-row">
          <div className="box logo-box" />
        </div>
        <div className="row main-row">
          <div className="col">
            <div className="text-line" />
            <div className="text-line" />
            <div className="text-line" />
          </div>
          <div className="col">
            <div className="text-line" />
            <div className="text-line" />
            <div className="text-line" />
          </div>
          <div className="col">
            <div className="text-line" />
            <div className="text-line" />
            <div className="text-line" />
          </div>
        </div>
        <div className="divider" />
        <div className="row bottom-row">
          <div className="text-line" />
          <div className="text-line" />
        </div>
      </div>
    ),
  },
  {
    value: 'multi-column',
    label: 'Multi Column',
    description: 'Multiple vertical navigation columns for content-heavy sites.',
    preview: (
      <div className="preview-layout multi-column-layout">
        <div className="row top-row">
          <div className="box logo-box" />
        </div>
        <div className="row main-row">
          <div className="col">
            <div className="text-line" />
            <div className="text-line" />
            <div className="text-line" />
            <div className="text-line" />
          </div>
          <div className="col">
            <div className="text-line" />
            <div className="text-line" />
            <div className="text-line" />
            <div className="text-line" />
          </div>
          <div className="col">
            <div className="text-line" />
            <div className="text-line" />
            <div className="text-line" />
            <div className="text-line" />
          </div>
          <div className="col">
            <div className="text-line" />
            <div className="text-line" />
            <div className="text-line" />
            <div className="text-line" />
          </div>
        </div>
        <div className="divider" />
        <div className="row bottom-row">
          <div className="text-line" />
        </div>
      </div>
    ),
  },
  {
    value: 'compact',
    label: 'Compact',
    description: 'Reduced vertical height footer in a condensed arrangement.',
    preview: (
      <div className="preview-layout compact-layout">
        <div className="row main-row">
          <div className="box logo-box" />
          <div className="nav-items">
            <div className="text-line" />
            <div className="text-line" />
            <div className="text-line" />
          </div>
        </div>
        <div className="divider" />
        <div className="row bottom-row">
          <div className="text-line" />
          <div className="text-line" />
        </div>
      </div>
    ),
  },
  {
    value: 'minimal',
    label: 'Minimal',
    description: 'Very clean with logo and primary links only.',
    preview: (
      <div className="preview-layout minimal-layout">
        <div className="row main-row">
          <div className="box logo-box" />
          <div className="nav-items">
            <div className="text-line" />
            <div className="text-line" />
            <div className="text-line" />
          </div>
        </div>
        <div className="divider" />
        <div className="row bottom-row">
          <div className="text-line" />
        </div>
      </div>
    ),
  },
]

const FooterLayoutSelector: React.FC<{ path: string }> = ({ path }) => {
  const { value, setValue } = useField<string>({ path })

  // Fallback to 'default' if no value is set
  const selectedValue = value || 'default'

  return (
    <div className="field-type footer-layout-selector">
      <label className="field-label">Footer Layout</label>
      <p className="field-description">Choose how your website footer should look.</p>
      
      <div className="layout-grid" role="radiogroup" aria-label="Footer Layout Selection">
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
            <div className="layout-preview" aria-hidden="true">
              {layout.preview}
            </div>
            
            <div className="layout-info">
              <span className="layout-label">{layout.label}</span>
              <span className="layout-desc">{layout.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FooterLayoutSelector
