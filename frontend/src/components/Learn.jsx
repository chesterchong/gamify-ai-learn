import { useState } from 'react'
import Layout from './Layout.jsx'
import LearningPathModule from './LearningPathModule.jsx'
import LearningPathOverview from './LearningPathOverview.jsx'

function Learn() {
  const [activeView, setActiveView] = useState('overview')

  return (
    <Layout title="Learning Path">
      {activeView === 'overview' ? (
        <LearningPathOverview onOpenModule={() => setActiveView('module')} />
      ) : (
        <LearningPathModule onBack={() => setActiveView('overview')} />
      )}
    </Layout>
  )
}

export default Learn
