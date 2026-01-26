import { Link } from 'react-router-dom'
import Layout from './Layout.jsx'

function EditProfile() {
  return (
    <Layout title="Edit Profile">
      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #2b3644;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #3c4b5d;
        }
      `}</style>
      <div className="min-h-full w-full bg-[#0b111b] text-white">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Edit Profile
            </h1>
          </div>

          <section className="rounded-2xl border border-[#1e2b3f] bg-[#0f1623] shadow-[0_20px_50px_-20px_rgba(15,31,52,0.9)] px-6 md:px-10 py-8 space-y-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="size-28 md:size-32 rounded-full border-4 border-[#21426a] bg-gradient-to-br from-[#0b111b] to-[#1b2738] flex items-center justify-center">
                    <div className="size-24 md:size-28 rounded-full overflow-hidden bg-[#0b111b] flex items-center justify-center">
                      <img
                        alt="Profile preview"
                        className="h-full w-full object-cover opacity-90"
                        src="https://lh3.googleusercontent.com/a/ACg8ocLyRHQvwCqfDkEB8QjBR1lbWwKLf6LC773bpIZzMD1HvKM4yFTy=s432-c-"
                      />
                    </div>
                  </div>
                  <button
                    className="absolute inset-0 m-auto size-16 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-white flex flex-col items-center justify-center gap-1 hover:bg-black/70 transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      photo_camera
                    </span>
                    <span className="text-[10px] font-semibold tracking-wide">
                      UPLOAD
                    </span>
                  </button>
                  <span className="absolute -bottom-2 right-0 bg-[#f7c338] text-[#0b111b] text-xs font-bold px-3 py-1 rounded-full border border-[#0f1623]">
                    LVL 12
                  </span>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-widest text-slate-400">
                    Full Name
                  </span>
                  <input
                    className="h-11 rounded-lg bg-[#162235] border border-[#23354d] px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/60"
                    defaultValue="Chester"
                    placeholder="Enter full name"
                  />
                  <span className="text-[11px] text-slate-500">
                    Enter new name
                  </span>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-widest text-slate-400">
                    Username
                  </span>
                  <input
                    className="h-11 rounded-lg bg-[#162235] border border-[#23354d] px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/60"
                    placeholder="Enter username"
                  />
                  <span className="text-[11px] text-slate-600">
                    Enter new name
                  </span>
                </label>
                <label className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-xs uppercase tracking-widest text-slate-400">
                    Professional Role
                  </span>
                  <input
                    className="h-11 rounded-lg bg-[#162235] border border-[#23354d] px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/60"
                    defaultValue="Student"
                    placeholder="e.g., Student, Developer"
                  />
                  <span className="text-[11px] text-slate-500">
                    e.g., Student, Developer
                  </span>
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-[#1f2d42] bg-[#0c131f] px-5 md:px-8 py-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="size-9 rounded-lg border border-[#214b3b] bg-[#10201a] text-[#4adf7a] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">
                    code
                  </span>
                </div>
                <h2 className="text-lg font-bold">Account Settings</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <label className="flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-widest text-slate-400">
                    Email Address
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      className="flex-1 h-11 rounded-lg bg-[#162235] border border-[#23354d] px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/60"
                      defaultValue="chester@example.com"
                      placeholder="you@example.com"
                    />
                    <button
                      className="h-11 px-4 rounded-lg border border-[#2a3d55] bg-[#0f1623] text-xs font-semibold text-slate-300 hover:bg-[#141f30] transition-colors"
                      type="button"
                    >
                      Change Email
                    </button>
                  </div>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-widest text-slate-400">
                    Password
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      className="flex-1 h-11 rounded-lg bg-[#162235] border border-[#23354d] px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/60"
                      placeholder="••••••••"
                      type="password"
                    />
                    <button
                      className="h-11 px-4 rounded-lg border border-[#2a3d55] bg-[#0f1623] text-xs font-semibold text-slate-300 hover:bg-[#141f30] transition-colors"
                      type="button"
                    >
                      Change Password
                    </button>
                  </div>
                </label>
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <Link
                  className="inline-flex h-11 px-5 items-center justify-center rounded-lg border border-[#2a3d55] bg-transparent text-sm font-semibold text-slate-300 hover:bg-[#141f30] transition-colors"
                  to="/profile"
                >
                  Cancel
                </Link>
                <button
                  className="h-11 px-5 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-blue-500 transition-colors flex items-center gap-2"
                  type="button"
                >
                  Save Changes
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_right_alt
                  </span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
}

export default EditProfile
