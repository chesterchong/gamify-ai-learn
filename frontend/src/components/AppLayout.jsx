import { Outlet } from 'react-router-dom'
import TopNav from './TopNav'

function AppLayout() {
  return (
    <>
      <TopNav />
      <Outlet />
    </>
  )
}

export default AppLayout
