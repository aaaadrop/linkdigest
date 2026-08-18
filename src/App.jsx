import { useEffect, useState } from 'react'
import { LanguageProvider, useLanguage } from './i18n.jsx'
import './App.css'

// 后端 API 地址：
// 生产环境：前端由后端托管，同源调用（相对路径 /api/...）
// 开发环境：Vite 代理把 /api 转发到 3001（见 vite.config.js）
const API_URL = ''

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
  const [copied, setCopied] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

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

  // 复制摘要到剪贴板
  const handleCopy = async () => {
    if (!result) return
    const text = `${result.summary}\n${(result.points || []).map((p) => `- ${p}`).join('\n')}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // 2秒后恢复按钮文字
    } catch (err) {
      console.log('复制失败:', err)
    }
  }

  // 导出 Markdown 文件下载
  const handleExport = () => {
    if (!result) return
    const md = `# 链接摘要\n\n> 来源: ${url}\n\n## 摘要\n\n${result.summary}\n\n## 要点\n\n${(result.points || [])
      .map((p) => `- ${p}`)
      .join('\n')}\n`
    // 创建 Blob 并触发浏览器下载（前端生成文件的常用方式）
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'linkdigest-summary.md'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  // 历史条目点击展开/收起
  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id))
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
          {url && (
            <button
              type="button"
              className="clear-btn"
              onClick={() => setUrl('')}
              aria-label={t.clear}
              title={t.clear}
            >
              ✕
            </button>
          )}
          <button type="submit" className="summarize-btn" disabled={loading}>
            {loading ? (
              <span className="loading-wrap">
                <span className="spinner" />
                {t.loading}
              </span>
            ) : (
              t.summarize
            )}
          </button>
        </form>

        {error && <p className="result-error">{error}</p>}

        {result && (
          <div className="result-card">
            <div className="result-head">
              <h2 className="result-title">{t.resultTitle}</h2>
              <div className="result-actions">
                <button
                  type="button"
                  className="action-btn"
                  onClick={handleCopy}
                >
                  {copied ? t.copied : t.copy}
                </button>
                <button
                  type="button"
                  className="action-btn"
                  onClick={handleExport}
                >
                  {t.exportMd}
                </button>
              </div>
            </div>
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
                <li
                  key={item.id}
                  className="history-item"
                  onClick={() => toggleExpand(item.id)}
                >
                  <div className="history-row">
                    <span className="history-url">{item.url}</span>
                    <span className="history-time">{item.createdAt}</span>
                  </div>
                  <p className="history-summary">
                    {item.summary}
                    <span className="history-toggle">
                      {expandedId === item.id ? ' ▲' : ' ▼'}
                    </span>
                  </p>
                  {expandedId === item.id && item.points && (
                    <ul className="history-points">
                      {item.points.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  )}
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
