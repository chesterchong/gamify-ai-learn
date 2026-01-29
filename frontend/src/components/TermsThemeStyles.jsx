function TermsThemeStyles() {
  return (
    <style>{`
      :root { font-family: 'JetBrains Mono', monospace; }
      .bg-background-dark { background-color: #05070a; }
      .bg-panel-dark { background-color: #0a0f14; }
      .bg-accent-dark { background-color: #1a1f26; }
      .text-primary { color: #00f3ff; }
      .text-secondary { color: #00ff41; }
      .border-primary { border-color: #00f3ff; }
      .border-secondary { border-color: #00ff41; }
      .bg-secondary\/5 { background-color: rgba(0, 255, 65, 0.05); }
      .bg-secondary\/10 { background-color: rgba(0, 255, 65, 0.1); }
      .bg-primary\/5 { background-color: rgba(0, 243, 255, 0.05); }
      .bg-primary\/30 { background-color: rgba(0, 243, 255, 0.3); }
      .bg-background-dark\/95 { background-color: rgba(5, 7, 10, 0.95); }
      .font-mono { font-family: 'JetBrains Mono', monospace; }
      body { background-color: #05070a; color: #94a3b8; }
      h1, h2, h3, h4, h5, h6 { font-weight: 700; color: #00f3ff; letter-spacing: -0.02em; }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: #05070a; }
      ::-webkit-scrollbar-thumb { background: #1a1f26; }
      ::-webkit-scrollbar-thumb:hover { background: #00f3ff; }
      .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24; }
      .logo-lock { user-select: none; -webkit-user-select: none; -ms-user-select: none; }
    `}</style>
  )
}

export default TermsThemeStyles

