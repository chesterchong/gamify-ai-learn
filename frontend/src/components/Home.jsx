import { Link } from 'react-router-dom'

function Home() {
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
      `}</style>
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-background-dark/95 backdrop-blur-sm">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link className="flex items-center space-x-4 logo-lock" to="/">
            <div className="border border-primary px-1.5 py-0.5 text-xs text-primary font-bold">
              CORE
            </div>
            <span className="text-xl font-bold tracking-widest text-white uppercase">CSarena</span>
          </Link>
          <div className="flex items-center space-x-8">
            <a className="text-xs uppercase tracking-widest hover:text-primary transition-colors" href="#">
              [ Home ]
            </a>
            <a className="text-xs uppercase tracking-widest hover:text-primary transition-colors" href="#">
              [ Arena ]
            </a>
            <a className="border border-primary text-primary px-4 py-2 text-xs font-bold hover:bg-primary hover:text-black transition-all" href="#">
              DASHBOARD LOGIN
            </a>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-16" />
      <footer className="pb-16 text-[10px] text-slate-600 uppercase tracking-[0.2em] border-t border-slate-900 pt-8">
        <div className="container mx-auto px-6">
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
                <a className="hover:text-primary transition-colors" href="#" aria-label="Discord">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.3 5.3A19.5 19.5 0 0 0 16 4.3c-.2.4-.4.9-.6 1.3a18 18 0 0 0-5.8 0c-.2-.4-.4-.9-.6-1.3a19.5 19.5 0 0 0-4.3 1C2.2 9 1.5 12.7 2 16.3a19.9 19.9 0 0 0 5.9 3c.5-.6.9-1.2 1.3-1.8a12.6 12.6 0 0 1-2-1l.5-.4c3.8 1.8 8 1.8 11.8 0l.6.4c-.6.4-1.3.7-2 1 .4.6.8 1.2 1.2 1.8a19.9 19.9 0 0 0 5.9-3c.6-3.5-.1-7.2-2-11zM9.4 14.3c-.7 0-1.3-.7-1.3-1.6s.6-1.6 1.3-1.6 1.3.7 1.3 1.6-.6 1.6-1.3 1.6zm5.2 0c-.7 0-1.3-.7-1.3-1.6s.6-1.6 1.3-1.6 1.3.7 1.3 1.6-.6 1.6-1.3 1.6z" />
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
        </div>
      </footer>
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

export default Home
