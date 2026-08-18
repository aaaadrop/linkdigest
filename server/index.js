// ============================================
// LinkDigest 后端入口（Node.js + Express）
// 类比 Java Web：这就是那个"包含 main() 方法的程序"
// ============================================

// 引入依赖（类比 Java 的 import）
const express = require('express')
const cors = require('cors')

// 创建应用实例（类比 new 一个 Spring 应用）
const app = express()

// 中间件配置：
// express.json() —— 让后端能解析前端发来的 JSON 请求体（类比 @RequestBody）
// cors() —— 允许浏览器跨端口访问（前端5173 -> 后端3001），否则浏览器会拦截
app.use(express.json())
app.use(cors())

// 路由 1：健康检查接口（类比 @GetMapping("/api/health")）
// 作用：测试后端是否活着。前端/浏览器访问它，返回 { status: 'ok' }
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// 路由 2：摘要接口（类比 @PostMapping("/api/summarize")）
// 作用：接收前端传来的网址，后续这里会调用 DeepSeek 生成摘要
// 现在先返回一个占位响应，验证前后端通路
app.post('/api/summarize', (req, res) => {
  const { url } = req.body // 取前端发来的 url（类比 request.getParameter）
  console.log('收到摘要请求:', url)
  res.json({
    summary: '这里将显示 AI 生成的摘要（功能开发中）',
    points: ['功能开发中'],
  })
})

// 启动服务器（类比运行 main()）
// 监听 3001 端口，浏览器访问 http://localhost:3001/api/health 就能测到
const PORT = 3001
app.listen(PORT, () => {
  console.log(`LinkDigest 后端已启动: http://localhost:${PORT}`)
})
