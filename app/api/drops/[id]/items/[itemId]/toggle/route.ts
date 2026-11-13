import { toggleItemCheck } from '@/lib/store'

export async function POST(
  _req: Request,
  ctx: RouteContext<'/api/drops/[id]/items/[itemId]/toggle'>
) {
  const { id, itemId } = await ctx.params
  const drop = toggleItemCheck(id, itemId)
  if (!drop) {
    return Response.json({ error: 'Drop or item not found' }, { status: 404 })
  }
  return Response.json({ drop })
}
