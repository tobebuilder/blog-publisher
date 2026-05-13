import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { markdownToHtml, extractExcerpt } from '@/lib/markdown'

function checkAuth(req: NextRequest): boolean {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  return token === process.env.BLOG_API_TOKEN
}

type RouteParams = { params: Promise<{ slug: string }> }

// GET /api/posts/:slug — 获取文章详情（公开）
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params
    const post = await prisma.post.findUnique({ where: { slug } })
    if (!post) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }
    return NextResponse.json(post)
  } catch (error) {
    console.error('[GET /api/posts/:slug]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT /api/posts/:slug — 更新文章（需鉴权）
export async function PUT(req: NextRequest, { params }: RouteParams) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { slug } = await params
    const body = await req.json()
    const { title, content, tags, coverUrl, status } = body

    const existing = await prisma.post.findUnique({ where: { slug } })
    if (!existing) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (tags !== undefined) updateData.tags = tags
    if (coverUrl !== undefined) updateData.coverUrl = coverUrl

    if (content !== undefined) {
      updateData.content = content
      updateData.contentHtml = await markdownToHtml(content)
      updateData.excerpt = extractExcerpt(content)
    }

    if (status !== undefined) {
      updateData.status = status
      if (status === 'published' && !existing.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }

    const post = await prisma.post.update({ where: { slug }, data: updateData })
    return NextResponse.json(post)
  } catch (error) {
    console.error('[PUT /api/posts/:slug]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
