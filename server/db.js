// ============================================
// LinkDigest 数据库模块（双模式）
// 类比 Java 的 DAO 层：专门负责读写数据库
//
// 双模式自动切换：
// - Vercel 环境（process.env.VERCEL 存在）→ 用 Postgres（云数据库）
// - 本地开发 → 用 SQLite（零配置）
// 对外接口 saveSummary() / getHistory() 完全一致，上层代码无感知
// ============================================

const path = require('path')

// 是否运行在 Vercel（Serverless 环境）
const isVercel = !!process.env.VERCEL

// ---------- 模式 1：Vercel → Postgres ----------
let pg
let pgPool

if (isVercel) {
  pg = require('pg')
  pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Vercel Postgres 需要 SSL
  })

  // 建表（Postgres 语法）
  pgPool.query(`
    CREATE TABLE IF NOT EXISTS summaries (
      id         SERIAL PRIMARY KEY,
      url        TEXT NOT NULL,
      summary    TEXT NOT NULL,
      points     TEXT NOT NULL,
      lang       TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `).catch((err) => console.error('Postgres 建表失败:', err.message))
}

// ---------- 模式 2：本地 → SQLite ----------
let sqlite
let sqliteDb

if (!isVercel) {
  sqlite = require('better-sqlite3')
  sqliteDb = new sqlite(path.join(__dirname, 'linkdigest.db'))
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS summaries (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      url        TEXT NOT NULL,
      summary    TEXT NOT NULL,
      points     TEXT NOT NULL,
      lang       TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    )
  `)
}

// ---------- 保存一条摘要记录 ----------
// points 是数组，存库时转成 JSON 字符串
async function saveSummary({ url, summary, points, lang }) {
  if (isVercel) {
    // Postgres 版
    await pgPool.query(
      'INSERT INTO summaries (url, summary, points, lang) VALUES ($1, $2, $3, $4)',
      [url, summary, JSON.stringify(points), lang]
    )
  } else {
    // SQLite 版
    const stmt = sqliteDb.prepare(
      'INSERT INTO summaries (url, summary, points, lang) VALUES (?, ?, ?, ?)'
    )
    stmt.run(url, summary, JSON.stringify(points), lang)
  }
}

// ---------- 查询最近的历史记录 ----------
// 按时间倒序，最多返回 20 条
async function getHistory(limit = 20) {
  let rows
  if (isVercel) {
    // Postgres 版
    const result = await pgPool.query(
      'SELECT * FROM summaries ORDER BY id DESC LIMIT $1',
      [limit]
    )
    rows = result.rows
  } else {
    // SQLite 版
    const stmt = sqliteDb.prepare(
      'SELECT * FROM summaries ORDER BY id DESC LIMIT ?'
    )
    rows = stmt.all(limit)
  }
  // 把存库时的 JSON 字符串还原成数组，返回给上层
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
