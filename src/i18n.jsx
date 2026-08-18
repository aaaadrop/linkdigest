// LinkDigest 国际化系统（轻量自研 i18n）
// 原理：翻译字典 -> React Context 提供 -> 组件通过 useLanguage() 消费
import { createContext, useContext, useEffect, useState } from 'react'

// 翻译字典：每种语言一个对象，key 相同、value 不同
const translations = {
  zh: {
    appName: 'LinkDigest',
    tagline: '把任何长文章变成 1 分钟能读完的精华',
    subtitle: '粘贴链接，AI 帮你提炼摘要和关键要点',
    inputPlaceholder: '粘贴网页链接，例如 https://example.com/article',
    summarize: '生成摘要',
    loading: '生成中…',
    resultTitle: '摘要结果',
    historyTitle: '历史记录',
    copy: '复制',
    copied: '已复制 ✓',
    exportMd: '导出 MD',
    clear: '清空',
    errorGeneric: '出错了，请重试',
    errorNetwork: '无法连接服务器，请确认后端已启动',
    languageSwitch: 'EN', // 按钮显示"要切换到的语言"
    footer: 'LinkDigest · 太长不看',
  },
  en: {
    appName: 'LinkDigest',
    tagline: 'Turn any long article into a 1-minute read',
    subtitle: 'Paste a link, let AI distill the summary and key points',
    inputPlaceholder: 'Paste a web link, e.g. https://example.com/article',
    summarize: 'Summarize',
    loading: 'Generating…',
    resultTitle: 'Summary',
    historyTitle: 'History',
    copy: 'Copy',
    copied: 'Copied ✓',
    exportMd: 'Export MD',
    clear: 'Clear',
    errorGeneric: 'Something went wrong, please retry',
    errorNetwork: 'Cannot reach the server, please make sure the backend is running',
    languageSwitch: '中文',
    footer: 'LinkDigest · TL;DR',
  },
}

// 创建 Context（初始为 null，用 Provider 提供真实值）
const LanguageContext = createContext(null)

// Provider 组件：包裹整个应用，持有当前语言状态
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('zh')

  // 语言切换时，同步更新 <html lang="..."> 属性（利于浏览器翻译和可访问性）
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // 当前语言的字典；toggleLang 在中英文间切换
  const t = translations[lang]
  const toggleLang = () => setLang((prev) => (prev === 'zh' ? 'en' : 'zh'))

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

// 自定义 Hook：组件里调用 useLanguage() 就能拿到 { lang, t, toggleLang }
export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage 必须在 LanguageProvider 内部使用')
  }
  return ctx
}
