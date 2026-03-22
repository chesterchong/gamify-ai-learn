import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GravityStarsBackground } from './animate-ui/components/backgrounds/gravity-stars'
import GradientText from './GradientText'
import ShinyText from './ShinyText'
import { getApiBaseUrl } from '../lib/apiBaseUrl.js'

function Home() {
  // Only show Get Started when we've confirmed the user is not logged in (avoids flash)
  const [authStatus, setAuthStatus] = useState('idle') // 'idle' | 'authenticated' | 'unauthenticated'
  const apiBaseUrl = getApiBaseUrl()

  useEffect(() => {
    let isMounted = true
    const checkAuth = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/auth/me`, { credentials: 'include' })
        if (isMounted) setAuthStatus(res.ok ? 'authenticated' : 'unauthenticated')
      } catch {
        if (isMounted) setAuthStatus('unauthenticated')
      }
    }
    checkAuth()
    return () => { isMounted = false }
  }, [apiBaseUrl])

  return (
    <div className="selection:bg-primary selection:text-black relative overflow-hidden min-h-screen bg-[#030a12]">
      {/* Nebula + aurora wave light (from home-sample) */}
      <div
        className="fixed inset-0 -z-[2]"
        style={{
          background: [
            'radial-gradient(ellipse 100% 80% at 50% 20%, rgba(15, 30, 50, 0.5) 0%, transparent 50%)',
            'radial-gradient(ellipse 80% 60% at 80% 60%, rgba(10, 25, 45, 0.4) 0%, transparent 45%)',
            'radial-gradient(ellipse 70% 70% at 20% 80%, rgba(20, 35, 55, 0.35) 0%, transparent 45%)',
            'linear-gradient(180deg, #030a12 0%, #050b14 50%, #030a12 100%)',
          ].join(', '),
          filter: 'brightness(0.85) contrast(1.08)',
        }}
        aria-hidden
      />
      <div
        className="fixed inset-0 -z-[1] pointer-events-none"
        style={{
          background: [
            'radial-gradient(circle at 80% 20%, rgba(0, 242, 255, 0.07) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.06) 0%, transparent 50%)',
          ].join(', '),
        }}
        aria-hidden
      />
      <style>{`
        :root {
          font-family: 'JetBrains Mono', monospace;
        }
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&display=swap');
        .bg-background-dark { background-color: #05070a; }
        .bg-panel-dark { background-color: #0a0f14; }
        .bg-accent-dark { background-color: #1a1f26; }
        .text-primary { color: #00f3ff; }
        .text-secondary { color: #00ff41; }
        .border-primary { border-color: #00f3ff; }
        .border-secondary { border-color: #00ff41; }
        .bg-accent-lime { background-color: #d9f99d; }
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
        .hero-serif {
          font-family: 'Cormorant Garamond', serif;
        }
        @keyframes hero-fade-up {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .hero-fade-up {
          animation: hero-fade-up 0.9s ease-out both;
        }
        .hero-fade-up-delay {
          animation: hero-fade-up 0.9s ease-out both;
          animation-delay: 0.15s;
        }
        .pill-anim {
          position: relative;
          overflow: hidden;
        }
        .pill-anim-fill {
          position: absolute;
          inset: 0;
          background: rgba(0, 243, 255, 0.12);
          z-index: 0;
          pointer-events: none;
        }
        .pill-anim-content {
          position: relative;
          z-index: 1;
        }
        @keyframes hero-pill-fade {
          from {
            opacity: 0;
            transform: translateX(-16px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .hero-pill-animate {
          animation: hero-pill-fade 0.9s ease-out both;
        }
        .glass-card {
          background: rgba(15, 23, 42, 0.35);
          border: 1px solid rgba(148, 163, 184, 0.2);
          backdrop-filter: blur(12px);
        }
      `}</style>
      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee {
          overflow: hidden;
          mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
        }
        .marquee-track {
          display: flex;
          gap: 1rem;
          width: max-content;
          animation: marquee-scroll 30s linear infinite;
        }
        .marquee-item {
          min-width: 220px;
          padding: 0.25rem 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-size: 14px;
          color: #cbd5f5;
          opacity: 0.4;
          filter: grayscale(1);
          transition: opacity 0.4s ease, filter 0.4s ease;
        }
        .marquee-item:hover {
          opacity: 1;
          filter: grayscale(0);
        }
        .hero-glass-card {
          background: rgba(15, 23, 42, 0.18);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        }
        .hero-glass-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }
        .hero-glass-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(0, 242, 255, 0.5);
        }
        .hero-cyan-glow {
          color: #00f2ff;
        }
        .hero-cyan-text-glow {
          text-shadow: 0 0 20px rgba(0, 242, 255, 0.25);
        }
      `}</style>
      <main className="container mx-auto px-6 py-16 relative z-10 flex flex-col items-center">
        <div className="relative min-h-[60vh] w-full max-w-5xl">
          <GravityStarsBackground
            className="pointer-events-none absolute inset-0"
            starsOpacity={0.45}
            glowIntensity={8}
            movementSpeed={0.7}
          />
          <div className="relative z-10 mt-6 flex flex-col items-center">
            <Link
              className="hero-glass-btn mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs text-gray-300 border-white/10 hero-pill-animate"
              to="/terms"
              aria-label="Generative AI mastery path now live"
            >
              <span className="hero-cyan-glow" aria-hidden="true">
                <span className="material-symbols-outlined text-[14px]">campaign</span>
              </span>
              <GradientText className="text-xs font-medium" animationSpeed={6}>
                Generative AI mastery path now live
              </GradientText>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
            </Link>
            <section
              className="hero-glass-card w-full max-w-3xl px-8 py-10 md:px-12 md:py-14 rounded-3xl relative overflow-hidden hero-fade-up"
              aria-labelledby="hero-title"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 blur-[80px] pointer-events-none" aria-hidden />
              <div className="relative z-10">
                <h1 id="hero-title" className="text-4xl md:text-5xl font-semibold tracking-tight hero-cyan-glow mb-6 hero-cyan-text-glow">
                  CSarena
                </h1>
                <h2 className="text-2xl md:text-4xl font-light text-white tracking-tight leading-snug mb-8">
                  Master the <span className="italic hero-cyan-glow font-medium text-inherit">Machine</span> Intelligence
                </h2>
                <p className="text-base md:text-lg text-white/80 max-w-xl mb-10 leading-loose">
                  The gamified path to frontier AI and Computer Science. Embark on quests, conquer algorithms, and level up with verifiable skills.
                </p>
                {authStatus === 'unauthenticated' && (
                  <Link
                    className="hero-glass-btn inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white/10 hover:bg-cyan-500/10 transition-all group border-cyan-500/20 shadow-lg shadow-cyan-900/20 text-base font-medium"
                    to="/signup"
                  >
                    <span className="material-symbols-outlined text-white group-hover:text-[#00f2ff] transition-colors" aria-hidden>
                      rocket_launch
                    </span>
                    <ShinyText
                      text="Get Started"
                      color="#e2e8f0"
                      shineColor="#00f2ff"
                      speed={2.5}
                      spread={100}
                      className="font-semibold"
                    />
                  </Link>
                )}
              </div>
            </section>
          </div>
          <div className="relative z-10 mt-16 w-full">
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mb-4 text-center">
              Trusted By
            </p>
            <div className="marquee">
              <div className="marquee-track">
                <div className="marquee-item">
                  <span className="material-symbols-outlined text-2xl">school</span>
                  <span className="font-bold text-lg">UM</span>
                </div>
                <div className="marquee-item">
                  <span className="material-symbols-outlined text-2xl">school</span>
                  <span className="font-bold text-lg">Monash</span>
                </div>
                <div className="marquee-item">
                  <span className="material-symbols-outlined text-2xl">school</span>
                  <span className="font-bold text-lg">TARUMT</span>
                </div>
                <div className="marquee-item">
                  <span className="material-symbols-outlined text-2xl">school</span>
                  <span className="font-bold text-lg">UPM</span>
                </div>
                <div className="marquee-item">
                  <span className="material-symbols-outlined text-2xl">school</span>
                  <span className="font-bold text-lg">UTAR</span>
                </div>
                <div className="marquee-item">
                  <span className="material-symbols-outlined text-2xl">school</span>
                  <span className="font-bold text-lg">UM</span>
                </div>
                <div className="marquee-item">
                  <span className="material-symbols-outlined text-2xl">school</span>
                  <span className="font-bold text-lg">Monash</span>
                </div>
                <div className="marquee-item">
                  <span className="material-symbols-outlined text-2xl">school</span>
                  <span className="font-bold text-lg">TARUMT</span>
                </div>
                <div className="marquee-item">
                  <span className="material-symbols-outlined text-2xl">school</span>
                  <span className="font-bold text-lg">UPM</span>
                </div>
                <div className="marquee-item">
                  <span className="material-symbols-outlined text-2xl">school</span>
                  <span className="font-bold text-lg">UTAR</span>
                </div>
                <div className="marquee-item" aria-hidden="true">
                  <span className="material-symbols-outlined text-2xl">school</span>
                  <span className="font-bold text-lg">UM</span>
                </div>
                <div className="marquee-item" aria-hidden="true">
                  <span className="material-symbols-outlined text-2xl">school</span>
                  <span className="font-bold text-lg">Monash</span>
                </div>
                <div className="marquee-item" aria-hidden="true">
                  <span className="material-symbols-outlined text-2xl">school</span>
                  <span className="font-bold text-lg">TARUMT</span>
                </div>
                <div className="marquee-item" aria-hidden="true">
                  <span className="material-symbols-outlined text-2xl">school</span>
                  <span className="font-bold text-lg">UPM</span>
                </div>
                <div className="marquee-item" aria-hidden="true">
                  <span className="material-symbols-outlined text-2xl">school</span>
                  <span className="font-bold text-lg">UTAR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="pb-16 text-[10px] text-slate-600 uppercase tracking-[0.2em] border-t border-slate-900 pt-8 relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© 2026 CSARENA. ALL RIGHTS RESERVED.</p>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center gap-6">
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
