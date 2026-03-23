import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import TermsThemeStyles from './TermsThemeStyles'
import { formatPageTitle } from '../lib/documentTitle.js'
import { formatEstimatedQuizTime, shuffleDisplayPermutation } from '../lib/quizRunUtils.js'
import { getApiBaseUrl } from '../lib/apiBaseUrl.js'
import { validateSocraticHighlight } from '../lib/socraticHighlightRules.js'

/**
 * Desktop quiz row uses lg:h-[calc(100dvh-13.5rem)]:
 * - TopNav ≈ 4.75rem (pt-3 + h-14 + pb-2 in TopNav.jsx)
 * - Above row: py-10 top 2.5rem + back pill ~2.5rem + mb-8 2rem ≈ 6.75rem
 * - Below row: py-10 bottom 2.5rem
 * Total ≈ 13.5rem (see AppLayout main min-h using 4.75rem for nav)
 */

function formatAttemptWhen(d) {
  try {
    return new Date(d).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return ''
  }
}

function QuizAiRun() {
  const { collectionId } = useParams()
  const [play, setPlay] = useState(null)
  const [prepared, setPrepared] = useState(null)
  const [selections, setSelections] = useState({})
  const [loadError, setLoadError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitPayload, setSubmitPayload] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [attemptKey, setAttemptKey] = useState(0)
  const [attemptHistory, setAttemptHistory] = useState([])
  const [flagged, setFlagged] = useState({})
  const [activeQuestionId, setActiveQuestionId] = useState(null)
  const questionRefs = useRef({})
  const mainScrollRef = useRef(null)
  const selectableRootRef = useRef(null)
  const apiBaseUrl = getApiBaseUrl()

  const [socraticPhase, setSocraticPhase] = useState(
    /** @type {'idle'|'confirm_hint'|'loading_keywords'|'keywords'|'loading_explain'|'explain'} */ ('idle'),
  )
  const [socraticHighlight, setSocraticHighlight] = useState('')
  const [socraticQuestionId, setSocraticQuestionId] = useState(null)
  const [socraticKeywords, setSocraticKeywords] = useState(null)
  const [socraticSourceFile, setSocraticSourceFile] = useState(null)
  const [socraticExplanation, setSocraticExplanation] = useState(null)
  const [socraticError, setSocraticError] = useState('')
  const [socraticFeedbackOpen, setSocraticFeedbackOpen] = useState(false)
  const [socraticFeedbackText, setSocraticFeedbackText] = useState('')
  const [socraticFeedbackSending, setSocraticFeedbackSending] = useState(false)
  const [socraticVoteThanks, setSocraticVoteThanks] = useState(
    /** @type {null | 'upvote' | 'downvote' | 'feedback'} */ (null),
  )
  const [socraticVoteError, setSocraticVoteError] = useState('')

  const socraticFeedbackContext = useMemo(
    () => ({
      phase: socraticPhase,
      highlightedText: socraticHighlight || null,
      questionId: socraticQuestionId,
      keywords: socraticKeywords,
      sourceFile: socraticSourceFile,
      explanationPreview: socraticExplanation
        ? socraticExplanation.slice(0, 800)
        : null,
    }),
    [
      socraticPhase,
      socraticHighlight,
      socraticQuestionId,
      socraticKeywords,
      socraticSourceFile,
      socraticExplanation,
    ],
  )

  const loadHistory = useCallback(async () => {
    if (!collectionId) return
    try {
      const res = await fetch(
        `${apiBaseUrl}/api/quiz/ai-collections/${collectionId}/my-submissions`,
        { credentials: 'include' },
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return
      setAttemptHistory(Array.isArray(data.attempts) ? data.attempts : [])
    } catch {
      setAttemptHistory([])
    }
  }, [apiBaseUrl, collectionId])

  useEffect(() => {
    let m = true
    ;(async () => {
      try {
        await fetch(`${apiBaseUrl}/api/auth/me`, { credentials: 'include' })
      } finally {
        if (m) setAuthReady(true)
      }
    })()
    return () => {
      m = false
    }
  }, [apiBaseUrl])

  useEffect(() => {
    if (!authReady || !collectionId) return
    loadHistory()
  }, [authReady, collectionId, loadHistory])

  useEffect(() => {
    if (!authReady || !collectionId) return
    let m = true
    setLoadError('')
    setPlay(null)
    setPrepared(null)
    setSelections({})
    setSubmitted(false)
    setSubmitPayload(null)
    setSubmitError('')
    setAttemptKey(0)
    ;(async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/quiz/ai-collections/${collectionId}/play`, {
          credentials: 'include',
        })
        const data = await res.json().catch(() => ({}))
        if (!m) return
        if (!res.ok) {
          setLoadError(data.error || `Load failed (${res.status})`)
          return
        }
        setPlay(data)
      } catch {
        if (m) setLoadError('Network error')
      }
    })()
    return () => {
      m = false
    }
  }, [apiBaseUrl, authReady, collectionId])

  useEffect(() => {
    if (!play?.questions?.length) {
      setPrepared(null)
      return
    }
    const next = play.questions.map((q) => {
      const choices = Array.isArray(q.choices) ? [...q.choices] : []
      const n = choices.length
      const displayToOriginal = shuffleDisplayPermutation(n)
      const displayChoices = displayToOriginal.map((origIdx) => choices[origIdx])
      return {
        questionId: q.id,
        stem: q.stem,
        displayChoices,
        displayToOriginal,
      }
    })
    setPrepared(next)
    setSelections({})
    setFlagged({})
    setActiveQuestionId(null)
  }, [play, attemptKey])

  useEffect(() => {
    if (!prepared?.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        let bestId = null
        let bestRatio = 0
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const id = e.target.getAttribute('data-qid')
          if (!id) continue
          if (e.intersectionRatio >= bestRatio) {
            bestRatio = e.intersectionRatio
            bestId = id
          }
        }
        if (bestId) setActiveQuestionId(bestId)
      },
      { root: null, rootMargin: '-12% 0px -55% 0px', threshold: [0, 0.15, 0.35, 0.55, 0.75, 1] },
    )
    const ids = prepared.map((p) => p.questionId)
    requestAnimationFrame(() => {
      for (const id of ids) {
        const el = questionRefs.current[id]
        if (el) observer.observe(el)
      }
    })
    return () => observer.disconnect()
  }, [prepared])

  useEffect(() => {
    document.title = play?.title
      ? formatPageTitle(play.title)
      : formatPageTitle('Take quiz')
  }, [play?.title, collectionId])

  const allAnswered = useMemo(() => {
    if (!prepared?.length) return false
    return prepared.every((p) => typeof selections[p.questionId] === 'number')
  }, [prepared, selections])

  const resultsByQuestionId = useMemo(() => {
    if (!submitPayload?.results) return new Map()
    return new Map(submitPayload.results.map((r) => [r.questionId, r]))
  }, [submitPayload])

  const setChoice = useCallback((questionId, displayIndex) => {
    if (submitted) return
    setSelections((prev) => ({ ...prev, [questionId]: displayIndex }))
  }, [submitted])

  const scrollToQuestion = useCallback((questionId) => {
    setActiveQuestionId(questionId)
    const el = questionRefs.current[questionId]
    if (!el) return

    const scroller = mainScrollRef.current
    const pad = 12
    const innerScrolls = scroller && scroller.scrollHeight > scroller.clientHeight + 2

    if (innerScrolls) {
      const c = scroller.getBoundingClientRect()
      const e = el.getBoundingClientRect()
      const nextTop = scroller.scrollTop + (e.top - c.top) - pad
      scroller.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' })
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    try {
      el.focus({ preventScroll: true })
    } catch {
      el.focus()
    }
  }, [])

  const scrollToFirstUnanswered = useCallback(() => {
    if (!prepared?.length) return
    const first = prepared.find((p) => typeof selections[p.questionId] !== 'number')
    if (!first) return
    scrollToQuestion(first.questionId)
  }, [prepared, selections, scrollToQuestion])

  const toggleFlag = useCallback(
    (questionId) => {
      if (submitted) return
      setFlagged((prev) => ({ ...prev, [questionId]: !prev[questionId] }))
    },
    [submitted],
  )

  const dismissSocratic = useCallback(() => {
    setSocraticPhase('idle')
    setSocraticHighlight('')
    setSocraticQuestionId(null)
    setSocraticKeywords(null)
    setSocraticSourceFile(null)
    setSocraticExplanation(null)
    setSocraticError('')
    setSocraticFeedbackOpen(false)
    setSocraticFeedbackText('')
    setSocraticVoteError('')
    setSocraticVoteThanks(null)
  }, [])

  const submitSocraticVote = useCallback(
    async (vote, textOverride) => {
      if (!collectionId) return
      const ft =
        vote === 'feedback'
          ? String(textOverride ?? socraticFeedbackText)
              .trim()
              .slice(0, 2000)
          : ''
      if (vote === 'feedback' && ft.length < 1) {
        setSocraticVoteError('Please enter your feedback.')
        return
      }
      setSocraticFeedbackSending(true)
      setSocraticVoteError('')
      try {
        const res = await fetch(
          `${apiBaseUrl}/api/quiz/ai-collections/${collectionId}/socratic-feedback`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              vote,
              feedbackText: vote === 'feedback' ? ft : undefined,
              context: socraticFeedbackContext,
            }),
          },
        )
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setSocraticVoteError(data.error || `Save failed (${res.status})`)
          return
        }
        if (vote === 'feedback') {
          setSocraticFeedbackText('')
          setSocraticFeedbackOpen(false)
        }
        setSocraticVoteThanks(vote)
        window.setTimeout(() => setSocraticVoteThanks(null), 2800)
      } catch {
        setSocraticVoteError('Network error')
      } finally {
        setSocraticFeedbackSending(false)
      }
    },
    [apiBaseUrl, collectionId, socraticFeedbackContext, socraticFeedbackText],
  )

  const canSocraticThumbVote =
    socraticPhase === 'keywords' || socraticPhase === 'explain'

  useEffect(() => {
    dismissSocratic()
  }, [collectionId, attemptKey, dismissSocratic])

  const handleSelectionMouseUp = useCallback(() => {
    const root = selectableRootRef.current
    if (!root) return
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return
    const text = sel.toString().trim().replace(/\s+/g, ' ')
    if (text.length < 2 || text.length > 500) return
    let anchor = sel.anchorNode
    if (anchor && anchor.nodeType === Node.TEXT_NODE) {
      anchor = anchor.parentElement
    }
    if (!(anchor instanceof Element) || !root.contains(anchor)) return
    let qid = null
    let el = anchor
    while (el && el !== root) {
      const id = el.getAttribute?.('data-qid')
      if (id) {
        qid = id
        break
      }
      el = el.parentElement
    }
    if (!qid) return
    setSocraticHighlight(text)
    setSocraticQuestionId(qid)
    setSocraticKeywords(null)
    setSocraticSourceFile(null)
    setSocraticExplanation(null)
    setSocraticError('')
    setSocraticPhase('confirm_hint')
  }, [])

  const requestSocraticKeywords = useCallback(async () => {
    if (!collectionId || !socraticHighlight) return
    const highlightCheck = validateSocraticHighlight(socraticHighlight)
    if (!highlightCheck.ok) {
      setSocraticError(highlightCheck.error)
      return
    }
    setSocraticPhase('loading_keywords')
    setSocraticError('')
    try {
      const res = await fetch(
        `${apiBaseUrl}/api/quiz/ai-collections/${collectionId}/socratic-hint`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            highlightedText: socraticHighlight,
            questionId: socraticQuestionId,
            step: 'keywords',
          }),
        },
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSocraticError(data.error || `Hint failed (${res.status})`)
        setSocraticPhase('confirm_hint')
        return
      }
      const kw = Array.isArray(data.keywords) ? data.keywords : []
      if (kw.length === 0) {
        setSocraticError('No keywords returned. Try a different highlight.')
        setSocraticPhase('confirm_hint')
        return
      }
      setSocraticKeywords(kw)
      setSocraticSourceFile(typeof data.sourceFile === 'string' ? data.sourceFile : null)
      setSocraticPhase('keywords')
    } catch {
      setSocraticError('Network error')
      setSocraticPhase('confirm_hint')
    }
  }, [apiBaseUrl, collectionId, socraticHighlight, socraticQuestionId])

  const requestSocraticExplain = useCallback(async () => {
    if (!collectionId || !socraticHighlight || !socraticKeywords?.length) return
    const highlightCheck = validateSocraticHighlight(socraticHighlight)
    if (!highlightCheck.ok) {
      setSocraticError(highlightCheck.error)
      setSocraticPhase('keywords')
      return
    }
    setSocraticPhase('loading_explain')
    setSocraticError('')
    try {
      const res = await fetch(
        `${apiBaseUrl}/api/quiz/ai-collections/${collectionId}/socratic-hint`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            highlightedText: socraticHighlight,
            questionId: socraticQuestionId,
            step: 'explain',
            keywords: socraticKeywords,
          }),
        },
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSocraticError(data.error || `Hint failed (${res.status})`)
        setSocraticPhase('keywords')
        return
      }
      const expl =
        typeof data.explanation === 'string' ? data.explanation.trim() : ''
      if (!expl) {
        setSocraticError('No explanation returned.')
        setSocraticPhase('keywords')
        return
      }
      setSocraticExplanation(expl)
      setSocraticPhase('explain')
    } catch {
      setSocraticError('Network error')
      setSocraticPhase('keywords')
    }
  }, [apiBaseUrl, collectionId, socraticHighlight, socraticQuestionId, socraticKeywords])

  const runSubmit = async () => {
    if (!prepared?.length || submitted) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const answers = prepared.map((p) => ({
        questionId: p.questionId,
        selectedOriginalIndex: p.displayToOriginal[selections[p.questionId]],
      }))
      const res = await fetch(`${apiBaseUrl}/api/quiz/ai-collections/${collectionId}/submit`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSubmitError(data.error || `Submit failed (${res.status})`)
        return
      }
      setSubmitPayload(data)
      setSubmitted(true)
      if (typeof data.xpAwarded === 'number' && data.xpAwarded > 0) {
        window.dispatchEvent(
          new CustomEvent('gamify-xp-updated', { detail: { xp: data.xp, xpAwarded: data.xpAwarded } }),
        )
      }
      await loadHistory()
    } catch {
      setSubmitError('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitOrScroll = () => {
    if (submitted || submitting) return
    if (!allAnswered) {
      scrollToFirstUnanswered()
      return
    }
    runSubmit()
  }

  const handleTryAgain = () => {
    setSubmitted(false)
    setSubmitPayload(null)
    setSubmitError('')
    setAttemptKey((k) => k + 1)
  }

  if (!authReady) {
    return (
      <div className="selection:bg-primary selection:text-black min-h-screen flex items-center justify-center">
        <TermsThemeStyles />
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="selection:bg-primary selection:text-black min-h-screen flex flex-col">
      <TermsThemeStyles />
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 flex flex-col flex-1 min-h-0">
        <Link
          to="/quiz"
          className="group mb-8 inline-flex w-fit shrink-0 items-center gap-2.5 rounded-full border border-slate-600/45 bg-slate-950/35 px-3.5 py-2 pl-2.5 text-sm font-medium text-slate-200 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] backdrop-blur-sm transition-[border-color,background-color,color,box-shadow] hover:border-primary/35 hover:bg-slate-900/55 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-600/50 bg-slate-900/70 text-slate-400 transition-[border-color,background-color,color] group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:text-primary"
            aria-hidden
          >
            <span className="material-symbols-outlined text-[20px] leading-none">arrow_back</span>
          </span>
          <span className="pr-1">Back to quiz list</span>
        </Link>

        {loadError && <p className="text-amber-400 text-sm mb-6 shrink-0">{loadError}</p>}
        {submitError && <p className="text-amber-400 text-sm mb-6 shrink-0">{submitError}</p>}

        {play && prepared && (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:flex-1 lg:min-h-0 lg:h-[calc(100dvh-13.5rem)] lg:max-h-[calc(100dvh-13.5rem)]">
            <aside className="w-full lg:w-[min(100%,17.5rem)] shrink-0 z-10 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain">
              <div className="rounded-lg border border-slate-700/40 bg-slate-950/20 p-4">
                <p className="text-[11px] text-slate-600 tabular-nums mb-3">
                  {prepared.length} questions · {formatEstimatedQuizTime(prepared.length)}
                </p>
                <div
                  className="grid grid-cols-5 gap-1.5"
                  role="navigation"
                  aria-label="Jump to question"
                >
                  {prepared.map((p, idx) => {
                    const num = idx + 1
                    const answered = typeof selections[p.questionId] === 'number'
                    const isFlagged = !!flagged[p.questionId]
                    const res = resultsByQuestionId.get(p.questionId)
                    const isActive = activeQuestionId === p.questionId

                    let base =
                      'relative flex aspect-square min-h-0 items-center justify-center rounded border text-[11px] font-medium tabular-nums transition-[color,background-color,border-color] duration-150'
                    if (submitted && res) {
                      base += res.isCorrect
                        ? ' border-emerald-500/35 text-emerald-400/90 bg-emerald-500/[0.06]'
                        : ' border-red-500/35 text-red-400/90 bg-red-500/[0.06]'
                    } else if (answered) {
                      base +=
                        ' border-sky-400/45 bg-sky-500/15 text-sky-100 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.12)]'
                    } else {
                      base +=
                        ' border-slate-700/60 text-slate-500 bg-transparent hover:border-slate-600 hover:text-slate-400'
                    }
                    if (isActive) {
                      base += ' border-primary/70 text-slate-100'
                    }

                    return (
                      <button
                        key={p.questionId}
                        type="button"
                        onClick={() => scrollToQuestion(p.questionId)}
                        className={base}
                        aria-current={isActive ? 'true' : undefined}
                        aria-label={`Question ${num}${answered ? ', answered' : ', not answered'}${isFlagged ? ', flagged' : ''}`}
                      >
                        {isFlagged && (
                          <span
                            className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-red-400/90"
                            aria-hidden
                          />
                        )}
                        {num}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <p className="flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] text-slate-600 leading-snug">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 shrink-0 rounded-sm border border-slate-600" />
                      Unanswered
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 shrink-0 rounded-sm border border-sky-400/50 bg-sky-500/25" />
                      Answered
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="relative h-2 w-2 shrink-0 rounded-sm border border-slate-600">
                        <span className="absolute -top-px -right-px h-1 w-1 rounded-full bg-red-400/90" />
                      </span>
                      Flagged
                    </span>
                    {submitted && (
                      <>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-2 w-2 shrink-0 rounded-sm bg-emerald-500/35 border border-emerald-500/25" />
                          Correct
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-2 w-2 shrink-0 rounded-sm bg-red-500/35 border border-red-500/25" />
                          Incorrect
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div
                className="mt-3 rounded-lg border border-slate-700/35 bg-slate-950/25 p-3"
                role="region"
                aria-live="polite"
                aria-label="Socratic hint"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Socratic hint
                  </p>
                  <div className="flex shrink-0 items-center gap-px">
                    <button
                      type="button"
                      disabled={
                        !canSocraticThumbVote || socraticFeedbackSending || socraticPhase === 'loading_keywords' || socraticPhase === 'loading_explain'
                      }
                      onClick={() => submitSocraticVote('upvote')}
                      className="inline-flex h-5 w-5 items-center justify-center rounded border border-slate-600/45 text-slate-400 transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300 disabled:pointer-events-none disabled:opacity-30"
                      aria-label="Like this hint"
                      title="Like"
                    >
                      <span className="material-symbols-outlined text-[13px] leading-none" aria-hidden>
                        thumb_up
                      </span>
                    </button>
                    <button
                      type="button"
                      disabled={
                        !canSocraticThumbVote || socraticFeedbackSending || socraticPhase === 'loading_keywords' || socraticPhase === 'loading_explain'
                      }
                      onClick={() => submitSocraticVote('downvote')}
                      className="inline-flex h-5 w-5 items-center justify-center rounded border border-slate-600/45 text-slate-400 transition-colors hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 disabled:pointer-events-none disabled:opacity-30"
                      aria-label="Dislike this hint"
                      title="Dislike"
                    >
                      <span className="material-symbols-outlined text-[13px] leading-none" aria-hidden>
                        thumb_down
                      </span>
                    </button>
                    <button
                      type="button"
                      disabled={socraticFeedbackSending}
                      onClick={() => {
                        setSocraticFeedbackOpen((o) => !o)
                        setSocraticVoteError('')
                      }}
                      className={`inline-flex h-5 w-5 items-center justify-center rounded border text-slate-400 transition-colors hover:text-slate-100 disabled:opacity-30 ${
                        socraticFeedbackOpen
                          ? 'border-primary/50 bg-primary/10 text-primary'
                          : 'border-slate-600/45 hover:border-slate-500/60 hover:bg-slate-800/50'
                      }`}
                      aria-expanded={socraticFeedbackOpen}
                      aria-label="Write feedback"
                      title="Feedback"
                    >
                      <span className="material-symbols-outlined text-[13px] leading-none" aria-hidden>
                        feedback
                      </span>
                    </button>
                  </div>
                </div>
                {socraticVoteThanks && (
                  <p className="mb-2 text-[10px] text-slate-500" role="status">
                    {socraticVoteThanks === 'feedback'
                      ? 'Thanks — feedback saved.'
                      : socraticVoteThanks === 'upvote'
                        ? 'Thanks for the upvote.'
                        : 'Thanks — we noted that.'}
                  </p>
                )}
                {socraticVoteError ? (
                  <p className="mb-2 text-[10px] text-amber-400/90">{socraticVoteError}</p>
                ) : null}
                {socraticFeedbackOpen && (
                  <div className="mb-3 space-y-1.5">
                    <label htmlFor="socratic-feedback-text" className="sr-only">
                      Custom feedback
                    </label>
                    <textarea
                      id="socratic-feedback-text"
                      value={socraticFeedbackText}
                      onChange={(e) => setSocraticFeedbackText(e.target.value)}
                      maxLength={2000}
                      rows={3}
                      placeholder="What could we improve about these hints?"
                      className="w-full resize-y rounded-md border border-slate-600/55 bg-slate-900/55 px-2 py-1.5 text-[11px] leading-snug text-slate-200 placeholder:text-slate-500 focus:border-primary/45 focus:outline-none focus:ring-1 focus:ring-primary/35"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        disabled={socraticFeedbackSending}
                        onClick={() => submitSocraticVote('feedback')}
                        className="rounded-md border border-primary/45 bg-primary/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary transition-colors hover:bg-primary/25 disabled:opacity-40"
                      >
                        Send
                      </button>
                      <button
                        type="button"
                        disabled={socraticFeedbackSending}
                        onClick={() => {
                          setSocraticFeedbackOpen(false)
                          setSocraticFeedbackText('')
                          setSocraticVoteError('')
                        }}
                        className="rounded-md border border-slate-600/60 px-2.5 py-1 text-[10px] font-medium text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {socraticPhase === 'idle' && (
                  <div className="space-y-2">
                    {socraticError ? (
                      <p className="text-[11px] text-amber-400/90">{socraticError}</p>
                    ) : null}
                    <p className="text-[11px] leading-snug text-slate-500">
                      Highlight a phrase of{' '}
                      <span className="font-medium text-slate-400">at least three words</span> in a
                      question or answer so there is enough context for hints. Then confirm here if you
                      want guided reminders tied to this quiz&apos;s materials.
                    </p>
                  </div>
                )}
                {socraticPhase === 'confirm_hint' && (
                  <div className="space-y-2">
                    <p className="text-[11px] leading-snug text-slate-300">
                      Do you need hints on{' '}
                      <q className="font-medium text-primary/90 not-italic">
                        {socraticHighlight.length > 90
                          ? `${socraticHighlight.slice(0, 44)}…${socraticHighlight.slice(-28)}`
                          : socraticHighlight}
                      </q>
                      ?
                    </p>
                    {socraticError ? (
                      <p className="text-[11px] text-amber-400/90">{socraticError}</p>
                    ) : null}
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={requestSocraticKeywords}
                        className="rounded-md border border-slate-600/60 bg-slate-900/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-200 transition-colors hover:border-primary/45 hover:text-white"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={dismissSocratic}
                        className="rounded-md border border-slate-600/60 bg-transparent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-200"
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={dismissSocratic}
                        className="rounded-md border border-transparent px-2.5 py-1 text-[10px] font-medium text-slate-500 transition-colors hover:text-slate-300"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                )}
                {socraticPhase === 'loading_keywords' && (
                  <p className="text-[11px] text-slate-500">Finding topic reminders…</p>
                )}
                {socraticPhase === 'keywords' && socraticKeywords && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-medium text-slate-200">Topic reminders</p>
                    <ul className="list-inside list-disc text-[11px] leading-relaxed text-slate-400">
                      {socraticKeywords.map((k, i) => (
                        <li key={`${i}-${k}`}>{k}</li>
                      ))}
                    </ul>
                    <p className="text-[10px] leading-snug text-slate-500">
                      Sourced from{' '}
                      <span className="font-medium text-slate-400">
                        {socraticSourceFile || 'Course context'}
                      </span>
                      .
                    </p>
                    {socraticError ? (
                      <p className="text-[11px] text-amber-400/90">{socraticError}</p>
                    ) : null}
                    <p className="text-[11px] text-slate-400">Want a bit more explanation?</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={requestSocraticExplain}
                        className="rounded-md border border-slate-600/60 bg-slate-900/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-200 transition-colors hover:border-primary/45 hover:text-white"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={dismissSocratic}
                        className="rounded-md border border-slate-600/60 bg-transparent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-200"
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={dismissSocratic}
                        className="rounded-md border border-transparent px-2.5 py-1 text-[10px] font-medium text-slate-500 transition-colors hover:text-slate-300"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                )}
                {socraticPhase === 'loading_explain' && (
                  <p className="text-[11px] text-slate-500">Drafting a Socratic nudge…</p>
                )}
                {socraticPhase === 'explain' && socraticExplanation && (
                  <div className="space-y-2">
                    <p className="text-[11px] leading-relaxed text-slate-300">{socraticExplanation}</p>
                    <button
                      type="button"
                      onClick={dismissSocratic}
                      className="rounded-md border border-slate-600/60 bg-transparent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-200"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </aside>

            <div
              ref={mainScrollRef}
              className="min-w-0 flex-1 lg:min-h-0 lg:overflow-y-auto lg:overscroll-y-contain"
            >
            <div
              ref={selectableRootRef}
              role="presentation"
              onMouseUp={handleSelectionMouseUp}
              className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 md:p-8 space-y-6"
            >
            <header>
              <h1 className="text-xl font-bold text-white">{play.title}</h1>
              {typeof play.poolQuestionCount === 'number' && play.poolQuestionCount > 0 ? (
                <p className="mt-1 text-[11px] leading-snug text-slate-500">
                  {play.playQuestionCount ?? prepared?.length ?? 0} of {play.poolQuestionCount} in
                  pool — each start draws a fresh mix (previous round&apos;s questions are skipped when
                  the pool is large enough).
                </p>
              ) : null}
            </header>
            <ol className="space-y-8 list-decimal list-inside marker:text-primary marker:font-bold">
              {prepared.map((p) => {
                const res = resultsByQuestionId.get(p.questionId)
                const isFlagged = !!flagged[p.questionId]
                return (
                  <li
                    key={p.questionId}
                    ref={(el) => {
                      questionRefs.current[p.questionId] = el
                    }}
                    data-qid={p.questionId}
                    tabIndex={-1}
                    className="text-slate-200 scroll-mt-3 outline-none"
                  >
                    <span className="select-text font-medium text-white align-middle">
                      {p.stem}
                    </span>
                    {!submitted && (
                      <button
                        type="button"
                        onClick={() => toggleFlag(p.questionId)}
                        className={`align-middle ml-2 inline-flex rounded p-0.5 transition-colors ${
                          isFlagged
                            ? 'text-red-400/90'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                        aria-pressed={isFlagged}
                        aria-label={isFlagged ? 'Remove flag' : 'Flag for review'}
                      >
                        <span className="material-symbols-outlined text-[18px] font-light">flag</span>
                      </button>
                    )}
                    <ul className="mt-3 ml-4 space-y-2 list-none">
                      {p.displayChoices.map((choiceText, d) => {
                        const origAtDisplay = p.displayToOriginal[d]
                        const selected = selections[p.questionId]
                        const isSelected = selected === d

                        let row =
                          'select-text block w-full text-left text-sm pl-3 py-1.5 border-l-2 transition-all rounded-r-md'
                        if (!submitted) {
                          row += isSelected
                            ? ' cursor-pointer border-primary font-medium text-primary bg-primary/15 ring-1 ring-primary/40'
                            : ' cursor-pointer border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                        } else if (res) {
                          const { correctOriginalIndex, selectedOriginalIndex, isCorrect } = res
                          if (origAtDisplay === correctOriginalIndex) {
                            row +=
                              ' border-emerald-500 text-emerald-200 cursor-default bg-emerald-500/[0.06]'
                          } else if (
                            !isCorrect &&
                            origAtDisplay === selectedOriginalIndex &&
                            selectedOriginalIndex !== correctOriginalIndex
                          ) {
                            row += ' border-red-500 text-red-300 cursor-default bg-red-500/[0.06]'
                          } else {
                            row += ' border-slate-600 text-slate-500 cursor-default'
                          }
                        } else {
                          row += ' border-slate-600 text-slate-400 cursor-default'
                        }

                        return (
                          <li key={d}>
                            <label
                              className={`block ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                              <input
                                type="radio"
                                name={`mcq-${p.questionId}`}
                                className="sr-only"
                                checked={isSelected}
                                disabled={submitted}
                                onChange={() => setChoice(p.questionId, d)}
                                aria-label={choiceText}
                              />
                              <span className={row}>{choiceText}</span>
                            </label>
                          </li>
                        )
                      })}
                    </ul>
                    {submitted && res && !res.isCorrect && res.explanation && (
                      <p className="mt-3 text-xs text-slate-400 bg-slate-900/50 rounded-lg p-3">
                        {res.explanation}
                      </p>
                    )}
                  </li>
                )
              })}
            </ol>

            <div className="pt-4 border-t border-slate-700/50 space-y-6">
              {!submitted && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSubmitOrScroll}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-black bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    {submitting ? 'Submitting…' : 'Submit answers'}
                  </button>
                </div>
              )}

              {submitted && submitPayload && (
                <div className="space-y-2">
                  <div
                    className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-slate-200"
                    role="status"
                  >
                    <span className="font-bold text-primary">Score: </span>
                    <span className="tabular-nums">
                      {submitPayload.score} / {submitPayload.total}
                    </span>
                  </div>
                  {typeof submitPayload.xpAwarded === 'number' && submitPayload.xpAwarded > 0 && (
                    <p className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200/95">
                      <span className="font-bold text-emerald-400">+{submitPayload.xpAwarded} XP</span>
                      {' — '}
                      {typeof submitPayload.streakBonusXp === 'number' &&
                      submitPayload.streakBonusXp > 0 ? (
                        <>
                          <span className="tabular-nums text-emerald-100/95">
                            {typeof submitPayload.perfectScoreXp === 'number'
                              ? submitPayload.perfectScoreXp
                              : submitPayload.xpAwarded - submitPayload.streakBonusXp}
                          </span>
                          {' perfect score + '}
                          <span className="tabular-nums text-emerald-100/95">
                            {submitPayload.streakBonusXp}
                          </span>
                          {' same-day streak (+20%). '}
                        </>
                      ) : (
                        <>perfect score bonus. </>
                      )}
                      Your total is now{' '}
                      <span className="tabular-nums font-semibold text-white">
                        {typeof submitPayload.xp === 'number'
                          ? submitPayload.xp.toLocaleString()
                          : '—'}
                      </span>
                      {' XP (see Profile).'}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 px-1">
                    {attemptHistory.length} submission{attemptHistory.length === 1 ? '' : 's'} in
                    history
                  </p>
                </div>
              )}

              {attemptHistory.length > 0 && (
                <div className="rounded-xl border border-slate-600/50 bg-slate-900/30 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Score history
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {[...attemptHistory].reverse().map((a, i) => (
                      <li
                        key={a.id}
                        className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-700/40 pb-2 last:border-0 last:pb-0"
                      >
                        <span className="text-slate-400 tabular-nums w-8 shrink-0">#{i + 1}</span>
                        <span className="font-semibold text-white tabular-nums flex-1 text-center sm:text-left">
                          {a.score} / {a.total}
                        </span>
                        <span className="text-xs text-slate-500 w-full sm:w-auto sm:text-right shrink-0">
                          {formatAttemptWhen(a.createdAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {submitted && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleTryAgain}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-primary border border-primary/50 bg-primary/5 hover:bg-primary/10 hover:border-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">replay</span>
                    Try again
                  </button>
                </div>
              )}
            </div>
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuizAiRun
