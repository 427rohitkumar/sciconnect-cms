'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'
import './HeaderLayoutSelector.scss'

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
    description: 'Logo left, navigation center/right, CTA on right.',
    preview: (
      <div className="preview-layout default-layout">
        <div className="box logo-box" />
        <div className="box nav-box">
          <span /><span /><span />
        </div>
        <div className="box btn-box" />
      </div>
    ),
  },
  {
    value: 'centered',
    label: 'Centered',
    description: 'Logo centered with navigation arranged around the brand.',
    preview: (
      <div className="preview-layout centered-layout">
        <div className="box nav-box">
          <span /><span />
        </div>
        <div className="box logo-box" />
        <div className="box nav-box">
          <span /><span />
        </div>
      </div>
    ),
  },
  {
    value: 'minimal',
    label: 'Minimal',
    description: 'Compact header with simplified navigation.',
    preview: (
      <div className="preview-layout minimal-layout">
        <div className="box logo-box" />
        <div className="box nav-box">
          <span /><span /><span />
        </div>
      </div>
    ),
  },
  {
    value: 'minimal-cta',
    label: 'Minimal CTA',
    description: 'Minimal header with a prominent CTA button on the right.',
    preview: (
      <div className="preview-layout minimal-cta-layout">
        <div className="box logo-box" />
        <div className="box nav-box">
          <span /><span /><span />
        </div>
        <div className="box btn-box" />
      </div>
    ),
  },
  {
    value: 'compact',
    label: 'Compact',
    description: 'Reduced-height header for dense layouts.',
    preview: (
      <div className="preview-layout compact-layout">
        <div className="box logo-box" />
        <div className="box nav-box">
          <span /><span /><span />
        </div>
        <div className="box btn-box" />
      </div>
    ),
  },
]

const HeaderLayoutSelector: React.FC<{ path: string }> = ({ path }) => {
  const { value, setValue } = useField<string>({ path })

  // Fallback to 'default' if no value is set
  const selectedValue = value || 'default'

  return (
    <div className="field-type header-layout-selector">
      <label className="field-label">Header Layout</label>
      <p className="field-description">Choose how your website header should look.</p>
      
      <div className="layout-grid">
        {LAYOUTS.map((layout) => {
          const isSelected = selectedValue === layout.value

          return (
            <button
              key={layout.value}
              type="button"
              className={`layout-card ${isSelected ? 'selected' : ''}`}
              onClick={() => setValue(layout.value)}
              aria-pressed={isSelected}
            >
              <div className="layout-preview">
                {layout.preview}
              </div>
              <div className="layout-info">
                <span className="layout-label">{layout.label}</span>
                <span className="layout-desc">{layout.description}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default HeaderLayoutSelector
