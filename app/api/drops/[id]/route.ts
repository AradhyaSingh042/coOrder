import { getDrop } from '@/lib/store'

export async function GET(
  _req: Request,
  ctx: RouteContext<'/api/drops/[id]'>
) {
  const { id } = await ctx.params
  const drop = getDrop(id)
  if (!drop) {
    return Response.json({ error: 'Drop not found' }, { status: 404 })
  }
  return Response.json({ drop })
}
