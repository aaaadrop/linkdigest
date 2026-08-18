# PROJECT_NOTES — LinkDigest 开发笔记

> 铁律：每完成一步，在这里记一句"做了什么 / 为什么这样做 / 踩了什么坑"。
> 这是两周后写简历 bullet point 和面试讲稿的素材库。
> 约定：**最新记录在最上面（倒序，同 git log）**，新记录插到第一个"##"之前。

## 2026-08-18（D2）README 添加截图 ✅
- **做了什么**：用户截图中/英文界面两张图，放入 docs/screenshots/，README 截图章节引用；重命名中文截图
- **为什么**：带截图的 README 更有吸引力，面试官/GitHub 访客第一印象更好
- **踩了什么坑**：① 新增截图文件触发 Vite 监视器 EBUSY 崩溃（Windows 特性，和之前写入文件同一类问题）② README 被 dev server 锁住需先停进程再改
- **简历素材**：项目文档可视化（截图规范命名与引用）

## 2026-08-18（D2）编写完整 README ✅
- **做了什么**：把 Vite 模板 README 重写为项目正式 README：项目介绍/功能特性(8项)/技术栈表/快速开始(3步)/API文档(3接口+示例)/项目结构/核心设计(5点)/截图占位；开发笔记同步复制进项目(PROJECT_NOTES.md)使链接有效
- **为什么**：README 是项目门面，面试官和 GitHub 访客第一眼看它；规范结构体现工程素养
- **踩了什么坑**：README 引用 PROJECT_NOTES.md 但笔记原在工作区，需同步副本进项目
- **简历素材**：规范的 README 写作（行业标准结构）；项目文档化能力

## 2026-08-18（D2）体验打磨五件套 ✅
- **做了什么**：① 加载动画：按钮内 spinner 转圈动画（CSS keyframes）② 复制摘要：navigator.clipboard 一键复制 + 2秒"已复制✓"反馈 ③ 导出 Markdown：Blob + a[download] 生成 .md 文件下载 ④ 历史展开/收起：点击条目切换显示要点（expandedId 状态）⑤ 清空按钮：输入框内 ✕ 一键清空
- **为什么**：都是高频实用小功能，提升产品完整度；每个功能独立、代码量小，是简历上的"细节优化"素材
- **踩了什么坑**：① 验证模块编译时"error"关键字误报（console.log 含 error 字样），需精确查 SyntaxError 确认；② 小屏适配：清空按钮绝对定位在竖排布局下错位，需媒体查询覆盖
- **简历素材**：剪贴板 API（navigator.clipboard）；Blob 文件导出；CSS 动画；列表交互展开/收起

## 2026-08-18（D2）SQLite 历史记录 ✅
- **做了什么**：新增 server/db.js（better-sqlite3，建 summaries 表，saveSummary 插入 / getHistory 查询），/api/summarize 成功后自动存库，新增 GET /api/history 接口；前端 useEffect 页面加载拉历史 + 提交成功后刷新 + 历史列表展示
- **为什么**：数据库是简历必备故事线；SQLite 零配置起步；独立 db.js 模块（类比 DAO 层）
- **踩了什么坑**：① linkdigest.db 误入库——数据库文件是运行时数据不应进 git，.gitignore 加 *.db 并用 git rm --cached 移除，git ls-files 验证；② 重启后端验证数据持久化成功（id:1 仍在）
- **简历素材**：SQLite 数据库设计（表结构/CRUD/JSON 序列化）；数据持久化；页面生命周期（useEffect 初始化加载）

## 2026-08-18（D2）体验打磨：AI跟随语言 + 错误分类 ✅
- **做了什么**：① 前端提交请求时携带 lang 参数，后端把语言指令拼进 prompt，AI 按界面语言输出（中/英测试均通过）② 后端错误分类：抓取失败(400)/无正文内容(400)/AI服务失败(502)/未知错误(500)，每种错误返回中英文对应提示 ③ 前端区分后端错误与网络错误，展示友好文案
- **为什么**：错误分类让用户看到"能行动的提示"（检查网址/稍后重试）而不是裸报错；AI 语言跟随界面提升体验一致性
- **踩了什么坑**：① PowerShell curl.exe 传中文引号 JSON 时引号被吞导致请求体损坏(400 JSON parse error)，改用 --data-binary @文件 方式解决——是测试工具问题，非项目 bug；② 测试时需区分"接口逻辑"与"测试命令"问题
- **简历素材**：错误处理设计（分类+用户友好提示）；参数化 prompt（语言跟随）；多场景测试验证（中/英/404/不存在域名）

## 2026-08-18（D2）接入 DeepSeek API —— 项目"活"了 ✅
- **做了什么**：/api/summarize 从占位改为真实功能：① axios 抓网页（带浏览器 UA 头防反爬、15s 超时）② 正则去 HTML 标签提取正文、截断 6000 字符 ③ 调 DeepSeek chat API（deepseek-chat 模型、temperature 0.3、response_format 强制 JSON）④ 返回 {summary, points} 结构化结果。密钥存 server/.env（git 已忽略），提供 .env.example 模板
- **为什么**：后端抓取是业界常规（分层设计：后端做脏活）；低 temperature + 强制 JSON 保证输出稳定可解析；截断正文省钱 + 防超上下文
- **踩了什么坑**：① 密钥安全：.env 必须加进 .gitignore，用 git check-ignore 验证未入库 ② 真实测试用阮一峰周刊页面成功返回摘要（"禄丰恐龙谷…"），验证端到端链路
- **简历素材**：完整实现 LLM 应用核心链路（网页抓取→文本提取→Prompt 工程→结构化输出）；安全实践（密钥隔离、.env 管理）；调用真实 API 的经验

## 2026-08-18（D2）后端搭建 + 前后端联调 ✅
- **做了什么**：创建 server/ 后端（Node.js + Express 5 + cors），定义 /api/health 与 /api/summarize 两个接口；前端表单改为 fetch 调用后端，页面增加结果卡片展示区
- **为什么**：前后端分离架构，前端5173 / 后端3001，职责清晰；先占位返回再逐步加 AI 功能（MVP 思路）
- **踩了什么坑**：① 改前端文件时 Vite dev server 锁住文件导致 ReplaceFileW EIO，需先停 node 进程再改；② PowerShell Invoke-WebRequest 读取含中文响应时用错字符集显示乱码，但文件本身 UTF-8 健康（用 ReadAllText UTF-8 验证）；③ 已用"读文件字节"方式确认所有文件无 BOM
- **简历素材**：设计并实现 REST API（GET/POST 路由、JSON 请求/响应、CORS 配置）；前后端联调打通完整数据流

## 2026-08-18（D1）首页界面 + 中英文切换 ✅
- **做了什么**：重写 App.jsx 为 LinkDigest 首页（logo+语言切换按钮+标题+输入框+生成按钮），自研轻量 i18n（React Context + 翻译字典 + useLanguage Hook），写入 i18n.jsx
- **为什么**：不引第三方 i18n 库——代码少、无依赖、学习价值高；简历亮点"实现轻量国际化系统"
- **踩了什么坑**：① 我的文件写入工具用临时文件方式写文件，触发 Vite 文件监视器 EBUSY 崩溃（Windows 特性），解决：写文件时临时文件自动清理后重启 dev server；② BOM 检查通过：所有源码文件均无 BOM 头
- **简历素材**：设计并实现了基于 React Context 的国际化系统，支持中英文一键切换；组件化重构 Vite 模板

## 2026-08-18（D1）搭建项目骨架 ✅
- **做了什么**：用 Vite 8 + React 19 创建项目骨架，安装依赖，git 首次提交（d628afa），dev server 验证通过（HTTP 200）
- **为什么**：先搭最小可运行骨架，再逐块加功能（MVP 思路）；git 备份保证任何修改可回滚
- **踩了什么坑**：沙箱对工作目录的写权限问题导致命令无法执行，后来调整了权限策略解决
- **简历素材**：从零搭建 React + Vite 项目环境，并用 git 管理版本

## 待记录
（每完成一步，往上加一条）
