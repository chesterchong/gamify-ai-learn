import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import supabase from '../lib/supabase'
import { GravityStarsBackground } from './animate-ui/components/backgrounds/gravity-stars'
import ShinyText from './ShinyText'

function Signup() {
  const navigate = useNavigate()
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState('signup') // 'login' or 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
  const [isGitHubSubmitting, setIsGitHubSubmitting] = useState(false)
  const [authSuccess, setAuthSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
  const googleButtonRef = useRef(null)
  const googleFillRef = useRef(null)
  const githubButtonRef = useRef(null)
  const githubFillRef = useRef(null)
  const emailButtonRef = useRef(null)
  const emailFillRef = useRef(null)
  const buttonsContainerRef = useRef(null)
  const emailFormRef = useRef(null)
  const continueButtonRef = useRef(null)
  const continueFillRef = useRef(null)
  const loginToggleRef = useRef(null)
  const loginToggleFillRef = useRef(null)
  const signupToggleRef = useRef(null)
  const signupToggleFillRef = useRef(null)

  useEffect(() => {
    // Google button animation
    const googleButton = googleButtonRef.current
    const googleFill = googleFillRef.current
    const githubButton = githubButtonRef.current
    const githubFill = githubFillRef.current
    const emailButton = emailButtonRef.current
    const emailFill = emailFillRef.current

    if (googleButton && googleFill) {
      gsap.set(googleFill, { scaleX: 0, transformOrigin: 'left center' })
      const onGoogleEnter = () => {
        gsap.to(googleFill, { scaleX: 1, duration: 0.4, ease: 'power3.out' })
      }
      const onGoogleLeave = () => {
        gsap.to(googleFill, { scaleX: 0, duration: 0.3, ease: 'power3.in' })
      }
      googleButton.addEventListener('mouseenter', onGoogleEnter)
      googleButton.addEventListener('mouseleave', onGoogleLeave)

      // GitHub button animation
      if (githubButton && githubFill) {
        gsap.set(githubFill, { scaleX: 0, transformOrigin: 'left center' })
        const onGithubEnter = () => {
          gsap.to(githubFill, { scaleX: 1, duration: 0.4, ease: 'power3.out' })
        }
        const onGithubLeave = () => {
          gsap.to(githubFill, { scaleX: 0, duration: 0.3, ease: 'power3.in' })
        }
        githubButton.addEventListener('mouseenter', onGithubEnter)
        githubButton.addEventListener('mouseleave', onGithubLeave)

        // Email button animation
        if (emailButton && emailFill) {
          gsap.set(emailFill, { scaleX: 0, transformOrigin: 'left center' })
          const onEmailEnter = () => {
            gsap.to(emailFill, { scaleX: 1, duration: 0.4, ease: 'power3.out' })
          }
          const onEmailLeave = () => {
            gsap.to(emailFill, { scaleX: 0, duration: 0.3, ease: 'power3.in' })
          }
          emailButton.addEventListener('mouseenter', onEmailEnter)
          emailButton.addEventListener('mouseleave', onEmailLeave)

          return () => {
            googleButton.removeEventListener('mouseenter', onGoogleEnter)
            googleButton.removeEventListener('mouseleave', onGoogleLeave)
            githubButton.removeEventListener('mouseenter', onGithubEnter)
            githubButton.removeEventListener('mouseleave', onGithubLeave)
            emailButton.removeEventListener('mouseenter', onEmailEnter)
            emailButton.removeEventListener('mouseleave', onEmailLeave)
          }
        }
      }
    }
    return undefined
  }, [])

  useEffect(() => {
    if (showEmailForm && buttonsContainerRef.current && emailFormRef.current) {
      // Animate buttons moving up and form appearing
      gsap.fromTo(
        emailFormRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
      )
    }
  }, [showEmailForm])

  useEffect(() => {
    // Continue button animation - only set up when form is shown
    if (showEmailForm) {
      const continueButton = continueButtonRef.current
      const continueFill = continueFillRef.current
      const loginToggle = loginToggleRef.current
      const loginToggleFill = loginToggleFillRef.current
      const signupToggle = signupToggleRef.current
      const signupToggleFill = signupToggleFillRef.current

      if (continueButton && continueFill) {
        gsap.set(continueFill, { scaleX: 0, transformOrigin: 'left center' })
        const onContinueEnter = () => {
          gsap.to(continueFill, { scaleX: 1, duration: 0.4, ease: 'power3.out' })
        }
        const onContinueLeave = () => {
          gsap.to(continueFill, { scaleX: 0, duration: 0.3, ease: 'power3.in' })
        }
        continueButton.addEventListener('mouseenter', onContinueEnter)
        continueButton.addEventListener('mouseleave', onContinueLeave)

        // Login toggle button animation
        if (loginToggle && loginToggleFill) {
          gsap.set(loginToggleFill, { scaleX: 0, transformOrigin: 'left center' })
          const onLoginToggleEnter = () => {
            if (mode !== 'login') {
              gsap.to(loginToggleFill, { scaleX: 1, duration: 0.4, ease: 'power3.out' })
            }
          }
          const onLoginToggleLeave = () => {
            gsap.to(loginToggleFill, { scaleX: 0, duration: 0.3, ease: 'power3.in' })
          }
          loginToggle.addEventListener('mouseenter', onLoginToggleEnter)
          loginToggle.addEventListener('mouseleave', onLoginToggleLeave)

          // Signup toggle button animation
          if (signupToggle && signupToggleFill) {
            gsap.set(signupToggleFill, { scaleX: 0, transformOrigin: 'left center' })
            const onSignupToggleEnter = () => {
              if (mode !== 'signup') {
                gsap.to(signupToggleFill, { scaleX: 1, duration: 0.4, ease: 'power3.out' })
              }
            }
            const onSignupToggleLeave = () => {
              gsap.to(signupToggleFill, { scaleX: 0, duration: 0.3, ease: 'power3.in' })
            }
            signupToggle.addEventListener('mouseenter', onSignupToggleEnter)
            signupToggle.addEventListener('mouseleave', onSignupToggleLeave)

            return () => {
              continueButton.removeEventListener('mouseenter', onContinueEnter)
              continueButton.removeEventListener('mouseleave', onContinueLeave)
              loginToggle.removeEventListener('mouseenter', onLoginToggleEnter)
              loginToggle.removeEventListener('mouseleave', onLoginToggleLeave)
              signupToggle.removeEventListener('mouseenter', onSignupToggleEnter)
              signupToggle.removeEventListener('mouseleave', onSignupToggleLeave)
            }
          }
        }
      }
    }
    return undefined
  }, [showEmailForm, mode])

  useEffect(() => {
    let isMounted = true

    const syncSupabaseSession = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        if (isMounted) {
          setError('GitHub login failed. Please try again.')
        }
        return
      }

      const accessToken = data.session?.access_token
      if (!accessToken) {
        return
      }

      setIsSubmitting(true)
      setError('')

      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/supabase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ accessToken }),
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(payload.error || 'GitHub login failed')
        }

        await response.json()
        if (isMounted) setAuthSuccess(true)
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'GitHub login failed')
        }
      } finally {
        if (isMounted) {
          setIsSubmitting(false)
          setIsGoogleSubmitting(false)
          setIsGitHubSubmitting(false)
        }
      }
    }

    syncSupabaseSession()

    return () => {
      isMounted = false
    }
  }, [apiBaseUrl, navigate])

  useEffect(() => {
    if (!authSuccess) return
    const t = setTimeout(() => navigate('/dash'), 1800)
    return () => clearTimeout(t)
  }, [authSuccess, navigate])

  const handleGitHubLogin = async () => {
    setError('')
    setIsGitHubSubmitting(true)

    // Note: For GitHub OAuth to work, you must register Supabase's callback URL
    // in your GitHub OAuth app settings:
    // https://<your-project-id>.supabase.co/auth/v1/callback
    // This is different from the redirectTo URL below, which is where Supabase
    // redirects AFTER handling the OAuth callback.
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/signup`,
      },
    })

    if (authError) {
      setError(authError.message || 'GitHub login failed')
      setIsGitHubSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setIsGoogleSubmitting(true)

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/signup`,
      },
    })

    if (authError) {
      setError(authError.message || 'Google login failed')
      setIsGoogleSubmitting(false)
    }
  }

  const handleEmailClick = () => {
    setShowEmailForm(true)
    setMode('login')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const endpoint =
      mode === 'login' ? '/api/auth/login' : '/api/auth/register'

    try {
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error || 'Authentication failed')
      }

      await response.json()
      navigate('/dash')
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className="bg-background-dark selection:bg-primary selection:text-black relative overflow-hidden min-h-screen">
      <style>{`
        :root {
          font-family: 'JetBrains Mono', monospace;
        }
        .bg-background-dark { background-color: #05070a; }
        .bg-panel-dark { background-color: #0a0f14; }
        .text-primary { color: #00f3ff; }
        .text-secondary { color: #00ff41; }
        .border-primary { border-color: #00f3ff; }
        .border-secondary { border-color: #00ff41; }
        .bg-secondary\\/10 { background-color: rgba(0, 255, 65, 0.1); }
        .bg-background-dark\\/95 { background-color: rgba(5, 7, 10, 0.95); }
        body {
          background-color: #05070a;
          color: #94a3b8;
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
        }
        .logo-lock {
          user-select: none;
          -webkit-user-select: none;
          -ms-user-select: none;
        }
        .glass-card {
          background: rgba(10, 15, 20, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(148, 163, 184, 0.1);
        }
        @keyframes sparkle {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          25% {
            transform: scale(1.2) rotate(90deg);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.1) rotate(180deg);
            opacity: 1;
          }
          75% {
            transform: scale(1.2) rotate(270deg);
            opacity: 0.8;
          }
        }
        .sparkle-emoji {
          display: inline-block;
          animation: sparkle 2s ease-in-out infinite;
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
        .email-form-container {
          transition: all 0.4s ease-out;
        }
        .email-form {
          background: rgba(10, 15, 20, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 0.5rem;
        }
        .email-input {
          background: rgba(5, 7, 10, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.2);
          color: white;
        }
        .email-input:focus {
          outline: none;
          border-color: #00f3ff;
        }
        .email-input::placeholder {
          color: rgba(148, 163, 184, 0.5);
        }
        .password-input-wrapper {
          position: relative;
        }
        .password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: rgba(148, 163, 184, 0.6);
          transition: color 0.2s;
        }
        .password-toggle:hover {
          color: rgba(148, 163, 184, 0.9);
        }
        .password-input {
          padding-right: 2.5rem;
        }
      `}</style>

      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-background-dark/95 backdrop-blur-sm relative">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link className="flex items-center space-x-4 logo-lock" to="/">
            <div className="border border-primary px-1.5 py-0.5 text-xs text-primary font-bold">
              CORE
            </div>
            <span className="text-xl font-bold tracking-widest text-white uppercase">CSarena</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16 relative z-10 min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <GravityStarsBackground
          className="pointer-events-none absolute inset-0"
          starsOpacity={0.45}
          glowIntensity={8}
          movementSpeed={0.7}
        />

        <div className="relative max-w-md mx-auto w-full">
          {authSuccess ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-secondary bg-secondary/10 mb-4">
                <span className="material-symbols-outlined text-3xl text-secondary">check_circle</span>
              </div>
              <p className="text-lg font-semibold text-secondary">Successfully authorised</p>
              <p className="text-sm text-slate-400 mt-1">Redirecting to dashboard...</p>
            </div>
          ) : (
            <>
          <div className="text-center mb-10">
            <p className="text-base">
              <span className="sparkle-emoji">✨</span>{' '}
              <ShinyText 
                text="Your AI Learning companion" 
                color="#94a3b8"
                shineColor="#ffffff"
                speed={2}
                spread={120}
              />
            </p>
          </div>

          <div 
            ref={buttonsContainerRef}
            className={`flex flex-col gap-2 mb-8 transition-all duration-300 ease-out ${showEmailForm ? '-translate-y-4' : ''}`}
          >
            <button
              ref={googleButtonRef}
              onClick={handleGoogleLogin}
              disabled={isGoogleSubmitting}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 glass-card rounded-lg hover:border-primary border border-slate-800 transition-all text-white text-sm font-medium pill-anim disabled:opacity-60 disabled:cursor-not-allowed"
              type="button"
            >
              <span className="pill-anim-fill" ref={googleFillRef} />
              <span className="pill-anim-content flex items-center justify-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>{isGoogleSubmitting ? 'Connecting...' : 'Continue with Google'}</span>
              </span>
            </button>

            <button
              ref={githubButtonRef}
              onClick={handleGitHubLogin}
              disabled={isGitHubSubmitting}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 glass-card rounded-lg hover:border-primary border border-slate-800 transition-all text-white text-sm font-medium pill-anim disabled:opacity-60 disabled:cursor-not-allowed"
              type="button"
            >
              <span className="pill-anim-fill" ref={githubFillRef} />
              <span className="pill-anim-content flex items-center justify-center gap-2">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>{isGitHubSubmitting ? 'Connecting...' : 'Continue with GitHub'}</span>
              </span>
            </button>

            <button
              ref={emailButtonRef}
              onClick={handleEmailClick}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 glass-card rounded-lg hover:border-primary border border-slate-800 transition-all text-white text-sm font-medium pill-anim"
              type="button"
            >
              <span className="pill-anim-fill" ref={emailFillRef} />
              <span className="pill-anim-content flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg text-white">mail</span>
                <span>Continue with Email</span>
              </span>
            </button>
          </div>

          {showEmailForm && (
            <div ref={emailFormRef} className="email-form-container mb-8">
              <form className="email-form p-4 space-y-3" onSubmit={handleSubmit}>
                <div className="flex gap-2 mb-3">
                  <button
                    ref={loginToggleRef}
                    type="button"
                    className={`flex-1 border border-primary text-primary px-4 py-2 text-xs font-bold hover:bg-primary/80 hover:text-black transition-all pill-anim relative overflow-hidden ${
                      mode === 'login' ? 'bg-primary/10 shadow-md shadow-primary/40' : 'bg-transparent'
                    }`}
                    onClick={() => setMode('login')}
                  >
                    <span className="pill-anim-fill" ref={loginToggleFillRef} />
                    <span className="pill-anim-content relative z-10">Log In</span>
                  </button>
                  <button
                    ref={signupToggleRef}
                    type="button"
                    className={`flex-1 border border-primary text-primary px-4 py-2 text-xs font-bold hover:bg-primary/80 hover:text-black transition-all pill-anim relative overflow-hidden ${
                      mode === 'signup' ? 'bg-primary/10 shadow-md shadow-primary/40' : 'bg-transparent'
                    }`}
                    onClick={() => setMode('signup')}
                  >
                    <span className="pill-anim-fill" ref={signupToggleFillRef} />
                    <span className="pill-anim-content relative z-10">Sign Up</span>
                  </button>
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs text-slate-400 mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="email-input w-full px-3 py-2.5 rounded-lg text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-xs text-slate-400 mb-1.5">
                    Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="email-input password-input w-full px-3 py-2.5 rounded-lg text-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span
                      className="password-toggle material-symbols-outlined text-lg"
                      onClick={() => setShowPassword(!showPassword)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setShowPassword(!showPassword)
                        }
                      }}
                    >
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </div>
                  {mode === 'login' && (
                    <div className="flex justify-end mt-1.5">
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline transition-all"
                        onClick={() => {
                          // TODO: Implement forgot password functionality
                          console.log('Forgot password clicked')
                        }}
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>
                {error && (
                  <div className="text-xs text-red-400 font-semibold">{error}</div>
                )}
                <button
                  ref={continueButtonRef}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full border border-primary text-primary px-4 py-2 text-xs font-bold hover:bg-primary hover:text-black transition-all pill-anim relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="pill-anim-fill" ref={continueFillRef} />
                  <span className="pill-anim-content relative z-10">
                    {isSubmitting
                      ? 'Signing in...'
                      : mode === 'login'
                        ? 'Access Your Arena'
                        : 'Create Account'}
                  </span>
                </button>
              </form>
            </div>
          )}

          <div className="text-center text-xs text-slate-500">
            By continuing, you acknowledge that you understand and agree to the{' '}
            <Link className="text-primary hover:underline" to="/terms">
              Terms & Conditions
            </Link>
            .
          </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default Signup
