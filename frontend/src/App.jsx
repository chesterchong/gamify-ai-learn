import { Navigate, Route, Routes } from 'react-router-dom'

import Achievement from './components/Achievement.jsx'
import Dashboard from './components/Dashboard.jsx'
import EditProfile from './components/EditProfile.jsx'
import Learn from './components/Learn.jsx'
import Login from './components/Login.jsx'
import Profile from './components/Profile.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Quiz from './components/Quiz.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/learn"
        element={
          <ProtectedRoute>
            <Learn />
          </ProtectedRoute>
        }
      />
      <Route
        path="/achievement"
        element={
          <ProtectedRoute>
            <Achievement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz"
        element={
          <ProtectedRoute>
            <Quiz />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
