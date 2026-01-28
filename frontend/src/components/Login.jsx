import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import supabase from '../lib/supabase'

function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGitHubSubmitting, setIsGitHubSubmitting] = useState(false)
  const [error, setError] = useState('')

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'

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
        navigate('/dashboard')
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'GitHub login failed')
        }
      } finally {
        if (isMounted) {
          setIsSubmitting(false)
          setIsGitHubSubmitting(false)
        }
      }
    }

    syncSupabaseSession()

    return () => {
      isMounted = false
    }
  }, [apiBaseUrl, navigate])

  const handleGitHubLogin = async () => {
    setError('')
    setIsGitHubSubmitting(true)

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    })

    if (authError) {
      setError(authError.message || 'GitHub login failed')
      setIsGitHubSubmitting(false)
    }
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
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-screen flex w-full overflow-hidden">
      <div className="hidden lg:flex w-1/2 relative bg-primary flex-col justify-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        ></div>
        <div className="absolute top-[-20%] right-[-20%] w-[800px] h-[800px] bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 px-10 py-8 flex flex-col h-full justify-center gap-6">
          <div>
            <div className="flex items-center gap-3 text-white">
              <div className="size-8 bg-white rounded-lg flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">
                  code_blocks
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">CSarena</h2>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="relative w-full aspect-[16/10] bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden shadow-2xl p-4 flex flex-col items-center justify-center group">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-80"
                data-alt="Futuristic cybersecurity interface with glowing blue code nodes"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBXAH2QYZwOZtZLPi0CX3UGHEqwDQbR4xTkt5mPuMX7PCfIPChGIyWTOpOPJrjwvVifGZ6sTF35nRb-cT7vORS90Pb_6EpvMBSTLMns5di-A3xhwrKJpvd_jHqDqg3DXW0urrmee_oYcRr3x8mmQRRN1Q0Cfw37X6gvsidAmrPMmWXAXDrj6SXTOPb0C_poZOuZ3ol-FZ73Dt6DTZcY-vlzAQffz6tEEy4WcvlgnjogTMQhchTT24LLuG2MoT_TXKVNbXkqyzC7SY3L')",
                }}
              ></div>
              <div className="absolute top-3 right-3 bg-green-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                <span className="material-symbols-outlined text-[16px]">
                  bolt
                </span>
                <span>Daily Streak: 12</span>
              </div>
              <div className="relative z-10 text-center">
                <h3 className="text-2xl font-black text-white leading-tight mb-2 drop-shadow-md">
                  Sharpen Your Algorithmic Edge
                </h3>
                <p className="text-blue-100 font-medium text-base">
                  Join elite programmers in competitive problem-solving
                </p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="flex gap-1 text-yellow-400 mb-2">
                <span className="material-symbols-outlined text-[18px] fill-1">
                  star
                </span>
                <span className="material-symbols-outlined text-[18px] fill-1">
                  star
                </span>
                <span className="material-symbols-outlined text-[18px] fill-1">
                  star
                </span>
                <span className="material-symbols-outlined text-[18px] fill-1">
                  star
                </span>
                <span className="material-symbols-outlined text-[18px] fill-1">
                  star
                </span>
              </div>
              <p className="text-white text-base font-medium leading-relaxed mb-3">
                "The rigorous problems here transformed my problem-solving
                abilities. Essential for any serious coder!"
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="size-9 rounded-full bg-white/20 overflow-hidden bg-cover bg-center"
                  data-alt="Portrait of associate professor from INTI International University"
                  style={{
                    backgroundImage:
                      "url('https://media.licdn.com/dms/image/v2/D5603AQHpDqEC--S3QA/profile-displayphoto-crop_800_800/B56ZpMXdOiI4AI-/0/1762217814120?e=1770854400&v=beta&t=1O6lDyYj-yvG-bDaGR0-dO6hmE9mh9pt1coHdT3XkYY')",
                  }}
                ></div>
                <div>
                  <p className="text-white font-bold text-sm">
                    Dr. Tin Tin Ting
                  </p>
                  <p className="text-blue-200 text-xs">
                    Associate Professor, INTI International (Alumnus)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 lg:px-10 py-6">
        <div className="max-w-[400px] w-full flex flex-col gap-4">
          <div className="lg:hidden flex justify-center mb-2">
            <div className="flex items-center gap-3 text-primary">
              <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">
                  code_blocks
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#111418] dark:text-white">
                CSarena
              </h2>
            </div>
          </div>
          <div className="text-center lg:text-left space-y-1">
            <h1 className="text-[#111418] dark:text-white text-2xl font-bold leading-tight tracking-tight">
              Master Advanced Algorithms
            </h1>
            <p className="text-[#617589] dark:text-slate-400 text-sm">
              Log in to conquer new challenges and track your elite progress
            </p>
          </div>
          <div className="flex p-1 bg-[#f0f2f4] dark:bg-slate-800 rounded-lg">
            <button
              className={`flex-1 py-2 px-3 rounded-md text-xs font-bold transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-[#111418] dark:text-white'
                  : 'text-[#617589] dark:text-slate-400 hover:text-[#111418] dark:hover:text-white'
              }`}
              type="button"
              onClick={() => setMode('login')}
            >
              Log In
            </button>
            <button
              className={`flex-1 py-2 px-3 rounded-md text-xs font-bold transition-all duration-200 ${
                mode === 'signup'
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-[#111418] dark:text-white'
                  : 'text-[#617589] dark:text-slate-400 hover:text-[#111418] dark:hover:text-white'
              }`}
              type="button"
              onClick={() => setMode('signup')}
            >
              Sign Up
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              className="flex items-center justify-center gap-2 h-10 px-3 rounded-lg border border-[#dbe0e6] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-800 text-[#111418] dark:text-white font-bold text-xs disabled:opacity-60 disabled:cursor-not-allowed"
              type="button"
              onClick={handleGitHubLogin}
              disabled={isGitHubSubmitting}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
              </svg>
              <span>{isGitHubSubmitting ? 'Connecting...' : 'GitHub'}</span>
            </button>
            <button className="flex items-center justify-center gap-2 h-10 px-3 rounded-lg border border-[#dbe0e6] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-800 text-[#111418] dark:text-white font-bold text-xs">
              <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                ></path>
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                ></path>
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                  fill="#FBBC05"
                ></path>
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                ></path>
              </svg>
              <span>Google</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-px bg-[#dbe0e6] dark:bg-slate-700 flex-1"></div>
            <span className="text-[#617589] dark:text-slate-500 text-xs font-medium">
              Or continue with email
            </span>
            <div className="h-px bg-[#dbe0e6] dark:bg-slate-700 flex-1"></div>
          </div>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2">
              <span className="text-[#111418] dark:text-slate-200 text-xs font-bold">
                Email
              </span>
              <div className="relative">
                <input
                  className="w-full h-10 rounded-lg border border-[#dbe0e6] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#111418] dark:text-white px-3 pl-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-[#617589] dark:placeholder:text-slate-500 text-sm"
                  placeholder="student@university.edu"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#617589] dark:text-slate-500">
                  mail
                </span>
                <span className="material-symbols-outlined absolute right-3 top-3 text-green-500 hidden">
                  check_circle
                </span>
              </div>
            </label>
            <label className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[#111418] dark:text-slate-200 text-xs font-bold">
                  Password
                </span>
              </div>
              <div className="relative">
                <input
                  className="w-full h-10 rounded-lg border border-[#dbe0e6] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#111418] dark:text-white px-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-[#617589] dark:placeholder:text-slate-500 text-sm"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#617589] dark:text-slate-500">
                  lock
                </span>
                <button
                  className="absolute right-3 top-2.5 text-[#617589] dark:text-slate-500 hover:text-primary transition-colors"
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <div className="flex justify-end">
                <a className="text-primary text-xs font-bold hover:underline" href="#">
                  Forgot?
                </a>
              </div>
            </label>
            {error ? (
              <div className="text-xs text-red-500 font-semibold">{error}</div>
            ) : null}
            <button
              className="mt-1 flex w-full cursor-pointer items-center justify-center rounded-lg h-10 bg-primary hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Signing in...'
                : mode === 'login'
                  ? 'Access Your Arena'
                  : 'Create Account'}
            </button>
          </form>
          <div className="pt-4 border-t border-[#f0f2f4] dark:border-slate-800 flex flex-col items-center gap-3">
            <p className="text-[11px] text-[#617589] dark:text-slate-500 font-medium">
              PREFERRED BY TOP PERFORMERS FROM
            </p>
            <div className="flex gap-5 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
              <div className="flex items-center gap-1 font-serif text-slate-800 dark:text-slate-300 font-bold text-base">
                <span className="material-symbols-outlined text-[18px]">
                  school
                </span>
                NUS
              </div>
              <div className="flex items-center gap-1 font-serif text-slate-800 dark:text-slate-300 font-bold text-base">
                <span className="material-symbols-outlined text-[18px]">
                  school
                </span>
                UM
              </div>
              <div className="flex items-center gap-1 font-serif text-slate-800 dark:text-slate-300 font-bold text-base">
                <span className="material-symbols-outlined text-[18px]">
                  school
                </span>
                Monash
              </div>
            </div>
          </div>
          <p className="text-center text-[11px] text-[#9aa6b2] dark:text-slate-600 mt-3">
            By clicking "Access Your Arena", you agree to our{' '}
            <Link className="underline hover:text-primary" to="/terms">
              Terms of Service
            </Link>{' '}
            and{' '}
            <a className="underline hover:text-primary" href="#">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
