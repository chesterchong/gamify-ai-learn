import { Navigate, Route, Routes } from 'react-router-dom'

import AppLayout from './components/AppLayout.jsx'
import Dashboard from './components/Dashboard.jsx'
import EditProfile from './components/EditProfile.jsx'
import Home from './components/Home.jsx'
import Learn from './components/Learn.jsx'
import Profile from './components/Profile.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Quiz from './components/Quiz.jsx'
import Terms from './components/Terms.jsx'
import Signup from './components/signup.jsx'
import Dash from './components/dash.jsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Signup />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/terms" element={<Terms />} />
        <Route
          path="/dash"
          element={
            <ProtectedRoute>
              <Dash />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navigate to="/dash" replace />
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
      </Route>
    </Routes>
  )
}

export default App
