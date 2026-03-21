/** Browser tab label: page first, then site (e.g. "Quiz · CSarena"). */
export const SITE_TITLE = 'CSarena'

export function formatPageTitle(pageLabel) {
  const t = typeof pageLabel === 'string' ? pageLabel.trim() : ''
  if (!t) return SITE_TITLE
  return `${t} · ${SITE_TITLE}`
}

export function titleForPathname(pathname) {
  if (pathname === '/') return formatPageTitle('Home')
  if (pathname.startsWith('/login')) return formatPageTitle('Login')
  if (pathname.startsWith('/signup')) return formatPageTitle('Sign up')
  if (pathname.startsWith('/terms')) return formatPageTitle('Terms')
  if (pathname === '/dash' || pathname.startsWith('/dashboard')) return formatPageTitle('Dashboard')
  if (pathname.startsWith('/learn')) return formatPageTitle('Learn')
  if (pathname.startsWith('/quiz/upload')) return formatPageTitle('Upload quiz')
  if (pathname.startsWith('/quiz/run/')) return formatPageTitle('Take quiz')
  if (pathname.startsWith('/quiz/ai/')) return formatPageTitle('Quiz preview')
  if (pathname === '/quiz' || pathname.startsWith('/quiz?')) return formatPageTitle('Quiz')
  if (pathname.startsWith('/profile/edit')) return formatPageTitle('Edit profile')
  if (pathname.startsWith('/profile')) return formatPageTitle('Profile')
  return SITE_TITLE
}
