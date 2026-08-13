import { Link } from 'react-router-dom'
import { CATEGORY_ORDER, getToolsByCategory } from '../data/toolsConfig'
import ToolIcon from '../components/ToolIcon'

function ToolCard({ tool }) {
  if (tool.comingSoon) {
    return (
      <div className="flex flex-col rounded-xl border border-dashed border-slate-200 bg-white p-5 opacity-60">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <ToolIcon slug={tool.slug} className="h-5 w-5" />
        </span>
        <h3 className="mt-3 font-semibold text-slate-900">{tool.name}</h3>
        <p className="mt-1 flex-1 text-sm text-slate-600">{tool.description}</p>
        <span className="mt-4 inline-flex w-fit items-center rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          Coming soon
        </span>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:border-teal-300 hover:shadow-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
        <ToolIcon slug={tool.slug} className="h-5 w-5" />
      </span>
      <h3 className="mt-3 font-semibold text-slate-900">{tool.name}</h3>
      <p className="mt-1 flex-1 text-sm text-slate-600">{tool.description}</p>
      <Link
        to={`/${tool.slug}`}
        className="mt-4 inline-flex w-fit items-center rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-teal-700"
      >
        Go to Tool
      </Link>
    </div>
  )
}

function Home() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">WebsiteGeek Image Suite</p>
      <h1 className="mt-1 text-3xl font-bold text-slate-900">Free, Browser-Based Image Tools</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Compress, convert, crop, edit, and label your photos — right in your browser. The free
        tools work with no signup, and nothing you upload is ever sent to a server — every tool
        runs locally on your device.
      </p>

      <div className="mt-10 space-y-12">
        {CATEGORY_ORDER.map((category) => {
          const categoryTools = getToolsByCategory(category)
          if (categoryTools.length === 0) return null
          const allComingSoon = categoryTools.every((tool) => tool.comingSoon)

          return (
            <section key={category}>
              <div className="mb-4 flex items-baseline gap-2.5">
                <h2 className="text-lg font-bold text-slate-900">{category}</h2>
                {allComingSoon && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Coming soon
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryTools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default Home
