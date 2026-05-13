import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'

type Props = { params: Promise<{ slug: string }> }

function formatDate(date: Date | null) {
  if (!date) return ''
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

async function getPost(slug: string) {
  const decodedSlug = decodeURIComponent(slug)
  return prisma.post.findUnique({ where: { slug: decodedSlug, status: 'published' } })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    title: post.title,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      url: `${siteUrl}/posts/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      ...(post.coverUrl ? { images: [{ url: post.coverUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.title,
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      {/* 返回链接 */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors mb-10"
      >
        ← 返回文章列表
      </Link>

      {/* 封面图 */}
      {post.coverUrl && (
        <div className="mb-10 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverUrl}
            alt={post.title}
            className="w-full object-cover max-h-80"
          />
        </div>
      )}

      {/* 文章头部 */}
      <header className="mb-10 space-y-4">
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

        <h1 className="text-3xl font-bold tracking-tight text-white leading-snug">
          {post.title}
        </h1>

        <p className="text-sm text-gray-500">
          发布于 {formatDate(post.publishedAt)}
          {post.updatedAt && post.updatedAt > (post.publishedAt ?? post.createdAt) && (
            <span className="ml-3 text-gray-600">
              · 更新于 {formatDate(post.updatedAt)}
            </span>
          )}
        </p>
      </header>

      {/* 分割线 */}
      <hr className="border-white/10 mb-10" />

      {/* Markdown 内容 */}
      <div
        className="prose prose-invert prose-lg max-w-none
          prose-headings:font-semibold prose-headings:tracking-tight
          prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
          prose-code:bg-white/10 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
          prose-pre:bg-gray-900 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl
          prose-blockquote:border-indigo-500 prose-blockquote:text-gray-400
          prose-img:rounded-xl prose-img:mx-auto"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  )
}
