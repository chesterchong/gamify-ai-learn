import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import LearningPathModule from './LearningPathModule.jsx'
import LearningPathOverview from './LearningPathOverview.jsx'
import TermsThemeStyles from './TermsThemeStyles'

function Learn() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeView, setActiveView] = useState(searchParams.get('view') || 'overview')
  const [selectedCourseId, setSelectedCourseId] = useState(searchParams.get('courseId'))

  useEffect(() => {
    const view = searchParams.get('view') || 'overview'
    const courseId = searchParams.get('courseId')
    setActiveView(view)
    setSelectedCourseId(courseId)
  }, [searchParams])

  const handleOpenModule = (courseId) => {
    setSearchParams({ view: 'module', courseId })
  }

  const handleBack = () => {
    setSearchParams({ view: 'overview' })
  }

  return (
    <div className="bg-background-dark selection:bg-primary selection:text-black min-h-screen">
      <TermsThemeStyles />
      <main className="container mx-auto px-6 pt-2 pb-4">
        {activeView === 'overview' ? (
          <LearningPathOverview onOpenModule={handleOpenModule} />
        ) : (
          <LearningPathModule 
            courseId={selectedCourseId} 
            onBack={handleBack} 
          />
        )}
      </main>
    </div>
  )
}

export default Learn
