import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import TopNav from './TopNav'

function Terms() {
  useEffect(() => {
    const fontHref =
      'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap'
    const fontLink = document.createElement('link')
    fontLink.rel = 'stylesheet'
    fontLink.href = fontHref
    document.head.appendChild(fontLink)

    const updateActiveLink = () => {
      const sections = document.querySelectorAll('section')
      const links = document.querySelectorAll('aside nav a')
      let current = ''
      sections.forEach((section) => {
        const sectionTop = section.offsetTop
        if (window.pageYOffset >= sectionTop - 150) {
          current = section.getAttribute('id')
        }
      })
      if (sections.length > 0) {
        const atBottom =
          window.innerHeight + window.pageYOffset >=
          document.documentElement.scrollHeight - 2
        if (atBottom) {
          current = sections[sections.length - 1].getAttribute('id')
        }
      }
      links.forEach((link) => {
        link.classList.remove('text-secondary', 'border-secondary', 'bg-secondary/10')
        link.classList.add('border-transparent')
        if (link.getAttribute('href')?.includes(current)) {
          link.classList.add('text-secondary', 'border-secondary', 'bg-secondary/10')
          link.classList.remove('border-transparent')
        }
      })
    }

    updateActiveLink()
    window.addEventListener('scroll', updateActiveLink)
    return () => {
      window.removeEventListener('scroll', updateActiveLink)
      document.head.removeChild(fontLink)
    }
  }, [])

  return (
    <div className="bg-background-dark selection:bg-primary selection:text-black">
      <style>{`
        :root {
          font-family: 'JetBrains Mono', monospace;
        }
        .bg-background-dark { background-color: #05070a; }
        .bg-panel-dark { background-color: #0a0f14; }
        .bg-accent-dark { background-color: #1a1f26; }
        .text-primary { color: #00f3ff; }
        .text-secondary { color: #00ff41; }
        .border-primary { border-color: #00f3ff; }
        .border-secondary { border-color: #00ff41; }
        .bg-secondary\\/5 { background-color: rgba(0, 255, 65, 0.05); }
        .bg-secondary\\/10 { background-color: rgba(0, 255, 65, 0.1); }
        .bg-primary\\/5 { background-color: rgba(0, 243, 255, 0.05); }
        .bg-primary\\/30 { background-color: rgba(0, 243, 255, 0.3); }
        .bg-background-dark\\/95 { background-color: rgba(5, 7, 10, 0.95); }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        body {
          background-color: #05070a;
          color: #94a3b8;
        }
        h1, h2, h3, h4, h5, h6 {
          font-weight: 700;
          color: #00f3ff;
          letter-spacing: -0.02em;
        }
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: #05070a;
        }
        ::-webkit-scrollbar-thumb {
          background: #1a1f26;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #00f3ff;
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
        }
        .logo-lock {
          user-select: none;
          -webkit-user-select: none;
          -ms-user-select: none;
        }
        section {
          border-bottom: 1px solid #0f141a;
          padding-bottom: 3rem;
        }
        section:last-child {
          border-bottom: 0;
        }
      `}</style>
      <TopNav />
      <main className="container mx-auto px-6 py-16 flex flex-col md:flex-row gap-16">
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-32">
            <nav className="space-y-0 text-xs">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center">
                <span className="material-symbols-outlined text-sm mr-2">terminal</span>
                Terms and Conditions
              </p>
              <div className="flex flex-col border-l border-slate-800">
                <a className="px-4 py-2 hover:text-primary transition-all border-l-2 border-transparent hover:border-slate-600" href="#acceptance">01 Acceptance</a>
                <a className="px-4 py-2 hover:text-primary transition-all border-l-2 border-transparent hover:border-slate-600" href="#eligibility">02 Eligibility</a>
                <a className="px-4 py-2 hover:text-primary transition-all border-l-2 border-transparent hover:border-slate-600" href="#conduct">03 User Conduct</a>
                <a className="px-4 py-2 hover:text-primary transition-all border-l-2 border-transparent hover:border-slate-600" href="#intellectual">04 IP Policy</a>
                <a className="px-4 py-2 hover:text-primary transition-all border-l-2 border-transparent hover:border-slate-600" href="#privacy">05 Privacy</a>
                <a className="px-4 py-2 hover:text-primary transition-all border-l-2 border-transparent hover:border-slate-600" href="#contact">06 Contact Admin</a>
              </div>
            </nav>
          </div>
        </aside>
        <div className="flex-1 max-w-4xl">
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white uppercase tracking-tight">Terms and Conditions</h1>
            <div className="inline-flex items-center text-[10px] text-secondary border border-secondary/30 px-3 py-1 bg-secondary/5">
              <span className="material-symbols-outlined text-xs mr-2">history</span>
              LAST UPDATE: 2026.02.08
            </div>
          </div>
          <article className="space-y-16">
            <section className="scroll-mt-32" id="acceptance">
              <h2 className="text-xl font-bold mb-6 flex items-center uppercase">
                <span className="text-slate-700 mr-4">01</span> Acceptance of Terms
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-slate-400">
                <p>
                  Welcome to <span className="text-primary">CSarena</span>, a gamified learning platform for Computer Science. By accessing the platform, you confirm that you have read and understood these terms. Use of the environment means you accept and follow them.
                </p>
                <p>
                  We may update these terms to reflect product changes, new features, or policy updates. Continued use after a change means you accept the revised terms.
                </p>
              </div>
            </section>
            <section className="scroll-mt-32" id="eligibility">
              <h2 className="text-xl font-bold mb-6 flex items-center uppercase">
                <span className="text-slate-700 mr-4">02</span> Eligibility Checks
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-slate-400">
                <p>Users must meet the following minimum requirements to access the system:</p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-secondary mr-3">&gt;</span>
                    Age must be at least 18 years old.
                  </li>
                  <li className="flex items-start">
                    <span className="text-secondary mr-3">&gt;</span>
                    Registration data must be accurate and kept up to date.
                  </li>
                </ul>
              </div>
            </section>
            <section className="scroll-mt-32" id="conduct">
              <h2 className="text-xl font-bold mb-6 flex items-center uppercase">
                <span className="text-slate-700 mr-4">03</span> User Conduct Rules
              </h2>
              <p className="text-sm text-slate-400 mb-8">Maintain system integrity. The following actions result in immediate enforcement:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-slate-800 border border-slate-800">
                <div className="p-6 bg-panel-dark">
                  <h4 className="font-bold text-xs mb-3 text-secondary uppercase tracking-widest">NO CHEATING</h4>
                  <p className="text-[12px] text-slate-500">External scripts, AI-generated answers, or multi-user collaboration during active quizzes are prohibited.</p>
                </div>
                <div className="p-6 bg-panel-dark">
                  <h4 className="font-bold text-xs mb-3 text-secondary uppercase tracking-widest">RESPECT PEERS</h4>
                  <p className="text-[12px] text-slate-500">Abuse, harassment, or social engineering of other users will result in session termination.</p>
                </div>
                <div className="p-6 bg-panel-dark">
                  <h4 className="font-bold text-xs mb-3 text-secondary uppercase tracking-widest">SYSTEM INTEGRITY</h4>
                  <p className="text-[12px] text-slate-500">Do not attempt DDoS, scraping, or system-level exploits against the platform or quiz systems.</p>
                </div>
                <div className="p-6 bg-panel-dark">
                  <h4 className="font-bold text-xs mb-3 text-secondary uppercase tracking-widest">UNIQUE IDS</h4>
                  <p className="text-[12px] text-slate-500">Smurfing or sybil attacks via multiple accounts are detected and logged.</p>
                </div>
              </div>
            </section>
            <section className="scroll-mt-32" id="intellectual">
              <h2 className="text-xl font-bold mb-6 flex items-center uppercase">
                <span className="text-slate-700 mr-4">04</span> IP Assets
              </h2>
              <div className="space-y-6 text-sm leading-relaxed text-slate-400">
                <p>Some lessons, quizzes, editorials, and binary assets are proprietary to <span className="text-primary">CSarena</span> or its licensors. We also use fair use materials and school-provided resources where permitted.</p>
                <div className="border-l border-primary p-6 bg-primary/5">
                  <h4 className="text-primary text-xs font-bold mb-2 uppercase tracking-widest">User Submissions License</h4>
                  <p className="text-xs text-slate-400">
                    By submitting content or code, you grant a non-exclusive, worldwide, royalty-free license to run and evaluate your logic within the platform environment.
                  </p>
                </div>
              </div>
            </section>
            <section className="scroll-mt-32" id="privacy">
              <h2 className="text-xl font-bold mb-6 flex items-center uppercase">
                <span className="text-slate-700 mr-4">05</span> Privacy Protocol
              </h2>
              <p className="text-sm leading-relaxed text-slate-400">
                Data ingestion and processing support personalized learning, mastery tracking, and progress analytics. This follows our <a className="text-primary hover:bg-primary hover:text-black px-1 transition-all" href="#">[ Terms and Conditions ]</a>. Consent is implied upon login.
              </p>
            </section>
            <section className="scroll-mt-32 border-t border-slate-900 pt-16" id="contact">
              <div className="border border-slate-800 p-8 bg-panel-dark">
                <h2 className="text-xl font-bold mb-4 text-white uppercase tracking-tight">Contact Us</h2>
                <p className="text-sm text-slate-500 mb-8 max-w-xl">
                  Open a support ticket for account, content, or platform inquiries. Typical response time is within 5 business days.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a className="inline-flex items-center px-6 py-3 border border-slate-700 text-slate-400 text-xs font-bold uppercase hover:border-primary hover:text-primary transition-all" href="mailto:support@csarena.com">
                    <span className="material-symbols-outlined mr-2 text-sm">mail</span>
                    SEND EMAIL
                  </a>
                </div>
              </div>
            </section>
          </article>
          <footer className="mt-32 pb-16 text-[10px] text-slate-600 uppercase tracking-[0.2em] border-t border-slate-900 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p>© 2026 CSARENA. ALL RIGHTS RESERVED.</p>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex items-center gap-6">
                  <a className="hover:text-primary" href="#">About Us</a>
                  <a className="hover:text-primary" href="#">Career</a>
                  <Link className="hover:text-primary" to="/terms">
                    Terms
                  </Link>
                </div>
                <div className="flex items-center gap-6 text-[#caff2b]">
                  <a className="hover:text-primary transition-colors" href="#" aria-label="X">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M3 4.25h3.7l5.18 6.3 5.46-6.3H21l-7.39 8.34L21.5 20h-3.7l-5.67-6.78L6.2 20H3l7.82-8.95L3 4.25z" />
                    </svg>
                  </a>
                  <a className="hover:text-primary transition-colors" href="#" aria-label="LinkedIn">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M4.98 3.5c0 1.1-.9 2-2 2s-2-.9-2-2 0-2 2-2 2 .9 2 2zM1 8h4v12H1zM8 8h3.8v1.6h.1c.5-1 1.7-2 3.6-2 3.9 0 4.6 2.5 4.6 5.8V20h-4v-5.3c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V20H8z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </main>
      <button
        className="fixed bottom-8 right-8 w-12 h-12 border border-primary bg-background-dark text-primary flex items-center justify-center hover:bg-primary hover:text-black transition-all group"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        type="button"
      >
        <span className="material-symbols-outlined text-xl">stat_1</span>
      </button>
    </div>
  )
}

export default Terms
