import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const siteTitle = '个人博客'
const siteDescription = '独立开发者的思考、创业感悟与技术笔记'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${siteTitle}`,
  },
  description: siteDescription,
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: siteUrl,
    siteName: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-950 text-gray-100">
        {/* 导航栏 */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-md">
          <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
            <a href="/" className="text-lg font-semibold tracking-tight hover:text-white transition-colors">
              ✍️ 个人博客
            </a>
            <nav className="flex gap-6 text-sm text-gray-400">
              <a href="/" className="hover:text-white transition-colors">文章</a>
            </nav>
          </div>
        </header>

        {/* 主内容 */}
        <main className="flex-1">
          {children}
        </main>

        {/* 页脚 */}
        <footer className="border-t border-white/10 py-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} 个人博客 · 用 Obsidian 写作，用代码发布</p>
        </footer>
      </body>
    </html>
  )
}
