'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'

export default function TemplatePreview() {
  // Grab the current value of the htmlBody field from the form state
  const htmlBody = useFormFields(([fields]) => fields.htmlBody?.value as string)

  if (!htmlBody) {
    return (
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px dashed var(--theme-border-color)' }}>
        <p style={{ margin: 0, color: 'var(--theme-elevation-400)' }}>Start typing HTML in the editor above to see a live preview here.</p>
      </div>
    )
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <h4 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Live Template Preview</h4>
      
      {/* We use an isolated div for email preview. */}
      <div 
        style={{ 
          border: '1px solid var(--theme-border-color)', 
          borderRadius: '4px',
          padding: '2rem',
          background: '#ffffff',
          color: '#000000',
          minHeight: '400px',
          width: '100%',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
        dangerouslySetInnerHTML={{ __html: htmlBody }}
      />
    </div>
  )
}
