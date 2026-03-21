import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { titleForPathname } from '../lib/documentTitle.js'

/** Keeps <title> in sync with the current route (SPA). */
export default function SyncDocumentTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = titleForPathname(pathname)
  }, [pathname])

  return null
}
