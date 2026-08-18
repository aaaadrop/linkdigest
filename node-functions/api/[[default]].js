// ============================================
// EdgeOne Node Functions 入口（Express）
// 文件路径约定：./node-functions/api/[[default]].js
// 访问路径：example.com/api/* 都会进入此函数（与 Express 路由 /api/* 匹配）
//
// EdgeOne 官方要求：导出 Express 实例（不 listen），由平台按请求调用
// 本项目后端为 CommonJS（server/package.json: "type": "commonjs"），故用 CJS 导出
// ============================================

// 标记 EdgeOne 平台（db.js 据此切换存储模式）
process.env.PLATFORM = 'edgeone'

// 引入我们的 Express 应用（require 时 require.main !== module，会导出 app 而不 listen）
const serverApp = require('../../server/index.js')

// 导出 Express 实例给 EdgeOne
module.exports = serverApp
