import { useTheme } from '../context/ThemeContext'

function SunIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="h-4 w-4">
      <circle cx="10" cy="10" r="3.2" />
      <path d="M10 2v1.6M10 16.4V18M18 10h-1.6M3.6 10H2M15.5 4.5l-1.1 1.1M5.6 14.4l-1.1 1.1M15.5 15.5l-1.1-1.1M5.6 5.6L4.5 4.5" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M17.3 12.1A7.2 7.2 0 018 3a5.7 5.7 0 107.9 7.9c.4-.1.9-.1 1.4 0a.5.5 0 01.4.8 8.2 8.2 0 01-15-4.8 8.2 8.2 0 0114.9-4.7.5.5 0 01-.1.9 5.7 5.7 0 00-1.7 8.6.5.5 0 01-.5.4z" />
    </svg>
  )
}

function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-300 hover:bg-white/10 hover:text-white ${className}`}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}

export default ThemeToggle
