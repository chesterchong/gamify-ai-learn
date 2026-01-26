import { Navigate, Route, Routes } from 'react-router-dom'

import Achievement from './components/Achievement.jsx'
import Dashboard from './components/Dashboard.jsx'
import EditProfile from './components/EditProfile.jsx'
import Learn from './components/Learn.jsx'
import Login from './components/Login.jsx'
import Profile from './components/Profile.jsx'
import Quiz from './components/Quiz.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/learn" element={<Learn />} />
      <Route path="/achievement" element={<Achievement />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/edit" element={<EditProfile />} />
    </Routes>
  )
}

export default App
