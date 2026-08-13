'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'
import './MobileMenuTriggerSelector.scss'

type TriggerOption = {
  value: string
  label: string
}

const TRIGGERS: TriggerOption[] = [
  { value: 'hamburger', label: 'Hamburger' },
  { value: 'menu-text', label: 'Menu + Text' },
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
]

const MobileMenuTriggerSelector: React.FC<{ path: string }> = ({ path }) => {
  const { value, setValue } = useField<string>({ path })
  const selectedValue = value || 'hamburger'

  return (
    <div className="field-type mobile-menu-trigger-selector">
      <label className="field-label">Menu Trigger Style</label>
      <p className="field-description">Choose the visual style of the mobile menu toggle button.</p>
      
      <div className="layout-grid" role="radiogroup" aria-label="Mobile Menu Trigger Style">
        {TRIGGERS.map((trigger) => (
          <div
            key={trigger.value}
            className={`layout-card ${selectedValue === trigger.value ? 'selected' : ''}`}
            onClick={() => setValue(trigger.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setValue(trigger.value)
              }
            }}
            role="radio"
            aria-checked={selectedValue === trigger.value}
            tabIndex={0}
          >
            <div className={`layout-preview trigger-${trigger.value}`} aria-hidden="true">
              <div className="mock-trigger">
                <div className="burger">
                  <span /><span /><span />
                </div>
                {trigger.value === 'menu-text' && <div className="text">MENU</div>}
              </div>
            </div>
            
            <div className="layout-info">
              <span className="layout-label">{trigger.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MobileMenuTriggerSelector
