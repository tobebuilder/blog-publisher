import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { markdownToHtml, extractExcerpt, generateSlug } from '@/lib/markdown'

function checkAuth(req: NextRequest): boolean {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  return token === process.env.BLOG_API_TOKEN
}

// GET /api/posts — 获取已发布文章列表（公开）
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const pageSize = parseInt(searchParams.get('pageSize') ?? '10')
    const tag = searchParams.get('tag')

    const where = {
      status: 'published',
      ...(tag ? { tags: { has: tag } } : {}),
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
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
          createdAt: true,
        },
      }),
      prisma.post.count({ where }),
    ])

    return NextResponse.json({
      posts,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    })
  } catch (error) {
    console.error('[GET /api/posts]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/posts — 创建文章（需鉴权）
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { title, content, tags = [], coverUrl, status = 'draft', slug: rawSlug } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'title and content are required' }, { status: 400 })
    }

    const slug = generateSlug(rawSlug || title)
    const contentHtml = await markdownToHtml(content)
    const excerpt = extractExcerpt(content)

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        contentHtml,
        excerpt,
        tags,
        coverUrl,
        status,
        publishedAt: status === 'published' ? new Date() : null,
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    console.error('[POST /api/posts]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
