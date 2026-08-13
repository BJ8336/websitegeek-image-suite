import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-600">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-6 inline-block text-teal-600 hover:underline">
        Back to home
      </Link>
    </div>
  )
}

export default NotFound
