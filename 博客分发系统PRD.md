---
title: 博客内容创作与多平台分发系统 PRD
date: 2026-05-12
status: 草稿
tags: [PRD, 博客, 自媒体, Obsidian]
---

# 博客内容创作与多平台分发系统 PRD

**文档版本**：v1.0  
**创建日期**：2026-05-12  
**作者**：个人项目  

---

## 一、项目背景

作为独立开发者和内容创作者，日常在 Obsidian 中记录思考、创业感悟和技术笔记。现有痛点是：写完内容后需要手动复制到各平台（博客、公众号、X），排版繁琐、效率低，且内容分散无法统一管理。

本项目目标是：**以 Obsidian 为写作中心，一键将内容发布到个人博客，并同步分发到微信公众号和 X（Twitter）。**

---

## 二、目标用户

**主要用户：作者本人（单人使用）**

- 独立开发者 / 内容创作者
- 日常使用 Obsidian 写作
- 同时运营个人博客、微信公众号、X 账号
- 有一定技术背景，可自行部署和维护

---

## 三、产品目标

| 目标 | 描述 |
|------|------|
| 写作体验 | 在 Obsidian 中完成全部写作，无需切换工具 |
| 一键发布 | 通过插件命令将笔记发布到博客，无需手动操作 |
| 多平台分发 | 博客发布后可一键推送到公众号草稿箱和 X |
| 内容展示 | 博客网站对外公开，支持 SEO，读者可访问 |
| 数据自有 | 所有内容存储在自己的数据库，不依赖第三方平台 |

---

## 四、系统架构

```
Obsidian（写作端）
    │
    │  Obsidian 插件（读取笔记 + 调用 API）
    ▼
博客后端 API（Next.js，部署到 Vercel/服务器）
    │
    ├── 博客前台（公开展示，SEO 友好）
    │
    └── 分发服务
            ├── 微信公众号草稿箱 API
            └── X（Twitter）API v2
```

---

## 五、功能模块

### 5.1 Obsidian 插件

**核心功能：**

- **发布到博客**：读取当前笔记内容和 frontmatter，调用博客 API 创建或更新文章
- **更新文章**：已发布的文章修改后可同步更新
- **分发到公众号**：将文章推送到微信公众号草稿箱
- **分发到 X**：将文章标题 + 摘要 + 链接发布为一条推文
- **发布状态显示**：在笔记中显示当前发布状态（未发布 / 已发布 / 已分发）

**笔记 frontmatter 规范：**

```yaml
---
title: 文章标题
date: 2026-05-12
tags: [创业, 思考]
slug: startup-thoughts-01        # URL 路径，不填则自动生成
cover: attachments/cover.png     # 封面图（可选）
status: draft                    # draft | published
platforms:                       # 已发布的平台记录
  blog: false
  wechat: false
  twitter: false
---
```

**插件设置项：**

- 博客 API 地址
- API Key（鉴权）
- 微信公众号 AppID / AppSecret
- X API Key / Access Token

---

### 5.2 博客后端 API

**技术栈：** Next.js 15 App Router + PostgreSQL + Prisma

**API 接口列表：**

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/posts` | 创建文章 |
| PUT | `/api/posts/:slug` | 更新文章 |
| GET | `/api/posts` | 获取文章列表（公开） |
| GET | `/api/posts/:slug` | 获取文章详情（公开） |
| POST | `/api/distribute/wechat` | 推送到公众号草稿箱 |
| POST | `/api/distribute/twitter` | 发布推文 |

**鉴权：** 所有写操作通过 Bearer Token 鉴权，Token 在环境变量中配置。

**文章数据结构：**

```typescript
interface Post {
  id: string
  title: string
  slug: string          // URL 唯一标识
  content: string       // Markdown 原文
  contentHtml: string   // 渲染后的 HTML
  tags: string[]
  coverUrl?: string
  status: 'draft' | 'published'
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

---

### 5.3 博客前台

**技术栈：** Next.js（与后端同一项目）

**页面列表：**

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | 文章列表，分页展示 |
| 文章详情 | `/posts/:slug` | Markdown 渲染，支持代码高亮 |
| 标签页 | `/tags/:tag` | 按标签筛选文章 |
| 关于 | `/about` | 个人介绍（静态页） |

**SEO 要求：**
- 每篇文章生成独立 meta title / description
- 支持 Open Graph（微信/X 分享时显示封面和摘要）
- 静态生成（SSG）提升加载速度

---

### 5.4 微信公众号分发

**实现方式：** 调用微信公众号「草稿箱」接口

**流程：**
1. 插件触发分发命令
2. 后端将 Markdown 转换为微信支持的富文本 HTML
3. 上传封面图到微信素材库
4. 调用草稿箱接口创建草稿
5. 作者在公众号后台手动点击发布

**限制说明：** 微信不提供直接发布 API，只能推送到草稿箱，需手动发布。这已省去排版和复制粘贴的工作。

---

### 5.5 X（Twitter）分发

**实现方式：** 调用 Twitter API v2

**推文格式：**
```
{文章标题}

{文章前 100 字摘要}...

{博客文章链接}

{标签} #创业 #独立开发
```

**API 限制：** 免费版每月可发 500 条推文，个人使用完全够用。

---

## 六、MVP 范围（第一版）

第一版只做核心链路，验证可用性：

- [x] Obsidian 插件：发布文章到博客
- [x] 博客后端：文章 CRUD API
- [x] 博客前台：文章列表 + 详情页
- [ ] ~~微信公众号分发~~（第二版）
- [ ] ~~X 分发~~（第二版）
- [ ] ~~标签页~~（第二版）
- [ ] ~~关于页~~（第二版）

**MVP 验收标准：**
在 Obsidian 中写一篇文章，执行「发布」命令，能在博客网站上看到这篇文章。

---

## 七、技术选型

| 模块 | 技术 | 理由 |
|------|------|------|
| Obsidian 插件 | TypeScript | Obsidian 官方插件语言 |
| 博客后端 | Next.js 15 | 前后端同一项目，部署简单 |
| 数据库 | PostgreSQL + Prisma | 结构清晰，类型安全 |
| 部署 | Vercel | 免费，自动 CI/CD |
| Markdown 渲染 | remark + rehype | 生态完整，支持代码高亮 |
| 样式 | Tailwind CSS | 开发效率高 |

---

## 八、开发计划

### Phase 1：博客基础（2 周）

**Week 1**
- [ ] 搭建 Next.js 项目结构
- [ ] 配置 PostgreSQL + Prisma 数据模型
- [ ] 实现文章 CRUD API（含鉴权）
- [ ] 博客前台：文章列表页

**Week 2**
- [ ] 博客前台：文章详情页（Markdown 渲染 + 代码高亮）
- [ ] SEO：meta 标签 + Open Graph
- [ ] 部署到 Vercel

### Phase 2：Obsidian 插件（1 周）

- [ ] 初始化 Obsidian 插件项目
- [ ] 实现 frontmatter 解析
- [ ] 实现「发布到博客」命令
- [ ] 实现「更新文章」命令
- [ ] 插件设置页面（API 地址 + API Key）

### Phase 3：多平台分发（1 周）

- [ ] 接入 X API v2，实现发推功能
- [ ] 接入微信公众号草稿箱 API
- [ ] Obsidian 插件增加分发命令
- [ ] frontmatter 中记录发布状态

---

## 九、风险与注意事项

| 风险          | 说明                 | 应对               |
| ----------- | ------------------ | ---------------- |
| 微信 API 限制   | 公众号无直接发布 API，只能推草稿 | 接受限制，推草稿后手动发布    |
| X API 收费    | 免费版有发推数量限制         | 个人使用 500 条/月足够   |
| 图片处理        | 微信图片需上传到微信素材库      | 发布时自动上传          |
| Vercel 免费限制 | 数据库需要外部 PostgreSQL | 使用 Supabase 免费套餐 |

---

## 十、未来规划（v2+）

- 文章数据统计（阅读量、来源）
- 支持更多平台（掘金、知乎）
- 定时发布功能
- 图片自动压缩和 CDN 上传
- 评论系统（utterances 或自建）
