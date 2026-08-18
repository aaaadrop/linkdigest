// ============================================
// LinkDigest 后端入口（Node.js + Express）
// 类比 Java Web：这是"main() 方法"，负责启动服务器
//
// 逻辑：
// - 直接运行（node server/index.js）→ 启动常驻服务器（本地开发/自托管）
// - 被其他模块导入（Serverless 平台）→ 导出 app（平台按请求调用）
// 判断方式：require.main === module（Node 标准，不依赖平台环境变量）
// ============================================

// 引入 Express 应用核心（中间件 + 全部路由）
const app = require('./app.js')

// ---- 启动逻辑 ----
if (require.main === module) {
  // 本地/自托管环境：启动常驻服务器
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`LinkDigest 后端已启动: http://localhost:${PORT}`)
  })
} else {
  // Serverless 环境：导出 app（平台按请求调用）
  module.exports = app
}
