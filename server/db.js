// ============================================
// LinkDigest 数据库模块（SQLite）
// 类比 Java 的 DAO 层：专门负责读写数据库
// ============================================

const Database = require('better-sqlite3')
const path = require('path')

// 数据库文件放在 server 目录下：linkdigest.db
const db = new Database(path.join(__dirname, 'linkdigest.db'))

// 建表（如果不存在）：类比 Java 里的建表 SQL
// IF NOT EXISTS —— 只建一次，重复启动不会报错
db.exec(`
  CREATE TABLE IF NOT EXISTS summaries (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    url        TEXT NOT NULL,
    summary    TEXT NOT NULL,
    points     TEXT NOT NULL,
    lang       TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  )
`)

// 保存一条摘要记录（类比 insert 方法）
// points 是数组，存库时转成 JSON 字符串
function saveSummary({ url, summary, points, lang }) {
  const stmt = db.prepare(
    'INSERT INTO summaries (url, summary, points, lang) VALUES (?, ?, ?, ?)'
  )
  const info = stmt.run(url, summary, JSON.stringify(points), lang)
  return info.lastInsertRowid // 返回新记录的自增 id
}

// 查询最近的历史记录（类比 select 方法）
// 按时间倒序，最多返回 20 条
function getHistory(limit = 20) {
  const stmt = db.prepare(
    'SELECT * FROM summaries ORDER BY id DESC LIMIT ?'
  )
  const rows = stmt.all(limit)
  // 把存库时的 JSON 字符串还原成数组，返回给前端
  return rows.map((row) => ({
    id: row.id,
    url: row.url,
    summary: row.summary,
    points: JSON.parse(row.points),
    lang: row.lang,
    createdAt: row.created_at,
  }))
}

module.exports = { saveSummary, getHistory }
