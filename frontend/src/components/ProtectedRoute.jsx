import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getApiBaseUrl } from '../lib/apiBaseUrl.js'

function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('loading')
  const apiBaseUrl = getApiBaseUrl()

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
          credentials: 'include',
        })

        if (!response.ok) {
          if (isMounted) {
            setStatus('unauthenticated')
          }
          return
        }

        if (isMounted) {
          setStatus('authenticated')
        }
      } catch (error) {
        if (isMounted) {
          setStatus('unauthenticated')
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [apiBaseUrl])

  if (status === 'loading') {
    return null
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
