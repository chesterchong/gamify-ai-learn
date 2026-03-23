import { Outlet } from 'react-router-dom'
import TopNav from './TopNav'

function AppLayout() {
  return (
    <div className="page-glass-canvas">
      <TopNav />
      <main className="relative w-full min-h-[calc(100dvh-5.25rem)] min-h-[calc(100vh-5.25rem)] overflow-x-clip">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
