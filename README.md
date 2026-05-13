# 🚀 Obsidian 博客一键发布系统 (Blog Publisher)

**还在为了发一篇博客，在各种平台之间复制粘贴、重新排版吗？**

本项目为你提供了一个**完美的终极解决方案**：**在 Obsidian 里写完笔记，只需点击一下“小飞机”按钮，就能瞬间发布到你自己的个人博客网站上！**

完全自动化，不需要手动导出 Markdown，不需要处理图片路径，更不需要去网页后台粘贴代码。

---

## ✨ 核心特色

1. **✍️ Obsidian 完美集成**：在 Obsidian 中创作，修改后再次点击发布，博客会自动无缝更新！
2. **⚡️ 极速的现代博客前台**：基于最新 Next.js 16 + Tailwind CSS 构建，极简风格，秒开体验，对搜索引擎（SEO）极其友好。
3. **🔒 你的数据你做主**：结合免费且强大的 Supabase (PostgreSQL) 数据库，所有文章数据都掌握在你自己手里。
4. **🌐 准备好面向未来**：基础架构已为未来的“一键分发到微信公众号、Twitter”做好了准备。

---

## 🛠️ 项目结构

这个开源项目包含两个部分，你需要分别把它们跑起来：
- `blog`：这是你的博客网站（网页端），也就是别人访问你网址时看到的网站。
- `obsidian-plugin`：这是装在你本地电脑 Obsidian 里的插件，负责把文章发送给网站。

---

## 📖 小白专属部署指南

不用害怕代码，跟着下面的步骤，几分钟就能拥有你自己的硬核极客博客！

### 第一步：准备一个免费数据库 (Supabase)
你的文章总得有个地方存，我们推荐免费又好用的 Supabase：
1. 注册并登录 [Supabase](https://supabase.com/)。
2. 点击 "New Project" 创建一个新项目，记住你设置的**数据库密码**。
3. 项目创建好后，进入设置里的 "Database" 页面，找到你的 `Transaction connection pooler` (连接池地址) 和 `Direct connection` (直连地址)。

### 第二步：部署你的博客网站
1. 克隆或者下载本仓库的代码。
2. 进入 `blog` 文件夹。
3. 复制 `.env.example` 文件，重命名为 `.env.local`。
4. 打开 `.env.local`，填入你刚才在 Supabase 拿到的数据库地址，并自己随便想一个超级复杂的密码作为 `BLOG_API_TOKEN`（这是你以后发文章的钥匙，别告诉别人）：
   ```env
   # 示例：
   DATABASE_URL="postgresql://postgres.xxx:你的密码@aws-0-xxxx.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
   DIRECT_URL="postgresql://postgres.xxx:你的密码@aws-0-xxxx.pooler.supabase.com:5432/postgres"
   BLOG_API_TOKEN="这里随便填一段很长的密码，比如 my-super-secret-token-123"
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"
   ```
5. 打开终端，在这个文件夹下运行以下命令把网站跑起来：
   ```bash
   npm install            # 安装依赖
   npx prisma db push     # 把表结构推送到你的数据库
   npx prisma generate    # 生成数据库客户端
   npm run dev            # 启动！
   ```
   *提示：跑通后，你可以把 `blog` 文件夹直接部署到 Vercel 或 Cloudflare Pages 上，享受免费的全球 CDN 网站托管。*

### 第三步：安装 Obsidian 插件
1. 进入 `obsidian-plugin` 文件夹。
2. 运行打包命令：
   ```bash
   npm install
   npm run build
   ```
3. 打包完成后，会生成 `main.js` 等文件。
4. 在你的电脑上找到 Obsidian 笔记的隐藏插件目录（通常在 `你的仓库路径/.obsidian/plugins/`），在里面新建一个文件夹叫 `blog-publisher`。
5. 把 `obsidian-plugin` 目录下的 `main.js`、`manifest.json`、`styles.css` 这三个文件复制到刚才新建的文件夹里。
6. 重启 Obsidian，在设置 -> 第三方插件中，启用 "Blog Publisher" 插件。

### 第四步：起飞！配置并发布
1. 在 Obsidian 的插件设置里，找到你刚装的插件。
2. 填入你博客的地址：
   - 如果是本地测试，填：`http://localhost:3000`
   - 如果部署到了公网，填你的域名：`https://你的域名.com`
3. 填入你刚才在环境变量里设置的那个 `BLOG_API_TOKEN`。
4. **发布文章**：打开你写好的一篇笔记，点击 Obsidian 左侧边栏的 ✈️（小飞机）图标，或者使用命令面板搜索 "Publish to Blog"。
5. 去你的网站看看吧，文章已经奇迹般地出现了！🎉

---

## 💡 使用小技巧 (Slug设置)

为了让你的文章链接看起来更专业（有利于 SEO 和分享），强烈建议你在 Obsidian 的笔记开头手动加上一段 `slug` 英文路径属性。
例如：
```yaml
---
title: 如何一键部署博客
slug: how-to-deploy-blog
---
```
如果不加，系统默认会把你的中文标题当做链接，在分享时会变成一串难看的乱码。

---

## 🤝 参与贡献

这是一个开源项目，欢迎提交 Pull Request 或者 Issue！
我们未来的计划：
- [ ] 微信公众号同步草稿箱功能
- [ ] X/Twitter 发文同步功能

如果你想对本项目进行二次开发，可以参考 `AGENTS.md` 文件了解底层架构。
