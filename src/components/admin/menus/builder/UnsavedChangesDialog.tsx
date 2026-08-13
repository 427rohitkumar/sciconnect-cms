'use client'

import React, { useEffect } from 'react'

type Props = {
  hasChanges: boolean
}

export default function UnsavedChangesDialog({ hasChanges }: Props) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        const message = 'You have unsaved menu changes.'
        e.returnValue = message
        return message
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges])

  return null
}
