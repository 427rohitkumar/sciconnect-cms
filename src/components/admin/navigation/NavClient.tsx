'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { usePreferences } from '@payloadcms/ui'
import Logo from '../Logo'

interface GroupState {
  Content: boolean
  Media: boolean
  Users: boolean
  Apps: boolean
  Newsletter: boolean
  Comments: boolean
  Settings: boolean
}

const DEFAULT_GROUP_STATE: GroupState = {
  Content: true,
  Media: false,
  Users: false,
  Apps: false,
  Newsletter: false,
  Comments: false,
  Settings: false,
}

const PREFERENCE_KEY = 'sciconnect-admin-nav-state'

export const NavClient: React.FC = () => {
  const pathname = usePathname()
  const { getPreference, setPreference } = usePreferences()

  const [groups, setGroups] = useState<GroupState>(DEFAULT_GROUP_STATE)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load preferences from Payload and apply route-aware auto-expansion
  useEffect(() => {
    let isMounted = true

    async function loadNavState() {
      try {
        const saved = await getPreference<GroupState>(PREFERENCE_KEY)
        const initialState = { ...DEFAULT_GROUP_STATE, ...(saved || {}) }

        // Route-aware auto-expansion if active page is inside a collapsed group
        if (
          pathname.includes('/collections/articles') ||
          pathname.includes('/collections/categories') ||
          pathname.includes('/collections/tags') ||
          pathname.includes('/collections/menus') ||
          pathname.includes('/collections/menu-items')
        ) {
          initialState.Content = true
        } else if (pathname.includes('/collections/media')) {
          initialState.Media = true
        } else if (pathname.includes('/collections/users') || pathname.includes('/collections/authors')) {
          initialState.Users = true
        } else if (
          pathname.includes('/collections/subscribers') ||
          pathname.includes('/collections/newsletter-deliveries') ||
          pathname.includes('/collections/email-templates') ||
          pathname.includes('/globals/email-settings')
        ) {
          initialState.Newsletter = true
        } else if (pathname.includes('/collections/comments')) {
          initialState.Comments = true
        } else if (pathname.includes('/apps/')) {
          initialState.Apps = true
        } else if (pathname.includes('/globals/site-settings') || pathname.includes('/globals/hero-settings')) {
          initialState.Settings = true
        }

        if (isMounted) {
          setGroups(initialState)
          setIsLoaded(true)
        }
      } catch {
        if (isMounted) {
          setIsLoaded(true)
        }
      }
    }

    loadNavState()

    return () => {
      isMounted = false
    }
  }, [pathname, getPreference])

  const toggleGroup = (groupKey: keyof GroupState) => {
    const updatedState = {
      ...groups,
      [groupKey]: !groups[groupKey],
    }
    setGroups(updatedState)
    void setPreference(PREFERENCE_KEY, updatedState)
  }

  const isDashboardActive = pathname === '/admin' || pathname === '/admin/'
  const isArticlesActive = pathname.includes('/collections/articles')
  const isCategoriesActive = pathname.includes('/collections/categories')
  const isTagsActive = pathname.includes('/collections/tags')
  const isMenusActive = pathname.includes('/collections/menus') || pathname.includes('/collections/menu-items')
  const isMediaActive = pathname.includes('/collections/media')
  const isUsersActive = pathname.includes('/collections/users')
  const isAuthorsActive = pathname.includes('/collections/authors')
  const isSubscribersActive = pathname.includes('/collections/subscribers')
  const isNewsletterDeliveriesActive = pathname.includes('/collections/newsletter-deliveries')
  const isEmailTemplatesActive = pathname.includes('/collections/email-templates')
  const isEmailSettingsActive = pathname.includes('/globals/email-settings')
  
  const isCommentsActive = pathname.includes('/collections/comments')

  const isGoogleAnalyticsActive = pathname.includes('/apps/google-analytics')
  const isSiteSettingsActive = pathname.includes('/globals/site-settings')
  const isHeroSettingsActive = pathname.includes('/globals/hero-settings')

  return (
    <nav className="sciconnect-nav">
      <div className="sciconnect-nav__header">
        <Link href="/admin" className="sciconnect-nav__logo-link">
          <Logo />
        </Link>
      </div>

      <div className="sciconnect-nav__group">
        <Link
          href="/admin"
          className={`sciconnect-nav__item ${isDashboardActive ? 'sciconnect-nav__item--active' : ''}`}
        >
          <span className="sciconnect-nav__icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </span>
          <span className="sciconnect-nav__label">Dashboard</span>
        </Link>
      </div>

      {/* CONTENT GROUP */}
      <div className="sciconnect-nav__group">
        <button
          type="button"
          className="sciconnect-nav__group-header"
          onClick={() => toggleGroup('Content')}
          aria-expanded={groups.Content}
          aria-controls="sciconnect-nav-group-content"
        >
          <span className="sciconnect-nav__group-title">
            <span className="sciconnect-nav__icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </span>
            CONTENT
          </span>
          <span
            className={`sciconnect-nav__group-arrow ${groups.Content ? 'sciconnect-nav__group-arrow--expanded' : ''}`}
            aria-hidden="true"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>

        {groups.Content && (
          <div id="sciconnect-nav-group-content" className="sciconnect-nav__group-items">
            <Link
              href="/admin/collections/articles"
              className={`sciconnect-nav__item ${isArticlesActive ? 'sciconnect-nav__item--active' : ''}`}
            >
              <span className="sciconnect-nav__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </span>
              <span className="sciconnect-nav__label">Articles</span>
            </Link>

            <Link
              href="/admin/collections/categories"
              className={`sciconnect-nav__item ${isCategoriesActive ? 'sciconnect-nav__item--active' : ''}`}
            >
              <span className="sciconnect-nav__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <span className="sciconnect-nav__label">Categories</span>
            </Link>

            <Link
              href="/admin/collections/tags"
              className={`sciconnect-nav__item ${isTagsActive ? 'sciconnect-nav__item--active' : ''}`}
            >
              <span className="sciconnect-nav__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </span>
              <span className="sciconnect-nav__label">Tags</span>
            </Link>

            <Link
              href="/admin/collections/menus"
              className={`sciconnect-nav__item ${isMenusActive ? 'sciconnect-nav__item--active' : ''}`}
            >
              <span className="sciconnect-nav__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </span>
              <span className="sciconnect-nav__label">Menus</span>
            </Link>
          </div>
        )}
      </div>

      {/* MEDIA GROUP */}
      <div className="sciconnect-nav__group">
        <button
          type="button"
          className="sciconnect-nav__group-header"
          onClick={() => toggleGroup('Media')}
          aria-expanded={groups.Media}
          aria-controls="sciconnect-nav-group-media"
        >
          <span className="sciconnect-nav__group-title">
            <span className="sciconnect-nav__icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </span>
            MEDIA
          </span>
          <span
            className={`sciconnect-nav__group-arrow ${groups.Media ? 'sciconnect-nav__group-arrow--expanded' : ''}`}
            aria-hidden="true"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>

        {groups.Media && (
          <div id="sciconnect-nav-group-media" className="sciconnect-nav__group-items">
            <Link
              href="/admin/collections/media"
              className={`sciconnect-nav__item ${isMediaActive ? 'sciconnect-nav__item--active' : ''}`}
            >
              <span className="sciconnect-nav__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </span>
              <span className="sciconnect-nav__label">Media</span>
            </Link>
          </div>
        )}
      </div>

      {/* USERS GROUP */}
      <div className="sciconnect-nav__group">
        <button
          type="button"
          className="sciconnect-nav__group-header"
          onClick={() => toggleGroup('Users')}
          aria-expanded={groups.Users}
          aria-controls="sciconnect-nav-group-users"
        >
          <span className="sciconnect-nav__group-title">
            <span className="sciconnect-nav__icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            USERS
          </span>
          <span
            className={`sciconnect-nav__group-arrow ${groups.Users ? 'sciconnect-nav__group-arrow--expanded' : ''}`}
            aria-hidden="true"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>

        {groups.Users && (
          <div id="sciconnect-nav-group-users" className="sciconnect-nav__group-items">
            <Link
              href="/admin/collections/users"
              className={`sciconnect-nav__item ${isUsersActive ? 'sciconnect-nav__item--active' : ''}`}
            >
              <span className="sciconnect-nav__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </span>
              <span className="sciconnect-nav__label">Users</span>
            </Link>

            <Link
              href="/admin/collections/authors"
              className={`sciconnect-nav__item ${isAuthorsActive ? 'sciconnect-nav__item--active' : ''}`}
            >
              <span className="sciconnect-nav__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </span>
              <span className="sciconnect-nav__label">Authors</span>
            </Link>
          </div>
        )}
      </div>

      {/* NEWSLETTER GROUP */}
      <div className="sciconnect-nav__group">
        <button
          type="button"
          className="sciconnect-nav__group-header"
          onClick={() => toggleGroup('Newsletter')}
          aria-expanded={groups.Newsletter}
          aria-controls="sciconnect-nav-group-newsletter"
        >
          <span className="sciconnect-nav__group-title">
            <span className="sciconnect-nav__icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </span>
            NEWSLETTER
          </span>
          <span
            className={`sciconnect-nav__group-arrow ${groups.Newsletter ? 'sciconnect-nav__group-arrow--expanded' : ''}`}
            aria-hidden="true"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>

        {groups.Newsletter && (
          <div id="sciconnect-nav-group-newsletter" className="sciconnect-nav__group-items">
            <Link
              href="/admin/collections/subscribers"
              className={`sciconnect-nav__item ${isSubscribersActive ? 'sciconnect-nav__item--active' : ''}`}
            >
              <span className="sciconnect-nav__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </span>
              <span className="sciconnect-nav__label">Subscribers</span>
            </Link>

            <Link
              href="/admin/collections/newsletter-deliveries"
              className={`sciconnect-nav__item ${isNewsletterDeliveriesActive ? 'sciconnect-nav__item--active' : ''}`}
            >
              <span className="sciconnect-nav__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </span>
              <span className="sciconnect-nav__label">Deliveries</span>
            </Link>

            <Link
              href="/admin/collections/email-templates"
              className={`sciconnect-nav__item ${isEmailTemplatesActive ? 'sciconnect-nav__item--active' : ''}`}
            >
              <span className="sciconnect-nav__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                </svg>
              </span>
              <span className="sciconnect-nav__label">Templates</span>
            </Link>

            <Link
              href="/admin/globals/email-settings"
              className={`sciconnect-nav__item ${isEmailSettingsActive ? 'sciconnect-nav__item--active' : ''}`}
            >
              <span className="sciconnect-nav__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </span>
              <span className="sciconnect-nav__label">Email Settings</span>
            </Link>
          </div>
        )}
      </div>

      {/* APPS GROUP */}
      <div className="sciconnect-nav__group">
        <button
          type="button"
          className="sciconnect-nav__group-header"
          onClick={() => toggleGroup('Apps')}
          aria-expanded={groups.Apps}
          aria-controls="sciconnect-nav-group-apps"
        >
          <span className="sciconnect-nav__group-title">
            <span className="sciconnect-nav__icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
            </span>
            APPS
          </span>
          <span
            className={`sciconnect-nav__group-arrow ${groups.Apps ? 'sciconnect-nav__group-arrow--expanded' : ''}`}
            aria-hidden="true"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>

        {groups.Apps && (
          <div id="sciconnect-nav-group-apps" className="sciconnect-nav__group-items">
            <Link
              href="/admin/apps/google-analytics"
              className={`sciconnect-nav__item ${isGoogleAnalyticsActive ? 'sciconnect-nav__item--active' : ''}`}
            >
              <span className="sciconnect-nav__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20V10" />
                  <path d="M18 20V4" />
                  <path d="M6 20v-4" />
                </svg>
              </span>
              <span className="sciconnect-nav__label">Google Analytics</span>
            </Link>
          </div>
        )}
      </div>

      {/* COMMENTS GROUP */}
      <div className="sciconnect-nav__group">
        <button
          type="button"
          className="sciconnect-nav__group-header"
          onClick={() => toggleGroup('Comments')}
          aria-expanded={groups.Comments}
          aria-controls="sciconnect-nav-group-comments"
        >
          <span className="sciconnect-nav__group-title">
            <span className="sciconnect-nav__icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </span>
            COMMENTS
          </span>
          <span
            className={`sciconnect-nav__group-arrow ${groups.Comments ? 'sciconnect-nav__group-arrow--expanded' : ''}`}
            aria-hidden="true"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>

        {groups.Comments && (
          <div id="sciconnect-nav-group-comments" className="sciconnect-nav__group-items">
            <Link
              href="/admin/collections/comments"
              className={`sciconnect-nav__item ${isCommentsActive ? 'sciconnect-nav__item--active' : ''}`}
            >
              <span className="sciconnect-nav__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </span>
              <span className="sciconnect-nav__label">All Comments</span>
            </Link>
          </div>
        )}
      </div>

      {/* SETTINGS GROUP */}
      <div className="sciconnect-nav__group">
        <button
          type="button"
          className="sciconnect-nav__group-header"
          onClick={() => toggleGroup('Settings')}
          aria-expanded={groups.Settings}
          aria-controls="sciconnect-nav-group-settings"
        >
          <span className="sciconnect-nav__group-title">
            <span className="sciconnect-nav__icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </span>
            SETTINGS
          </span>
          <span
            className={`sciconnect-nav__group-arrow ${groups.Settings ? 'sciconnect-nav__group-arrow--expanded' : ''}`}
            aria-hidden="true"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>

        {groups.Settings && (
          <div id="sciconnect-nav-group-settings" className="sciconnect-nav__group-items">
            <Link
              href="/admin/globals/site-settings"
              className={`sciconnect-nav__item ${isSiteSettingsActive ? 'sciconnect-nav__item--active' : ''}`}
            >
              <span className="sciconnect-nav__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </span>
              <span className="sciconnect-nav__label">Site Settings</span>
            </Link>

            <Link
              href="/admin/globals/hero-settings"
              className={`sciconnect-nav__item ${isHeroSettingsActive ? 'sciconnect-nav__item--active' : ''}`}
            >
              <span className="sciconnect-nav__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="14" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <circle cx="12" cy="14" r="1" />
                </svg>
              </span>
              <span className="sciconnect-nav__label">Hero Section</span>
            </Link>
          </div>
        )}
      </div>

      <div className="sciconnect-nav__footer">
        <Link href="/admin/account" className="sciconnect-nav__item">
          <span className="sciconnect-nav__icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </span>
          <span className="sciconnect-nav__label">Account</span>
        </Link>

        <Link href="/admin/logout" className="sciconnect-nav__item sciconnect-nav__item--logout">
          <span className="sciconnect-nav__icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </span>
          <span className="sciconnect-nav__label">Log out</span>
        </Link>
      </div>
    </nav>
  )
}

export default NavClient
