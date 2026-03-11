import { useState } from 'react'

function ProfileShareModal({ isOpen, onClose, link }) {
  const [isPublicProfile, setIsPublicProfile] = useState(true)
  const [isCopyPulse, setIsCopyPulse] = useState(false)

  const shareOnX = () => {
    const text = encodeURIComponent(`Check out my coding profile on Gamify AI Learn! 🚀\n\n${link}`)
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(link)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
  }

  const shareOnDiscord = () => {
    // Discord doesn't have a direct "share" URL like X or LinkedIn, 
    // so we usually copy the link and tell the user to paste it.
    // However, we can use a redirect or just copy to clipboard.
    // For now, let's copy to clipboard and show a small notification or just use the copy logic.
    navigator.clipboard.writeText(link)
    setIsCopyPulse(true)
    window.setTimeout(() => setIsCopyPulse(false), 600)
    alert('Link copied! You can now paste it in Discord.')
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button
        aria-label="Close share modal"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />
      <div
        className="relative w-full max-w-xl rounded-2xl border border-[#1f2937] bg-[#131a24] text-white shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]"
        role="dialog"
        aria-modal="true"
        aria-label="Profile sharing"
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">
              Share your profile
            </h2>
            <p className="text-slate-400 mt-2 text-sm">
              Show off your coding milestones and rank to the world.
            </p>
          </div>
          <button
            aria-label="Close"
            className="text-slate-400 hover:text-white transition-colors"
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5">
          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] text-slate-300 mb-3">
              PROFILE LINK
            </p>
            <div className="grid grid-cols-[1fr_auto] items-stretch rounded-xl border border-[#263244] bg-[#0d141f] overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 text-slate-200">
                <span className="material-symbols-outlined text-[#4aa3ff]">
                  link
                </span>
                <span className="text-sm font-medium">{link}</span>
              </div>
              <button
                className="h-full w-36 border-l border-[#263244] bg-[#1b5cff] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:bg-[#2c6bff]"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(link)
                  } catch (error) {
                    const tempInput = document.createElement('input')
                    tempInput.value = link
                    document.body.appendChild(tempInput)
                    tempInput.select()
                    document.execCommand('copy')
                    document.body.removeChild(tempInput)
                  }
                  setIsCopyPulse(true)
                  window.setTimeout(() => setIsCopyPulse(false), 600)
                }}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isCopyPulse ? 'check' : 'content_copy'}
                </span>
                {isCopyPulse ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[#1f2937] bg-[#0f1622] px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Public Profile</p>
              <p className="text-xs text-slate-400">
                Allow others to see your badges and progress.
              </p>
            </div>
            <button
              aria-pressed={isPublicProfile}
              className={`w-14 h-8 rounded-full p-1 transition-colors ${
                isPublicProfile ? 'bg-primary' : 'bg-slate-600'
              }`}
              onClick={() => setIsPublicProfile((prev) => !prev)}
              type="button"
            >
              <span
                className={`block size-6 rounded-full bg-white transition-transform ${
                  isPublicProfile ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] text-slate-300 mb-4">
              SHARE VIA SOCIAL MEDIA
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                className="rounded-2xl border border-[#243042] bg-[#0f1622] px-4 py-5 flex flex-col items-center gap-3 hover:border-[#1DA1F2]/60 hover:bg-[#1DA1F2]/10 transition-colors group"
                onClick={shareOnX}
                type="button"
              >
                <div className="size-10 rounded-full bg-[#1c2432] flex items-center justify-center text-slate-200 group-hover:bg-[#1DA1F2] group-hover:text-white transition-colors">
                  <svg className="size-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                  </svg>
                </div>
                <span className="text-sm font-semibold">X</span>
              </button>
              <button
                className="rounded-2xl border border-[#243042] bg-[#0f1622] px-4 py-5 flex flex-col items-center gap-3 hover:border-[#0077b5]/60 hover:bg-[#0077b5]/10 transition-colors group"
                onClick={shareOnLinkedIn}
                type="button"
              >
                <div className="size-10 rounded-full bg-[#1c2432] flex items-center justify-center text-slate-200 group-hover:bg-[#0077b5] group-hover:text-white transition-colors">
                  <svg className="size-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                  </svg>
                </div>
                <span className="text-sm font-semibold">LinkedIn</span>
              </button>
              <button
                className="rounded-2xl border border-[#243042] bg-[#0f1622] px-4 py-5 flex flex-col items-center gap-3 hover:border-[#5865F2]/60 hover:bg-[#5865F2]/10 transition-colors group"
                onClick={shareOnDiscord}
                type="button"
              >
                <div className="size-10 rounded-full bg-[#1c2432] flex items-center justify-center text-slate-200 group-hover:bg-[#5865F2] group-hover:text-white transition-colors">
                  <svg className="size-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"></path>
                  </svg>
                </div>
                <span className="text-sm font-semibold">Discord</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileShareModal
