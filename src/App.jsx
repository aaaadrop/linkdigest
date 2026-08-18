import { useState } from 'react'
import { LanguageProvider, useLanguage } from './i18n.jsx'
import './App.css'

function App() {
  return (
    <LanguageProvider>
      <LinkDigestPage />
    </LanguageProvider>
  )
}

function LinkDigestPage() {
  const { t, toggleLang } = useLanguage()
  const [url, setUrl] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // 后端接口还没接，先打印出来确认表单可用
    console.log('提交的链接:', url)
  }

  return (
    <div className="page">
      <header className="header">
        <span className="logo">⚡ {t.appName}</span>
        <button
          type="button"
          className="lang-btn"
          onClick={toggleLang}
          aria-label="切换语言 / Switch language"
        >
          {t.languageSwitch}
        </button>
      </header>

      <main className="main">
        <h1 className="title">{t.tagline}</h1>
        <p className="subtitle">{t.subtitle}</p>

        <form className="input-row" onSubmit={handleSubmit}>
          <input
            className="url-input"
            type="url"
            placeholder={t.inputPlaceholder}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <button type="submit" className="summarize-btn">
            {t.summarize}
          </button>
        </form>
      </main>

      <footer className="footer">{t.footer}</footer>
    </div>
  )
}

export default App
