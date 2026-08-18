# ⚡ LinkDigest — 网页链接 AI 摘要助手

> **太长不看？** 粘贴一个网页链接，AI 帮你提炼成 1 分钟能读完的精华摘要 + 关键要点。

LinkDigest 是一个前后端分离的全栈 AI 应用：用户输入网址，后端抓取网页正文，调用 DeepSeek 大模型生成结构化摘要（一句话核心摘要 + 3-5 条关键要点），前端展示并支持复制、导出 Markdown、历史记录管理。支持中英文界面与输出。

---

## ✨ 功能特性

- 🔗 **一键摘要**：粘贴网页链接，自动抓取正文并生成摘要 + 要点
- 🌐 **中英文切换**：界面语言与 AI 输出语言联动（自研轻量 i18n）
- 🗂️ **历史记录**：SQLite 持久化存储，刷新/重启不丢失
- 📋 **一键复制**：摘要 + 要点复制到剪贴板
- 📄 **导出 Markdown**：生成 `.md` 文件下载
- 🛡️ **友好错误处理**：区分网页不可访问 / 无正文内容 / AI 服务异常等场景，双语提示
- ⏳ **加载动画**：生成中 spinner 反馈
- 📱 **响应式布局**：移动端适配

---

## 🛠️ 技术栈

| 层 | 技术 | 说明 |
|---|---|---|
| 前端 | React 19 + Vite 8 | 组件化 UI，HMR 开发 |
| 后端 | Node.js + Express 5 | REST API 服务 |
| 数据库 | SQLite (better-sqlite3) | 零配置文件型数据库 |
| AI | DeepSeek API | 大模型生成摘要（`deepseek-chat`） |
| 其他 | axios / dotenv / cors | HTTP 请求 / 环境变量 / 跨域 |

---

## 🚀 快速开始

### 前置要求

- Node.js ≥ 18
- DeepSeek API key（[platform.deepseek.com](https://platform.deepseek.com) 注册获取）

### 1. 安装依赖

```bash
# 前端
npm install

# 后端
cd server
npm install
```

### 2. 配置密钥

```bash
cd server
cp .env.example .env   # Windows: copy .env.example .env
# 编辑 .env，填入你的 DeepSeek API key
```

### 3. 启动开发服务器

```bash
# 终端 1：启动后端（端口 3001）
cd server
node index.js

# 终端 2：启动前端（端口 5173）
npm run dev
```

浏览器打开 **http://localhost:5173/** 即可使用。

---

## 🔌 API 接口

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/api/health` | 健康检查 |
| `POST` | `/api/summarize` | 生成摘要。请求体：`{ "url": "...", "lang": "zh" }` |
| `GET` | `/api/history` | 获取最近 20 条历史记录 |

### `/api/summarize` 示例

```json
// 请求
{ "url": "https://example.com/article", "lang": "zh" }

// 响应
{
  "summary": "一句话核心摘要",
  "points": ["要点1", "要点2", "要点3"]
}
```

---

## 📁 项目结构

```
linkdigest/
├── src/                  # 前端（React）
│   ├── App.jsx           # 主页面组件
│   ├── i18n.jsx          # 国际化系统（中英文）
│   ├── App.css           # 页面样式
│   └── main.jsx          # 入口
├── server/               # 后端（Express）
│   ├── index.js          # 服务器入口 + 路由 + AI 调用
│   ├── db.js             # SQLite 数据库模块
│   └── .env.example      # 密钥配置模板
└── README.md
```

---

## 🏗️ 核心设计

- **前后端分离**：前端 5173 / 后端 3001，通过 REST API 通信，职责清晰
- **Prompt 工程**：`response_format: json_object` 强制结构化输出；`temperature: 0.3` 保证摘要稳定性
- **成本控制**：网页正文截断至 6000 字符再送入模型，兼顾质量与 token 成本
- **错误分级**：网页抓取失败(400) / 无正文(400) / AI 服务异常(502) / 未知错误(500)，用户可见友好提示
- **安全实践**：API 密钥存于 `.env`（git 忽略），数据库文件不入库

---

## 📸 截图

> 待补充：请将页面截图放入 `docs/screenshots/` 目录并在此引用。

---

## 📝 开发笔记

详细的开发过程记录（每天做了什么、为什么、踩了什么坑）见 [PROJECT_NOTES](PROJECT_NOTES.md)。

---

## 📄 License

MIT
