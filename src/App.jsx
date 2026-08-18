import { useState } from 'react'
import { LanguageProvider, useLanguage } from './i18n.jsx'
import './App.css'

// 后端地址：开发时后端跑在 3001 端口
const API_URL = 'http://localhost:3001'

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
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      // 调用后端接口（类比前端"发一个 POST 请求给服务器"）
      const resp = await fetch(`${API_URL}/api/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await resp.json()
      setResult(data)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
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
          <button type="submit" className="summarize-btn" disabled={loading}>
            {loading ? t.loading : t.summarize}
          </button>
        </form>

        {error && <p className="result-error">{error}</p>}

        {result && (
          <div className="result-card">
            <h2 className="result-title">{t.resultTitle}</h2>
            <p className="result-summary">{result.summary}</p>
            {result.points && result.points.length > 0 && (
              <ul className="result-points">
                {result.points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>

      <footer className="footer">{t.footer}</footer>
    </div>
  )
}

export default App
