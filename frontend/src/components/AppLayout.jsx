import { Outlet } from 'react-router-dom'
import TopNav from './TopNav'

function AppLayout() {
  return (
    <div className="page-glass-canvas">
      <TopNav />
      <main className="relative min-h-[calc(100vh-4.75rem)]">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
