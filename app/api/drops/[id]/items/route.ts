import { addItem } from '@/lib/store'

export async function POST(
  request: Request,
  ctx: RouteContext<'/api/drops/[id]/items'>
) {
  try {
    const { id } = await ctx.params
    const body = await request.json()
    const { userId, userName, description, estimatedCost } = body

    if (!userId || !userName || !description || estimatedCost == null) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const drop = addItem(id, { userId, userName, description, estimatedCost })
    if (!drop) {
      return Response.json({ error: 'Drop not found' }, { status: 404 })
    }
    return Response.json({ drop })
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
}
