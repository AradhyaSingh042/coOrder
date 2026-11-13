import { joinDrop } from '@/lib/store'

export async function POST(
  request: Request,
  ctx: RouteContext<'/api/drops/[id]/join'>
) {
  try {
    const { id } = await ctx.params
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return Response.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const drop = joinDrop(id, userId)
    if (!drop) {
      return Response.json({ error: 'Drop not found' }, { status: 404 })
    }
    return Response.json({ drop })
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
}
