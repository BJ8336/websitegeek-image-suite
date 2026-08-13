import { Link } from 'react-router-dom'
import { useDocumentHead } from '../hooks/useDocumentHead'

function ToolHeader({ tool }) {
  useDocumentHead({
    title: `${tool.name} — Free Tool | WebsiteGeek Image Suite`,
    description: tool.description,
  })

  return (
    <div className="mb-6">
      <nav className="mb-3 flex items-center gap-1.5 text-xs text-slate-500">
        <Link to="/" className="hover:text-teal-600">
          All tools
        </Link>
        <span>›</span>
        <span>{tool.category}</span>
        <span>›</span>
        <span className="text-slate-700">{tool.name}</span>
      </nav>
      <div className="flex flex-wrap items-center gap-2.5">
        <h1 className="text-2xl font-bold text-slate-900">{tool.name}</h1>
        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
          Free
        </span>
        {tool.hasProFeatures && (
          <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
            + Pro features
          </span>
        )}
      </div>
      <p className="mt-2 max-w-2xl text-slate-600">{tool.description}</p>
    </div>
  )
}

export default ToolHeader
