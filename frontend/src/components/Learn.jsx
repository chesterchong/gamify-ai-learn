import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import LearningPathModule from './LearningPathModule.jsx'
import LearningPathOverview from './LearningPathOverview.jsx'
import ChapterPage from './ChapterPage.jsx'
import LessonPage from './LessonPage.jsx'
import TermsThemeStyles from './TermsThemeStyles'
import { getApiBaseUrl } from '../lib/apiBaseUrl.js'

function Learn() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeView, setActiveView] = useState(searchParams.get('view') || 'overview')
  const [selectedCourseId, setSelectedCourseId] = useState(searchParams.get('courseId'))
  const [selectedModuleId, setSelectedModuleId] = useState(searchParams.get('moduleId'))
  const [selectedLessonId, setSelectedLessonId] = useState(searchParams.get('lessonId'))
  const [courseTitle, setCourseTitle] = useState('')
  const [moduleCache, setModuleCache] = useState({})
  const apiBaseUrl = getApiBaseUrl()

  useEffect(() => {
    const view = searchParams.get('view') || 'overview'
    const courseId = searchParams.get('courseId')
    const moduleId = searchParams.get('moduleId')
    const lessonId = searchParams.get('lessonId')
    setActiveView(view)
    setSelectedCourseId(courseId)
    setSelectedModuleId(moduleId)
    setSelectedLessonId(lessonId)
  }, [searchParams])

  const handleOpenModule = (courseId) => {
    setSearchParams({ view: 'module', courseId })
  }

  const handleOpenChapter = async (moduleId, title) => {
    setCourseTitle(title || '')
    const cached = moduleCache[moduleId]
    const pickTargetLesson = (mod) => {
      const items = [
        ...(mod.lessons || []),
        ...(mod.problems || []),
      ].sort((a, b) => (a.order || 0) - (b.order || 0))

      if (!items.length) {
        setSearchParams({ view: 'module', courseId: selectedCourseId })
        return
      }

      const firstIncomplete = items.find((item) => !item.isCompleted)
      const target = firstIncomplete || items[0]

      setSearchParams({
        view: 'lesson',
        courseId: selectedCourseId,
        moduleId,
        lessonId: target.id,
      })
    }

    if (cached) {
      pickTargetLesson(cached)
      return
    }

    try {
      const res = await fetch(`${apiBaseUrl}/api/learning/modules/${moduleId}`, {
        credentials: 'include',
      })
      if (!res.ok) {
        setSearchParams({ view: 'module', courseId: selectedCourseId })
        return
      }
      const mod = await res.json()
      setModuleCache((prev) => ({ ...prev, [moduleId]: mod }))
      pickTargetLesson(mod)
    } catch {
      setSearchParams({ view: 'module', courseId: selectedCourseId })
    }
  }

  const handleOpenLesson = (lessonId) => {
    setSearchParams({ view: 'lesson', courseId: selectedCourseId, moduleId: selectedModuleId, lessonId })
  }

  const handleBackToChapter = () => {
    setSearchParams({ view: 'module', courseId: selectedCourseId })
  }

  const handleBackToModule = () => {
    setSearchParams({ view: 'module', courseId: selectedCourseId })
  }

  const handleBackToOverview = () => {
    setSearchParams({ view: 'overview' })
  }

  return (
    <div className="selection:bg-primary selection:text-black min-h-screen">
      <TermsThemeStyles />
      <main className="mx-auto w-full max-w-6xl px-4 pb-6 pt-2 sm:px-6 sm:pb-8">
        {activeView === 'overview' && (
          <LearningPathOverview onOpenModule={handleOpenModule} />
        )}
        {activeView === 'module' && (
          <LearningPathModule
            courseId={selectedCourseId}
            onBack={handleBackToOverview}
            onOpenChapter={handleOpenChapter}
          />
        )}
        {activeView === 'lesson' && (
          <LessonPage
            lessonId={selectedLessonId}
            onBack={handleBackToChapter}
            onComplete={() => {}}
            initialModuleData={moduleCache[selectedModuleId]}
          />
        )}
      </main>
    </div>
  )
}

export default Learn
