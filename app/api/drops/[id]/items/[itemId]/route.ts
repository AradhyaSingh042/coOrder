import { removeItem } from '@/lib/store'

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await ctx.params
    const drop = removeItem(id, itemId)
    if (!drop) {
      return Response.json({ error: 'Drop not found' }, { status: 404 })
    }
    return Response.json({ drop })
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
}
