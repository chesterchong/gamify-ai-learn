import { NavLink, useNavigate } from 'react-router-dom'

function Layout({ title, children, mainClassName = '' }) {
  const navigate = useNavigate()
  const navLinkClass = ({ isActive }) =>
    [
      'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors border-l-4',
      isActive
        ? 'bg-primary/10 dark:bg-[#283039] text-primary dark:text-white border-primary'
        : 'border-transparent hover:bg-slate-100 dark:hover:bg-[#1c232b] text-slate-600 dark:text-[#9dabb9] group',
    ].join(' ')

  return (
    <div className="min-h-screen flex w-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display">
      <aside className="hidden md:flex flex-col w-72 bg-surface-light dark:bg-[#111418] border-r border-slate-200 dark:border-slate-800 flex-shrink-0 z-20">
        <div className="flex flex-col h-full p-4 justify-between">
          <div className="flex flex-col gap-8">
            <div className="flex gap-3 items-center px-2">
              <div
                className="bg-center bg-no-repeat bg-cover rounded-full size-12 shadow-lg ring-2 ring-primary/20"
                data-alt="Profile picture of a student smiling"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/a/ACg8ocLyRHQvwCqfDkEB8QjBR1lbWwKLf6LC773bpIZzMD1HvKM4yFTy=s432-c-no")',
                }}
              ></div>
              <div className="flex flex-col">
                <h1 className="text-slate-900 dark:text-white text-base font-semibold leading-tight">
                  Chester
                </h1>
                <p className="text-slate-500 dark:text-[#9dabb9] text-xs font-medium uppercase tracking-wider">
                  Level 99
                </p>
              </div>
            </div>
            <nav className="flex flex-col gap-2">
              <NavLink className={navLinkClass} to="/dashboard">
                <span className="material-symbols-outlined text-2xl group-hover:text-primary transition-colors">
                  dashboard
                </span>
                <span className="text-sm font-medium">Dashboard</span>
              </NavLink>
              <NavLink className={navLinkClass} to="/learn">
                <span className="material-symbols-outlined text-2xl group-hover:text-primary transition-colors">
                  map
                </span>
                <span className="text-sm font-medium">Learning Path</span>
              </NavLink>
              <NavLink className={navLinkClass} to="/achievement">
                <span
                  className="material-symbols-outlined text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  emoji_events
                </span>
                <span className="text-sm font-medium">Achievements</span>
              </NavLink>
              <NavLink className={navLinkClass} to="/quiz">
                <span className="material-symbols-outlined text-2xl group-hover:text-primary transition-colors">
                  quiz
                </span>
                <span className="text-sm font-medium">Quiz</span>
              </NavLink>
              <NavLink className={navLinkClass} to="/profile">
                <span className="material-symbols-outlined text-2xl group-hover:text-primary transition-colors">
                  person
                </span>
                <span className="text-sm font-medium">Profile</span>
              </NavLink>
            </nav>
          </div>
          <div className="px-2">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 relative overflow-hidden group cursor-pointer">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-white">
                  rocket_launch
                </span>
              </div>
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">
                Daily Streak
              </p>
              <p className="text-white text-2xl font-bold">12 Days</p>
              <p className="text-indigo-200/60 text-xs mt-2">
                Keep it up to earn the Fire badge!
              </p>
            </div>
            <button
              className="mt-3 w-full flex items-center gap-3 px-3 py-2 text-slate-500 dark:text-[#9dabb9] hover:text-primary hover:bg-slate-100 dark:hover:bg-[#1c232b] active:scale-[0.98] transition-colors transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100 dark:focus-visible:ring-offset-[#111418] rounded-lg"
              onClick={() => {
                localStorage.clear()
                sessionStorage.clear()
                navigate('/login', { replace: true })
              }}
              type="button"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="text-sm font-medium">Log Out</span>
            </button>
          </div>
        </div>
      </aside>
      <main
        className={`flex-1 flex flex-col h-screen overflow-y-auto bg-background-light dark:bg-background-dark relative ${mainClassName}`}
      >
        <div className="flex items-center justify-between p-4 md:hidden bg-surface-light dark:bg-[#111418] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
          <span className="material-symbols-outlined dark:text-white">
            menu
          </span>
          <span className="text-lg font-bold dark:text-white">{title}</span>
          <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700"></div>
        </div>
        {children}
      </main>
    </div>
  )
}

export default Layout
