'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CoverImageCell({ cellData, rowData }: { cellData: any, rowData: any }) {
  const [imageUrl, setImageUrl] = useState<string>('/defult-imag.jpg')

  useEffect(() => {
    if (!cellData) return;
    
    const id = typeof cellData === 'object' ? cellData?.id || cellData?.value : cellData;
    const url = typeof cellData === 'object' ? cellData?.url : null;

    if (url) {
      setImageUrl(url);
    } else if (id) {
      fetch(`/api/media/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data?.url) setImageUrl(data.url);
        })
        .catch(console.error);
    }
  }, [cellData])

  return (
    <Link href={`/admin/collections/articles/${rowData.id}`} style={{ display: 'flex', alignItems: 'center', height: '100%', cursor: 'pointer' }}>
      <img
        src={imageUrl}
        alt="Cover"
        style={{
          width: '60px',
          height: '40px',
          objectFit: 'cover',
          borderRadius: '4px',
          border: '1px solid var(--theme-elevation-100)',
          background: 'var(--theme-elevation-50)'
        }}
      />
    </Link>
  )
}
