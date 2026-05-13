<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# 博客内容创作与多平台分发系统

以 Obsidian 为写作中心，一键发布到个人博客，并同步分发到微信公众号和 X（Twitter）。

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 15 App Router |
| 语言 | TypeScript |
| 数据库 | PostgreSQL（Supabase）+ Prisma ORM（prisma-client-js） |
| 样式 | Tailwind CSS |
| Markdown 渲染 | remark + rehype + gray-matter |
| 部署 | Vercel |

## 项目结构

```
src/
└── app/
    ├── api/
    │   ├── posts/
    │   │   ├── route.ts         # GET（列表）+ POST（创建）
    │   │   └── [slug]/
    │   │       └── route.ts     # GET（详情）+ PUT（更新）
    │   └── distribute/
    │       ├── wechat/route.ts  # 推送公众号草稿（Phase 3）
    │       └── twitter/route.ts # 发推文（Phase 3）
    ├── posts/
    │   └── [slug]/
    │       └── page.tsx         # 文章详情页
    ├── layout.tsx
    └── page.tsx                 # 首页（文章列表）
prisma/
└── schema.prisma                # Post 模型
```

## 关键约定

### API 鉴权
所有写操作（POST/PUT）通过 `Authorization: Bearer <token>` 鉴权：
```ts
const token = req.headers.get('authorization')?.replace('Bearer ', '')
if (token !== process.env.BLOG_API_TOKEN) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

### 环境变量
```
DATABASE_URL=           # Supabase PostgreSQL 连接串
BLOG_API_TOKEN=         # API 鉴权 Token（自定义随机字符串）
NEXT_PUBLIC_SITE_URL=   # 博客公开地址（用于 Open Graph）
```

### Prisma 使用
- 生成器：`prisma-client-js`（非新版 prisma-client）
- 导入路径：`import { PrismaClient } from '@prisma/client'`
- 全局单例：使用 `src/lib/prisma.ts` 中的单例避免开发热重载时连接泄漏

### Markdown 处理
- 使用 `gray-matter` 解析 frontmatter
- 使用 `remark` + `remark-gfm` + `remark-html` 将 Markdown 转为 HTML
- 存储时同时保存原始 Markdown（content）和渲染 HTML（contentHtml）

## 开发命令

```bash
npm run dev                              # 启动开发服务器（localhost:3000）
npx prisma migrate dev --name <name>    # 创建并应用迁移
npx prisma studio                       # 打开数据库 GUI
npx prisma generate                     # 重新生成 Prisma Client
```

## MVP 验收标准

在 Obsidian 中写一篇文章，执行「发布」命令，能在博客首页 `/` 看到文章，点击进入 `/posts/[slug]` 能正确渲染 Markdown。
