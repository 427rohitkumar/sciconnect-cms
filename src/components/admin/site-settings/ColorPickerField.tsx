'use client'

import React, { useState, useEffect } from 'react'
import { useField } from '@payloadcms/ui'
import './ColorPickerField.scss'

type Props = {
  path: string
  field: {
    label?: string
    admin?: {
      description?: string
    }
  }
}

const HEX_REGEX = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/

const ColorPickerField: React.FC<Props> = ({ path, field }) => {
  const { value, setValue, showError, errorMessage } = useField<string>({ path })
  
  // Local state for the text input to allow typing invalid intermediate values
  const [textValue, setTextValue] = useState(value || '')
  const [localError, setLocalError] = useState<string | null>(null)

  // Sync external value changes into local text
  useEffect(() => {
    if (value && value !== textValue && HEX_REGEX.test(value)) {
      setTextValue(value)
      setLocalError(null)
    }
  }, [value])

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value
    // Auto-prepend # if user starts typing a hex code
    if (val.length > 0 && !val.startsWith('#') && /^[0-9A-Fa-f]/.test(val)) {
      val = '#' + val
    }
    
    setTextValue(val)

    if (val === '') {
      setLocalError(null)
      setValue('')
      return
    }

    if (HEX_REGEX.test(val)) {
      setLocalError(null)
      setValue(val.toUpperCase())
    } else {
      setLocalError('Must be a valid HEX color (e.g. #2563EB)')
    }
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase()
    setTextValue(val)
    setLocalError(null)
    setValue(val)
  }

  const displayColor = HEX_REGEX.test(textValue) ? textValue : '#000000'
  const isError = localError || showError
  const displayError = localError || errorMessage

  // Fallback label generation if field label isn't fully passed down
  const formatLabel = (str: string) => {
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
  }
  
  // @ts-ignore - Payload sometimes passes label as a Record in localization
  const labelText = typeof field?.label === 'string' ? field.label : formatLabel(path)

  return (
    <div className="field-type color-picker-field">
      <label className="field-label" htmlFor={`color-text-${path}`}>
        {labelText}
      </label>
      
      {field?.admin?.description && (
        <p className="field-description">{field.admin.description}</p>
      )}

      <div className={`color-control-wrapper ${isError ? 'has-error' : ''}`}>
        <div className="color-swatch-wrapper">
          <input
            type="color"
            value={displayColor}
            onChange={handleColorChange}
            aria-label={`Select color for ${labelText}`}
            tabIndex={0}
          />
        </div>
        
        <div className="hex-input-wrapper">
          <input
            id={`color-text-${path}`}
            type="text"
            value={textValue}
            onChange={handleTextChange}
            placeholder="#000000"
            maxLength={7}
            aria-invalid={!!isError}
          />
        </div>
      </div>
      
      {isError && (
        <span className="error-message">{displayError}</span>
      )}
    </div>
  )
}

export default ColorPickerField
