'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'
import './MobileHeaderStyleSelector.scss'

type StyleOption = {
  value: string
  label: string
}

const STYLES: StyleOption[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'centered', label: 'Centered Logo' },
  { value: 'logo-search', label: 'Logo + Search' },
  { value: 'minimal', label: 'Minimal' },
]

const MobileHeaderStyleSelector: React.FC<{ path: string }> = ({ path }) => {
  const { value, setValue } = useField<string>({ path })
  const selectedValue = value || 'standard'

  return (
    <div className="field-type mobile-header-style-selector">
      <label className="field-label">Mobile Header Style</label>
      <p className="field-description">Choose the layout of the top navigation bar on mobile devices.</p>
      
      <div className="layout-grid" role="radiogroup" aria-label="Mobile Header Style">
        {STYLES.map((style) => (
          <div
            key={style.value}
            className={`layout-card ${selectedValue === style.value ? 'selected' : ''}`}
            onClick={() => setValue(style.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setValue(style.value)
              }
            }}
            role="radio"
            aria-checked={selectedValue === style.value}
            tabIndex={0}
          >
            <div className={`layout-preview style-${style.value}`} aria-hidden="true">
              <div className="mock-header">
                {style.value !== 'minimal' && <div className="mock-logo" />}
                {style.value === 'logo-search' && <div className="mock-icon" />}
                <div className="mock-burger" />
              </div>
            </div>
            
            <div className="layout-info">
              <span className="layout-label">{style.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MobileHeaderStyleSelector
