import { useEffect, useRef, useState } from 'react'
import { useAuth, GOOGLE_CLIENT_ID } from '../context/AuthContext'

const MAX_ATTEMPTS = 50 // ~5s at 100ms — generous for a script tag that's usually ready almost instantly

function GoogleSignInButton() {
  const containerRef = useRef(null)
  const { handleGoogleCredential } = useAuth()
  const [failedToLoad, setFailedToLoad] = useState(false)

  useEffect(() => {
    let cancelled = false
    let attempts = 0

    function tryRender() {
      if (cancelled) return
      if (window.google?.accounts?.id && containerRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => handleGoogleCredential(response),
          auto_select: false,
        })
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'filled_blue',
          size: 'medium',
          shape: 'pill',
          text: 'signin_with',
          width: 220,
        })
        return
      }
      attempts += 1
      if (attempts >= MAX_ATTEMPTS) {
        setFailedToLoad(true)
        return
      }
      setTimeout(tryRender, 100)
    }

    tryRender()
    return () => {
      cancelled = true
    }
  }, [handleGoogleCredential])

  if (failedToLoad) {
    return (
      <p className="text-xs text-slate-500">
        Sign-in unavailable — Google's sign-in script didn't load. This can happen if an ad
        blocker or browser privacy setting is blocking accounts.google.com.
      </p>
    )
  }

  return <div ref={containerRef} />
}

export default GoogleSignInButton
