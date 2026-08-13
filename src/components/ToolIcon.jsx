// One small hand-drawn glyph per tool, kept in a single file so the whole
// icon set stays visually consistent (same stroke weight, same viewBox).
// Empty until each tool is actually built — falls back to a plain circle.
const PATHS = {}

function ToolIcon({ slug, className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[slug] || <circle cx="10" cy="10" r="6" />}
    </svg>
  )
}

export default ToolIcon
