import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '所有文章',
  description: '独立开发者的思考、创业感悟与技术笔记',
}

export const revalidate = 60 // ISR: 每 60 秒重新生成

async function getPosts(page = 1) {
  const pageSize = 10
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        tags: true,
        coverUrl: true,
        publishedAt: true,
      },
    }),
    prisma.post.count({ where: { status: 'published' } }),
  ])
  return { posts, total, totalPages: Math.ceil(total / pageSize) }
}

function formatDate(date: Date | null) {
  if (!date) return ''
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageStr } = await searchParams
  const page = parseInt(pageStr ?? '1')
  const { posts, total, totalPages } = await getPosts(page)

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* 页面标题 */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-white">所有文章</h1>
        <p className="mt-2 text-gray-400">共 {total} 篇</p>
      </div>

      {/* 文章列表 */}
      {posts.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          <p className="text-4xl mb-4">📝</p>
          <p>还没有文章，快去 Obsidian 写一篇吧！</p>
        </div>
      ) : (
        <ul className="space-y-0 divide-y divide-white/5">
          {posts.map((post: typeof posts[number]) => (
            <li key={post.id} className="group py-8 first:pt-0">
              <Link href={`/posts/${post.slug}`} className="block space-y-3">
                {/* 标签 */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-block rounded-full bg-indigo-500/10 px-3 py-0.5 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 标题 */}
                <h2 className="text-xl font-semibold text-white group-hover:text-indigo-400 transition-colors leading-snug">
                  {post.title}
                </h2>

                {/* 摘要 */}
                {post.excerpt && (
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                )}

                {/* 日期 */}
                <p className="text-xs text-gray-500">
                  {formatDate(post.publishedAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-3">
          {page > 1 && (
            <Link
              href={`/?page=${page - 1}`}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 hover:border-indigo-500 hover:text-white transition-colors"
            >
              ← 上一页
            </Link>
          )}
          <span className="rounded-lg bg-white/5 px-4 py-2 text-sm text-gray-400">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/?page=${page + 1}`}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 hover:border-indigo-500 hover:text-white transition-colors"
            >
              下一页 →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
