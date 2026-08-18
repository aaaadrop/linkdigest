// ============================================
// LinkDigest 后端入口（Node.js + Express）
// 类比 Java Web：这就是那个"包含 main() 方法的程序"
// ============================================

// 引入依赖（类比 Java 的 import）
const express = require('express')
const cors = require('cors')
const axios = require('axios') // 用于请求网页 + 调用 DeepSeek API
require('dotenv').config() // 读取 .env 文件里的密钥
const db = require('./db') // 数据库模块（类比 DAO）

// 创建应用实例（类比 new 一个 Spring 应用）
const app = express()

// 中间件配置：
// express.json() —— 让后端能解析前端发来的 JSON 请求体（类比 @RequestBody）
// cors() —— 允许浏览器跨端口访问（前端5173 -> 后端3001），否则浏览器会拦截
app.use(express.json())
app.use(cors())

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

// 路由 1：健康检查接口（类比 @GetMapping("/api/health")）
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// 路由 1.5：历史记录接口（类比 @GetMapping("/api/history")）
app.get('/api/history', (req, res) => {
  const history = db.getHistory()
  res.json(history)
})

// 路由 2：摘要接口（类比 @PostMapping("/api/summarize")）
app.post('/api/summarize', async (req, res) => {
  const { url, lang } = req.body // lang: 'zh' 或 'en'，控制 AI 输出语言
  console.log('收到摘要请求:', url, '语言:', lang)

  try {
    // ---------- 第 1 步：抓取网页正文 ----------
    // 用 axios 请求目标网页，设置浏览器风格的 User-Agent 减少被反爬拦截的概率
    let pageResp
    try {
      pageResp = await axios.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        },
        timeout: 15000, // 15秒超时，防止页面响应太慢卡死
      })
    } catch (err) {
      // 错误分类 1：网页抓取失败（网址打不开/超时/反爬等）
      console.error('网页抓取失败:', err.message)
      return res.status(400).json({
        error:
          lang === 'en'
            ? 'Could not fetch this page. Please check the URL and try again.'
            : '无法访问该网页，请检查网址是否正确、页面是否存在。',
      })
    }
    const html = pageResp.data
    console.log('网页抓取成功，长度:', html.length, '字符')

    // 简单提取正文：去掉 HTML 标签，只保留可见文字
    // （先用最简单的方式，后续可升级为专门的正文提取库）
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ') // 去掉 script 标签
      .replace(/<style[\s\S]*?<\/style>/gi, ' ') // 去掉 style 标签
      .replace(/<[^>]+>/g, ' ') // 去掉所有 HTML 标签
      .replace(/\s+/g, ' ') // 合并多余空白
      .trim()

    // 错误分类 2：页面没有可提取的正文
    if (text.length < 100) {
      console.error('页面正文过短，可能无有效内容')
      return res.status(400).json({
        error:
          lang === 'en'
            ? 'This page has no readable content (it may be a video/PDF/app page).'
            : '该页面没有可读的文字内容（可能是视频、PDF 或需要登录的页面）。',
      })
    }

    // 截断超长内容（省钱 + 防止超过模型上下文限制）
    const MAX_CHARS = 6000
    const trimmed = text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) + '…' : text
    console.log('提取后正文长度:', trimmed.length, '字符')

    // ---------- 第 2 步：调用 DeepSeek 生成摘要 ----------
    // 按界面语言告诉 AI 用哪种语言输出
    const outputLang =
      lang === 'en'
        ? 'Use English. summary: one-sentence core summary (max 60 words). points: 3-5 key points (each max 40 words).'
        : '使用中文。summary：一句话核心摘要（不超过60字）。points：3-5条关键要点（每条不超过40字）。'

    let aiResp
    try {
      aiResp = await axios.post(
        DEEPSEEK_API_URL,
        {
          model: 'deepseek-chat', // DeepSeek 主力对话模型
          messages: [
            {
              role: 'system',
              content:
                '你是一个专业的文章摘要助手。请阅读用户提供的网页正文，输出 JSON 格式的摘要结果，包含两个字段：' +
                'summary 和 points（数组）。只输出 JSON，不要输出其他任何内容。' +
                outputLang,
            },
            { role: 'user', content: `网页正文如下：\n\n${trimmed}` },
          ],
          temperature: 0.3, // 低温度 = 输出更稳定，适合摘要任务
          response_format: { type: 'json_object' }, // 强制模型返回 JSON
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          },
          timeout: 30000,
        }
      )
    } catch (err) {
      // 错误分类 3：AI 服务调用失败（密钥错误/余额不足/服务故障）
      console.error('AI 调用失败:', err.message)
      return res.status(502).json({
        error:
          lang === 'en'
            ? 'AI service error. Please try again later.'
            : 'AI 服务暂时不可用，请稍后再试。',
      })
    }

    // 解析模型返回的 JSON
    const aiContent = aiResp.data.choices[0].message.content
    const result = JSON.parse(aiContent)
    console.log('AI 摘要生成成功:', result.summary)

    // 保存到数据库（历史记录功能）
    db.saveSummary({
      url,
      summary: result.summary,
      points: result.points || [],
      lang: lang || 'zh',
    })
    console.log('已存入数据库')

    res.json(result)
  } catch (err) {
    console.error('摘要生成失败:', err.message)
    res.status(500).json({
      error:
        lang === 'en'
          ? 'Unexpected error. Please try again.'
          : '发生未知错误，请重试。',
      detail: err.message,
    })
  }
})

// 启动服务器（类比运行 main()）
const PORT = 3001
app.listen(PORT, () => {
  console.log(`LinkDigest 后端已启动: http://localhost:${PORT}`)
})
