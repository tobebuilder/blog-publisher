# 博客内容创作与多平台分发系统 (Blog Publisher)

本项目是一个包含内容创作、自动发布与多端分发的现代化博客系统闭环。其核心理念是：**将 Obsidian 作为唯一的内容生产端，一键将笔记转化为公开博客，并为未来的多平台（微信公众号、Twitter）分发提供基础。**

## 🏗️ 项目架构

项目由两个核心子工程组成：

### 1. `blog` (Next.js 博客系统端)
基于 Next.js 16 + Tailwind CSS 构建的现代化前端博客，结合 Supabase (PostgreSQL) + Prisma 7 作为数据驱动。

- **动态渲染**：支持 Markdown 实时转译渲染，配合 `gray-matter` 自动剥离 Frontmatter 并优雅展示内容。
- **安全的 API 层**：提供基于 Bearer Token 的增删改查接口，仅允许合法的创作端向外暴露内容。
- **连接池管理**：适配了 Edge 环境和最新版 Prisma 的 `adapter-pg` 模式，确保应用连接池在开发和生产环境下极其稳定。

**主要技术栈**：
- Next.js 16 (App Router)
- Prisma 7 (使用 `@prisma/adapter-pg` 与 `pg` 驱动以适配 Supabase PgBouncer)
- Supabase (PostgreSQL)
- Tailwind CSS

### 2. `obsidian-plugin` (Obsidian 创作端插件)
基于 Obsidian 官方 API 开发的发布器插件。使你在日常记笔记的同时，能无缝把内容推向公网。

- **自动化工作流**：点击侧边栏的“小飞机”图标，插件会自动解析当前文档的 YAML 属性（标题、标签等），并发送至后端。
- **智能回调**：第一次发布成功后，后端会生成唯一的 `slug`，插件会自动将其写回 Markdown 文件的 Frontmatter 中。
- **状态同步**：再次发布时，插件会识别已存在的 `slug` 并发起 Update 请求，实现文章的无缝更新。

## 🚀 快速启动

### 前置要求
- Node.js (v20+)
- 一个 Supabase 账号及数据库实例
- Obsidian 客户端

### 启动博客系统
```bash
cd blog

# 1. 安装依赖
npm install

# 2. 配置环境变量
# 复制一份 .env.local 并填入你的 Supabase 密码及密钥
# 注意：密码需避免使用包含 $ 等特殊符号，或保证其未被破坏转义
cp .env.example .env.local

# 3. 生成 Prisma 客户端并同步数据库
npx prisma generate
npx prisma db push

# 4. 启动开发服务器
npm run dev
```
打开浏览器访问 `http://localhost:3000` 即可看到博客首页。

### 编译并安装 Obsidian 插件
```bash
cd obsidian-plugin

# 1. 安装依赖
npm install

# 2. 编译插件 (监视模式)
npm run dev
```
- 将编译好的 `main.js`, `manifest.json` 等文件拷贝至你的 Obsidian 库的 `.obsidian/plugins/obsidian-plugin` 目录下。
- 在 Obsidian 设置中开启此插件，并填入你博客的 API URL (如 `http://localhost:3000`) 以及鉴权 Token。

## 🛣️ 演进路线图 (Roadmap)

- **Phase 1 [已完成]**: 博客前后端基础搭建，完成数据库与 Prisma 适配。
- **Phase 2 [已完成]**: Obsidian 发布插件 MVP，实现端到端的自动解析、发布及内容双向更新。
- **Phase 3 [规划中]**: 多平台分发 (微信公众号草稿箱、X/Twitter 自动推文)。

## 📝 贡献与维护
如果你需要对 AI 提供本项目的底层技术细节与代码结构，请参考博客目录下的 `AGENTS.md` 文件。
