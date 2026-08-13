import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CATEGORY_ORDER, tools } from '../data/toolsConfig'
import { useAuth } from '../context/AuthContext'
import { useSubscription } from '../context/SubscriptionContext'
import { useUpgradeModal } from '../context/UpgradeModalContext'
import ToolIcon from './ToolIcon'
import GoogleSignInButton from './GoogleSignInButton'
import ThemeToggle from './ThemeToggle'

// TODO: no hosted logo image exists yet for Image Suite — swap this for the
// real hosted URL (same pattern as the other 3 suites: LOGO_URL constant +
// <img>) once one is provided.
function LogoGlyph() {
  return (
    <svg viewBox="0 0 36 36" className="h-full w-full">
      <rect width="36" height="36" rx="8" fill="#0D9488" />
      <circle cx="14" cy="14" r="3.5" fill="#ffffff" />
      <path d="M6 27l8-9 5 5.5L26 13l6 14z" fill="#ffffff" opacity="0.9" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="11" y="3" width="6" height="6" rx="1" />
      <rect x="3" y="11" width="6" height="6" rx="1" />
      <rect x="11" y="11" width="6" height="6" rx="1" />
    </svg>
  )
}
function TagIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
      <path d="M11 3l6 6-8 8-6-6V4a1 1 0 011-1h7z" />
      <circle cx="7.5" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}
function ChevronIcon({ open }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
    >
      <path d="M7 4l6 6-6 6" />
    </svg>
  )
}

function UserAvatar({ user }) {
  const [imageFailed, setImageFailed] = useState(false)
  if (user.picture && !imageFailed) {
    return (
      <img
        src={user.picture}
        alt=""
        onError={() => setImageFailed(true)}
        className="h-8 w-8 shrink-0 rounded-full object-cover"
      />
    )
  }
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
      {user.name.charAt(0).toUpperCase()}
    </span>
  )
}

function CategorySection({ category, currentSlug }) {
  const categoryTools = tools.filter((tool) => tool.category === category && !tool.comingSoon)
  if (categoryTools.length === 0) return null

  const hasActiveTool = categoryTools.some((tool) => tool.slug === currentSlug)
  const [open, setOpen] = useState(hasActiveTool)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
      >
        <span>{category}</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <ul className="mt-0.5 space-y-0.5 pb-1">
          {categoryTools.map((tool) => {
            const isActive = tool.slug === currentSlug
            return (
              <li key={tool.slug}>
                <Link
                  to={`/${tool.slug}`}
                  className={`flex items-center gap-2.5 rounded-md py-1.5 pl-8 pr-3 text-sm ${
                    isActive
                      ? 'bg-teal-600/15 font-medium text-teal-400'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <ToolIcon slug={tool.slug} className="h-4 w-4 shrink-0" />
                  <span className="truncate">{tool.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function SidebarContent({ onNavigate }) {
  const location = useLocation()
  const firstSegment = location.pathname.slice(1).split('/')[0]
  const currentSlug = tools.some((tool) => tool.slug === firstSegment) ? firstSegment : null

  const { user, isSignedIn, signOut } = useAuth()
  const { isPro, devOverrideFree } = useSubscription()
  const { openUpgradeModal } = useUpgradeModal()

  return (
    <div className="flex h-full flex-col" onClick={onNavigate}>
      <div className="flex items-center gap-2.5 px-4 py-5">
        <span className="h-9 w-9 shrink-0 overflow-hidden rounded-lg">
          <LogoGlyph />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-sm font-bold text-white">WebsiteGeek</p>
          <p className="text-xs font-medium text-teal-400">Image Suite</p>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        <Link
          to="/"
          className={`mb-2 flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium ${
            location.pathname === '/' ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
          }`}
        >
          <GridIcon />
          All Tools
        </Link>
        <Link
          to="/pricing"
          className={`mb-2 flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium ${
            location.pathname === '/pricing'
              ? 'bg-white/10 text-white'
              : 'text-slate-300 hover:bg-white/5 hover:text-white'
          }`}
        >
          <TagIcon />
          Pricing
        </Link>

        <p className="mb-1 mt-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Tools
        </p>
        <div className="space-y-0.5">
          {CATEGORY_ORDER.map((category) => (
            <CategorySection key={category} category={category} currentSlug={currentSlug} />
          ))}
        </div>
      </nav>

      <div className="border-t border-white/10 p-3">
        {isSignedIn ? (
          <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
            <UserAvatar user={user} />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="shrink-0 text-xs font-medium text-slate-400 hover:text-white"
              title="Sign out"
            >
              Sign out
            </button>
          </div>
        ) : (
          <GoogleSignInButton />
        )}

        <div className="mt-2.5 flex items-center justify-between px-1">
          {import.meta.env.DEV && isPro && (
            <button
              type="button"
              onClick={devOverrideFree}
              className="text-[11px] text-slate-500 hover:text-slate-300"
              title="Dev-only local override — the next real status check will overwrite this"
            >
              Reset to Free (dev)
            </button>
          )}
          <button
            type="button"
            onClick={openUpgradeModal}
            disabled={isPro}
            className={`ml-auto rounded-full px-2.5 py-1 text-xs font-semibold ${
              isPro ? 'bg-teal-400/15 text-teal-400' : 'bg-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            {isPro ? 'Pro' : 'Free'}
          </button>
        </div>
      </div>
    </div>
  )
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5">
      <path d="M3 5h14M3 10h14M3 15h14" />
    </svg>
  )
}

function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center gap-3 border-b border-slate-800 bg-slate-900 px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="text-slate-300 hover:text-white"
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
        <span className="h-7 w-7 shrink-0 overflow-hidden rounded-md">
          <LogoGlyph />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-bold text-white">WebsiteGeek Image Suite</span>
        <ThemeToggle />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 bg-slate-900 md:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-slate-900 shadow-xl">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  )
}

export default Sidebar
