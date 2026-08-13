import React from 'react'

export const Logo: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontWeight: 'bold',
        fontSize: '1.25rem',
        letterSpacing: '-0.02em',
        color: 'var(--theme-elevation-1000)',
      }}
    >
      <img
        src="/logo.png"
        alt="Sci-Connect Logo"
        style={{
          width: '44px',
          height: '44px',
          objectFit: 'contain',
        }}
      />
      <span>
        Sci-Connect <span style={{ fontSize: '0.85rem', color: 'var(--theme-elevation-500)', fontWeight: 500 }}>CMS</span>
      </span>
    </div>
  )
}

export default Logo
