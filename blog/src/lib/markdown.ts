import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'
import matter from 'gray-matter'

/**
 * 将 Markdown 内容转换为 HTML 字符串（会自动去除 YAML frontmatter）
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const { content } = matter(markdown)
  const result = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(content)
  return result.toString()
}

/**
 * 从内容提取前 N 个字的摘要
 */
export function extractExcerpt(content: string, maxLength = 120): string {
  // 去除 frontmatter、标题、代码块、图片等标记
  const plain = content
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/#+\s+.*/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '$1')
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return plain.length > maxLength ? plain.slice(0, maxLength) + '...' : plain
}

/**
 * 生成 slug（从标题）
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
    || Date.now().toString()
}
