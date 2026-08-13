'use client'
// Force recompile

import React from 'react'
import { useField } from '@payloadcms/ui'
import './HeroLayoutSelector.scss'

type LayoutOption = {
  value: string
  label: string
  description: string
  preview: React.ReactNode
}

const LAYOUTS: LayoutOption[] = [
  {
    value: 'default',
    label: 'Default Split',
    description: 'Split layout with featured article on the right.',
    preview: (
      <div className="preview-layout hero-default">
        <div className="hero-content">
          <div className="line eyebrow-line" />
          <div className="line title-line" />
          <div className="line title-line short" />
          <div className="line desc-line" />
          <div className="line desc-line" />
          <div className="btn-box" />
        </div>
        <div className="hero-feature">
          <div className="feature-img" />
          <div className="line desc-line" />
          <div className="line title-line short" />
        </div>
      </div>
    ),
  },
  {
    value: 'full-image',
    label: 'Full Image',
    description: 'Edge-to-edge background image with overlaid text.',
    preview: (
      <div className="preview-layout hero-full-image">
        <div className="hero-overlay">
          <div className="line eyebrow-line center" />
          <div className="line title-line center" />
          <div className="line title-line short center" />
          <div className="line desc-line center" />
          <div className="btn-box center" />
        </div>
      </div>
    ),
  },
  {
    value: 'centered',
    label: 'Centered',
    description: 'Clean centered text above a large image.',
    preview: (
      <div className="preview-layout hero-centered">
        <div className="hero-content-center">
          <div className="line eyebrow-line center" />
          <div className="line title-line center" />
          <div className="line title-line short center" />
          <div className="line desc-line center" />
          <div className="btn-box center" />
        </div>
        <div className="hero-img-bottom" />
      </div>
    ),
  },
  {
    value: 'slider',
    label: 'Slider Gallery',
    description: 'Interactive image gallery slider.',
    preview: (
      <div className="preview-layout hero-slider">
        <div className="slider-nav left" />
        <div className="slider-img" />
        <div className="slider-nav right" />
        <div className="slider-dots">
          <span /><span /><span />
        </div>
      </div>
    ),
  },
]

const HeroLayoutSelector: React.FC<{ path: string }> = ({ path }) => {
  const { value, setValue } = useField<string>({ path })

  // Fallback to 'default' if no value is set
  const selectedValue = value || 'default'

  return (
    <div className="field-type hero-layout-selector">
      <label className="field-label">Hero Layout</label>
      <p className="field-description">Choose how your homepage hero section should look.</p>
      
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

export default HeroLayoutSelector
