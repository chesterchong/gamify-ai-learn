import { Route, Routes } from 'react-router-dom'

import AppLayout from './components/AppLayout.jsx'
import SyncDocumentTitle from './components/SyncDocumentTitle.jsx'
import Dashboard from './components/Dashboard.jsx'
import EditProfile from './components/EditProfile.jsx'
import Home from './components/Home.jsx'
import Learn from './components/Learn.jsx'
import Profile from './components/Profile.jsx'
import ProfileRedirect from './components/ProfileRedirect.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Quiz from './components/Quiz.jsx'
import QuizAiCollection from './components/QuizAiCollection.jsx'
import QuizAiRun from './components/QuizAiRun.jsx'
import QuizUpload from './components/QuizUpload.jsx'
import Terms from './components/Terms.jsx'
import Signup from './components/signup.jsx'

function App() {
  return (
    <>
      <SyncDocumentTitle />
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
              <Dashboard />
            </ProtectedRoute>
          }
        />
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
          path="/quiz"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/upload"
          element={
            <ProtectedRoute>
              <QuizUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/ai/:collectionId"
          element={
            <ProtectedRoute>
              <QuizAiCollection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/run/:collectionId"
          element={
            <ProtectedRoute>
              <QuizAiRun />
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
        <Route
          path="/profile/:username"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileRedirect />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
    </>
  )
}

export default App
