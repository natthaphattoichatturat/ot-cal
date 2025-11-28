'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState } from 'react'

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'th' as const, name: 'ไทย', flag: '🇹🇭' },
    { code: 'en' as const, name: 'English', flag: '🇬🇧' },
    { code: 'zh' as const, name: '中文', flag: '🇨🇳' },
  ]

  const currentLang = languages.find(lang => lang.code === language)

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
    }}>
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            padding: '10px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-md)'
          }}
        >
          <span style={{ fontSize: '18px' }}>{currentLang?.flag}</span>
          <span style={{ color: 'var(--text-primary)' }}>{currentLang?.name}</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {isOpen ? '▲' : '▼'}
          </span>
        </button>

        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            minWidth: '140px',
          }}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code)
                  setIsOpen(false)
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: language === lang.code ? 'var(--primary-light)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  fontWeight: language === lang.code ? '600' : '400',
                  color: 'var(--text-primary)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (language !== lang.code) {
                    e.currentTarget.style.background = 'var(--bg-surface)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (language !== lang.code) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <span style={{ fontSize: '18px' }}>{lang.flag}</span>
                <span>{lang.name}</span>
                {language === lang.code && (
                  <span style={{ marginLeft: 'auto', color: 'var(--primary)' }}>✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1,
          }}
        />
      )}
    </div>
  )
}
