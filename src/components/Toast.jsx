import { useToast } from '../context/ToastContext'

function Toast() {
  const { message } = useToast()

  if (!message) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
      {message}
    </div>
  )
}

export default Toast
