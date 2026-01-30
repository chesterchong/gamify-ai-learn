import { Link } from 'react-router-dom'
import { GravityStarsBackground } from './animate-ui/components/backgrounds/gravity-stars'
import GradientText from './GradientText'

function Home() {
  return (
    <div className="bg-background-dark selection:bg-primary selection:text-black relative overflow-hidden">
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
      `}</style>
      <main className="container mx-auto px-6 py-16 relative z-10">
        <div className="relative min-h-[60vh]">
          <GravityStarsBackground
            className="pointer-events-none absolute inset-0"
            starsOpacity={0.45}
            glowIntensity={8}
            movementSpeed={0.7}
          />
          <div className="relative z-10 mt-6">
            <div className="max-w-3xl hero-fade-up">
              <Link className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/5 border border-slate-700/60 mb-8 transition-transform hover:scale-105 cursor-pointer hero-pill-animate" to="/terms">
                <span className="border border-primary text-primary text-[10px] font-bold px-2 py-0.5 rounded-full transition-all hover:bg-primary hover:text-slate-900">NEW</span>
                <GradientText className="text-xs font-medium text-slate-300" animationSpeed={6}>
                  Generative AI mastery path now live
                </GradientText>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
              </Link>
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6 hero-serif">
                <span className="text-primary">CSarena</span>
                <br />
                <span className="text-white text-3xl lg:text-5xl">Master the</span>{' '}
                <span className="italic font-light text-3xl lg:text-5xl">Machine</span>{' '}
                <span className="text-white text-3xl lg:text-5xl">Intelligence</span>
              </h1>
              <p className="text-lg text-white mb-10 max-w-lg leading-relaxed hero-serif">
                The gamified path to frontier AI and Computer Science. Embark on quests, conquer algorithms, and level up with verifiable skills.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  className="px-8 py-4 bg-accent-lime text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(217,249,157,0.4)] transition-all hover:-translate-y-1 hero-fade-up-delay"
                  to="/signup"
                >
                  <span className="material-symbols-outlined">rocket_launch</span>
                  Get Started
                </Link>
              </div>
            </div>
          </div>
          <div className="relative z-10 mt-16">
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
