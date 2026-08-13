function ToolPlaceholder({ tool }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">{tool.category}</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">{tool.name}</h1>
      <p className="mx-auto mt-3 max-w-md text-slate-600">{tool.description}</p>
      <p className="mt-6 text-sm font-medium text-slate-400">Coming soon</p>
    </div>
  )
}

export default ToolPlaceholder
