import { useEffect, useState } from 'react'
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
  const { t, lang, toggleLang } = useLanguage()
  const [url, setUrl] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])

  // 页面加载时自动拉取历史记录（类比 Java 的初始化方法）
  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const resp = await fetch(`${API_URL}/api/history`)
      const data = await resp.json()
      setHistory(data)
    } catch (err) {
      // 历史拉取失败不影响主功能，静默处理
      console.log('拉取历史失败:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      // 调用后端接口（类比前端"发一个 POST 请求给服务器"）
      // 附带当前界面语言 lang，让 AI 用对应语言输出
      const resp = await fetch(`${API_URL}/api/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, lang }),
      })
      const data = await resp.json()
      if (!resp.ok) {
        // 后端返回了错误（如网址打不开），展示友好错误信息
        setError(data.error || t.errorGeneric)
        return
      }
      setResult(data)
      // 摘要成功后刷新历史列表（新的记录在最上面）
      fetchHistory()
    } catch (err) {
      // 网络层错误（如后端没启动），展示友好提示
      setError(t.errorNetwork)
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

        {history.length > 0 && (
          <div className="history-card">
            <h2 className="result-title">{t.historyTitle}</h2>
            <ul className="history-list">
              {history.map((item) => (
                <li key={item.id} className="history-item">
                  <div className="history-row">
                    <span className="history-url">{item.url}</span>
                    <span className="history-time">{item.createdAt}</span>
                  </div>
                  <p className="history-summary">{item.summary}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      <footer className="footer">{t.footer}</footer>
    </div>
  )
}

export default App
