// ============================================
// EdgeOne Node Functions 入口（Express）
// 文件路径约定：./node-functions/express/[[default]].js
// 访问路径：example.com/express/* 都会进入此函数
//
// 官方要求：导出 Express 实例（不 listen），由平台按请求调用
// ============================================

import express from 'express'
// 引入我们的 Express 应用（复用全部路由逻辑）
import serverApp from '../../server/index.js'

// EdgeOne 要求导出 Express 实例本身
const app = serverApp || express()

export default app
