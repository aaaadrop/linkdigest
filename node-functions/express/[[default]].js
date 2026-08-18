// ============================================
// EdgeOne Node Functions Express Entry
// 官方要求：导出 Express 实例（不 listen），由平台按请求调用
// ============================================

process.env.PLATFORM = 'edgeone'

const serverApp = require('../../server/index.js')

module.exports = serverApp
