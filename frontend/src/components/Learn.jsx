import { useState } from 'react'
import LearningPathModule from './LearningPathModule.jsx'
import LearningPathOverview from './LearningPathOverview.jsx'
import TermsThemeStyles from './TermsThemeStyles'

function Learn() {
  const [activeView, setActiveView] = useState('overview')

  return (
    <div className="bg-background-dark selection:bg-primary selection:text-black min-h-screen">
      <TermsThemeStyles />
      <main className="container mx-auto px-6 pt-2 pb-4">
        {activeView === 'overview' ? (
          <LearningPathOverview onOpenModule={() => setActiveView('module')} />
        ) : (
          <LearningPathModule onBack={() => setActiveView('overview')} />
        )}
      </main>
    </div>
  )
}

export default Learn
