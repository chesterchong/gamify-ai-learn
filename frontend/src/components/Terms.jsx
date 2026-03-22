import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { GravityStarsBackground } from './animate-ui/components/backgrounds/gravity-stars'
import TermsThemeStyles from './TermsThemeStyles'

const SECTION_NAV = [
  { id: 'acceptance', num: '01', short: 'Acceptance' },
  { id: 'eligibility', num: '02', short: 'Eligibility' },
  { id: 'conduct', num: '03', short: 'Conduct' },
  { id: 'intellectual', num: '04', short: 'IP policy' },
  { id: 'privacy', num: '05', short: 'Privacy' },
  { id: 'contact', num: '06', short: 'Contact' },
]

function TermsBreadcrumb({ className = '' }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 transition-colors hover:text-primary"
      >
        <span className="material-symbols-outlined text-[18px] leading-none" aria-hidden>
          arrow_back
        </span>
        Home
      </Link>
    </nav>
  )
}

function TermsSectionNav({ activeId, scrollToSection, navClassName, layout }) {
  const isDesktop = layout === 'desktop'
  return (
    <nav className={navClassName} aria-label="Terms sections">
      {SECTION_NAV.map(({ id, num, short }) => {
        const active = activeId === id
        return (
          <a
            key={id}
            href={`#${id}`}
            className={[
              'flex shrink-0 items-center gap-3 border px-3 py-2.5 text-left text-xs font-medium transition-colors duration-200',
              isDesktop ? 'rounded-lg' : 'rounded-xl',
              active
                ? 'border-primary/50 bg-primary/10 text-primary shadow-[0_0_24px_-8px_rgba(0,243,255,0.35)]'
                : 'border-slate-700/60 bg-slate-900/30 text-slate-400 hover:border-slate-600 hover:bg-slate-800/40 hover:text-slate-200',
            ].join(' ')}
            onClick={(e) => {
              e.preventDefault()
              scrollToSection(id)
            }}
          >
            <span
              className={['font-mono text-[10px] tabular-nums', active ? 'text-primary' : 'text-slate-600'].join(' ')}
            >
              {num}
            </span>
            <span className="whitespace-nowrap">{short}</span>
          </a>
        )
      })}
    </nav>
  )
}

const LG_MIN_PX = 1024

function Terms() {
  const location = useLocation()
  const [activeId, setActiveId] = useState('acceptance')
  const desktopRailRef = useRef(null)
  const [desktopTocLeft, setDesktopTocLeft] = useState(null)

  const syncDesktopRail = useCallback(() => {
    if (typeof window === 'undefined') return
    if (window.innerWidth < LG_MIN_PX) {
      setDesktopTocLeft(null)
      return
    }
    const el = desktopRailRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    if (r.width < 8) {
      setDesktopTocLeft(null)
      return
    }
    setDesktopTocLeft(r.left)
  }, [])

  useEffect(() => {
    document.documentElement.style.scrollbarGutter = 'stable'
    return () => {
      document.documentElement.style.scrollbarGutter = ''
    }
  }, [])

  useLayoutEffect(() => {
    syncDesktopRail()
  }, [syncDesktopRail])

  useEffect(() => {
    syncDesktopRail()
    window.addEventListener('resize', syncDesktopRail)
    window.addEventListener('scroll', syncDesktopRail, { passive: true })
    const ro = new ResizeObserver(() => syncDesktopRail())
    const el = desktopRailRef.current
    if (el) ro.observe(el)
    const main = document.querySelector('main')
    if (main) ro.observe(main)
    return () => {
      window.removeEventListener('resize', syncDesktopRail)
      window.removeEventListener('scroll', syncDesktopRail)
      ro.disconnect()
    }
  }, [syncDesktopRail])

  const scrollToSection = useCallback((id, { updateHash = true } = {}) => {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (updateHash) {
      try {
        const base = `${window.location.pathname}${window.location.search}`
        window.history.replaceState(null, '', `${base}#${id}`)
      } catch {
        /* ignore */
      }
    }
  }, [])

  useEffect(() => {
    if (location.pathname !== '/terms') return
    const raw = location.hash?.replace(/^#/, '')
    if (!raw || !SECTION_NAV.some((s) => s.id === raw)) return
    const id = raw
    requestAnimationFrame(() => {
      scrollToSection(id, { updateHash: false })
    })
  }, [location.pathname, location.key, scrollToSection])

  useEffect(() => {
    const ids = SECTION_NAV.map((s) => s.id)
    const observers = []
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) setActiveId(id)
          })
        },
        { rootMargin: '-42% 0px -42% 0px', threshold: 0 },
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [])

  return (
    <div className="relative min-h-screen selection:bg-primary selection:text-black">
      <TermsThemeStyles />
      {/* Backgrounds in a fixed layer so overflow-hidden never wraps the TOC (sticky would break). */}
      <div className="pointer-events-none fixed inset-0 -z-[1] overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background: [
              'radial-gradient(ellipse 100% 70% at 50% 0%, rgba(19, 127, 236, 0.14) 0%, transparent 55%)',
              'radial-gradient(ellipse 80% 50% at 90% 40%, rgba(0, 243, 255, 0.06) 0%, transparent 50%)',
              'radial-gradient(ellipse 60% 50% at 10% 70%, rgba(0, 255, 65, 0.05) 0%, transparent 45%)',
              'linear-gradient(180deg, #0a0e14 0%, #080c12 50%, #06090e 100%)',
            ].join(', '),
          }}
        />
        <GravityStarsBackground
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.35]"
          starsOpacity={0.35}
          glowIntensity={6}
          movementSpeed={0.45}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        {/* Mobile / tablet: Home + section links stay under TopNav while scrolling */}
        <div className="sticky top-[4.75rem] z-[38] -mx-4 mb-8 border-b border-slate-800/90 bg-slate-950/95 py-3 backdrop-blur-md sm:-mx-6 sm:px-2 lg:hidden">
          <div className="flex flex-col gap-3 px-4 sm:px-6">
            <TermsBreadcrumb />
            <TermsSectionNav
              activeId={activeId}
              scrollToSection={scrollToSection}
              layout="mobile"
              navClassName="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            />
          </div>
        </div>

        {/* Desktop: empty rail reserves column width; TOC is fixed to rail so it never jumps while scrolling */}
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-x-12 lg:gap-y-0">
          <div
            ref={desktopRailRef}
            className="hidden min-h-px w-[240px] shrink-0 lg:block"
            aria-hidden
          />

          <article id="terms-article" className="min-w-0 max-w-3xl">
            <section
              id="acceptance"
              className="scroll-mt-[5.25rem] border-b border-slate-800/80 pb-12 pt-2"
            >
              <h2 className="mb-5 flex flex-wrap items-baseline gap-3 text-lg font-bold uppercase tracking-wide text-white sm:text-xl">
                <span className="font-mono text-sm text-slate-600">01</span>
                Acceptance of terms
              </h2>
              <div className="space-y-4 rounded-xl border border-slate-700/40 glass-card p-6 text-sm leading-relaxed text-slate-400">
                <p>
                  Welcome to <span className="font-semibold text-primary">CSarena</span>, a gamified learning platform
                  for computer science. By accessing the platform, you confirm that you have read and understood these
                  terms. Using the environment means you accept and follow them.
                </p>
                <p>
                  We may update these terms to reflect product changes, new features, or policy updates. Continued use
                  after a change means you accept the revised terms.
                </p>
              </div>
            </section>

            <section
              id="eligibility"
              className="scroll-mt-[5.25rem] border-b border-slate-800/80 py-12"
            >
              <h2 className="mb-5 flex flex-wrap items-baseline gap-3 text-lg font-bold uppercase tracking-wide text-white sm:text-xl">
                <span className="font-mono text-sm text-slate-600">02</span>
                Eligibility
              </h2>
              <div className="rounded-xl border border-slate-700/40 glass-card p-6 text-sm leading-relaxed text-slate-400">
                <p className="mb-4">Users must meet the following minimum requirements:</p>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="mt-0.5 font-mono text-secondary" aria-hidden>
                      &gt;
                    </span>
                    <span>Age must be at least 18 years old.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 font-mono text-secondary" aria-hidden>
                      &gt;
                    </span>
                    <span>Registration data must be accurate and kept up to date.</span>
                  </li>
                </ul>
              </div>
            </section>

            <section id="conduct" className="scroll-mt-[5.25rem] border-b border-slate-800/80 py-12">
              <h2 className="mb-3 flex flex-wrap items-baseline gap-3 text-lg font-bold uppercase tracking-wide text-white sm:text-xl">
                <span className="font-mono text-sm text-slate-600">03</span>
                User conduct
              </h2>
              <p className="mb-6 text-sm text-slate-500">
                Help us keep the arena fair. The following may lead to warnings, suspension, or account termination.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    title: 'No cheating',
                    body: 'External scripts, disallowed aids, or coordinated answers during graded quizzes are prohibited.',
                  },
                  {
                    title: 'Respect peers',
                    body: 'Abuse, harassment, or attempts to compromise other accounts are not allowed.',
                  },
                  {
                    title: 'System integrity',
                    body: 'Do not attack, scrape, or probe the platform in ways that harm availability or data.',
                  },
                  {
                    title: 'One identity',
                    body: 'Creating multiple accounts to manipulate rankings or rewards may be detected and reversed.',
                  },
                ].map((rule) => (
                  <div
                    key={rule.title}
                    className="rounded-xl border border-slate-700/50 bg-slate-900/35 p-5 backdrop-blur-sm transition-colors hover:border-slate-600/60"
                  >
                    <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-secondary">
                      {rule.title}
                    </h3>
                    <p className="text-[13px] leading-relaxed text-slate-500">{rule.body}</p>
                  </div>
                ))}
              </div>
            </section>

            <section
              id="intellectual"
              className="scroll-mt-[5.25rem] border-b border-slate-800/80 py-12"
            >
              <h2 className="mb-5 flex flex-wrap items-baseline gap-3 text-lg font-bold uppercase tracking-wide text-white sm:text-xl">
                <span className="font-mono text-sm text-slate-600">04</span>
                Intellectual property
              </h2>
              <div className="space-y-6 text-sm leading-relaxed text-slate-400">
                <p className="rounded-xl border border-slate-700/40 glass-card p-6">
                  Some lessons, quizzes, copy, and media are owned by{' '}
                  <span className="font-semibold text-primary">CSarena</span> or its licensors. We may also include
                  permitted third-party or educational materials.
                </p>
                <div className="rounded-xl border-l-4 border-primary bg-primary/5 p-6">
                  <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                    User submissions
                  </h3>
                  <p className="text-sm text-slate-400">
                    By submitting content or code, you grant a non-exclusive, worldwide, royalty-free license to run,
                    store, and evaluate it within the platform for learning and assessment purposes.
                  </p>
                </div>
              </div>
            </section>

            <section id="privacy" className="scroll-mt-[5.25rem] border-b border-slate-800/80 py-12">
              <h2 className="mb-5 flex flex-wrap items-baseline gap-3 text-lg font-bold uppercase tracking-wide text-white sm:text-xl">
                <span className="font-mono text-sm text-slate-600">05</span>
                Privacy
              </h2>
              <p className="rounded-xl border border-slate-700/40 glass-card p-6 text-sm leading-relaxed text-slate-400">
                We process account and activity data to run the service, personalize learning paths, and show progress.
                Details are governed by these terms and how we operate the product. By signing in, you acknowledge this
                processing as described here and in any in-product notices we provide.
              </p>
            </section>

            <section id="contact" className="scroll-mt-[5.25rem] py-12">
              <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 glass-deep p-8 sm:p-10">
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl"
                  aria-hidden
                />
                <h2 className="relative mb-2 text-xl font-bold uppercase tracking-tight text-white">Contact</h2>
                <p className="relative mb-8 max-w-lg text-sm text-slate-400">
                  Questions about your account, content, or the platform? Reach out—we typically respond within a few
                  business days.
                </p>
                <a
                  className="relative inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-6 py-3 text-xs font-bold uppercase tracking-wider text-primary transition-all hover:border-primary hover:bg-primary/15"
                  href="mailto:support@csarena.com"
                >
                  <span className="material-symbols-outlined text-[20px]" aria-hidden>
                    mail
                  </span>
                  Email support
                </a>
              </div>
            </section>

            <footer className="mt-16 border-t border-slate-800/80 pt-10 text-[10px] uppercase tracking-[0.2em] text-slate-600">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <p>© 2026 CSarena. All rights reserved.</p>
                <div className="flex flex-wrap items-center justify-center gap-6">
                  <Link className="transition-colors hover:text-primary" to="/terms">
                    Terms
                  </Link>
                  <div className="flex items-center gap-5 text-[#caff2b]">
                    <a className="transition-colors hover:text-primary" href="#" aria-label="X">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M3 4.25h3.7l5.18 6.3 5.46-6.3H21l-7.39 8.34L21.5 20h-3.7l-5.67-6.78L6.2 20H3l7.82-8.95L3 4.25z" />
                      </svg>
                    </a>
                    <a className="transition-colors hover:text-primary" href="#" aria-label="LinkedIn">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M4.98 3.5c0 1.1-.9 2-2 2s-2-.9-2-2 0-2 2-2 2 .9 2 2zM1 8h4v12H1zM8 8h3.8v1.6h.1c.5-1 1.7-2 3.6-2 3.9 0 4.6 2.5 4.6 5.8V20h-4v-5.3c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V20H8z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </article>
        </div>

        {desktopTocLeft != null && (
          <div
            className="fixed z-[38] flex w-[240px] flex-col gap-4 pt-4 [backface-visibility:hidden]"
            style={{ top: '4.75rem', left: desktopTocLeft }}
          >
            <TermsBreadcrumb className="px-0.5" />
            <div className="max-h-[calc(100vh-9.5rem)] overflow-y-auto overscroll-y-contain rounded-xl border border-slate-700/40 bg-slate-950/60 py-3 backdrop-blur-md lg:py-4">
              <p className="mb-3 flex items-center gap-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="material-symbols-outlined text-sm text-primary" aria-hidden>
                  list
                </span>
                On this page
              </p>
              <TermsSectionNav
                activeId={activeId}
                scrollToSection={scrollToSection}
                layout="desktop"
                navClassName="flex flex-col gap-1 px-2"
              />
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        className="fixed bottom-8 right-8 z-[45] flex h-12 w-12 items-center justify-center rounded-xl border border-slate-600/80 bg-slate-900/80 text-primary shadow-lg backdrop-blur-md transition-all hover:border-primary hover:bg-primary/10"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        <span className="material-symbols-outlined text-xl" aria-hidden>
          stat_1
        </span>
      </button>
    </div>
  )
}

export default Terms
