import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getApiBaseUrl } from '../lib/apiBaseUrl.js'
import { fetchMe } from '../lib/fetchMe.js'

function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('loading')
  const location = useLocation()
  const apiBaseUrl = getApiBaseUrl()

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      try {
        const { ok } = await fetchMe(apiBaseUrl)

        if (!ok) {
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
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
