import React from 'react'

export const Icon: React.FC = () => {
  return (
    <img
      src="/logo.png"
      alt="Sci-Connect Logo"
      style={{
        width: '36px',
        height: '36px',
        objectFit: 'contain',
      }}
    />
  )
}

export default Icon
