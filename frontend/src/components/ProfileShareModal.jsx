import { useState } from 'react'

function ProfileShareModal({ isOpen, onClose, link }) {
  const [isPublicProfile, setIsPublicProfile] = useState(true)
  const [isCopyPulse, setIsCopyPulse] = useState(false)

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
                className="rounded-2xl border border-[#243042] bg-[#0f1622] px-4 py-5 flex flex-col items-center gap-3 hover:border-primary/60 hover:bg-[#141d2b] transition-colors"
                type="button"
              >
                <div className="size-10 rounded-full bg-[#1c2432] flex items-center justify-center text-slate-200">
                  <span className="material-symbols-outlined">share</span>
                </div>
                <span className="text-sm font-semibold">X</span>
              </button>
              <button
                className="rounded-2xl border border-[#243042] bg-[#0f1622] px-4 py-5 flex flex-col items-center gap-3 hover:border-primary/60 hover:bg-[#141d2b] transition-colors"
                type="button"
              >
                <div className="size-10 rounded-full bg-[#1c2432] flex items-center justify-center text-slate-200">
                  <span className="material-symbols-outlined">person_add</span>
                </div>
                <span className="text-sm font-semibold">LinkedIn</span>
              </button>
              <button
                className="rounded-2xl border border-[#243042] bg-[#0f1622] px-4 py-5 flex flex-col items-center gap-3 hover:border-primary/60 hover:bg-[#141d2b] transition-colors"
                type="button"
              >
                <div className="size-10 rounded-full bg-[#1c2432] flex items-center justify-center text-slate-200">
                  <span className="material-symbols-outlined">chat</span>
                </div>
                <span className="text-sm font-semibold">Discord</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              className="text-slate-400 hover:text-white transition-colors"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileShareModal
