import { updateDropStatus } from '@/lib/store'

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params
    const body = await request.json()
    const { status } = body

    if (!status || !['active', 'locked', 'completed'].includes(status)) {
      return Response.json({ error: 'Valid status is required' }, { status: 400 })
    }

    const drop = updateDropStatus(id, status)
    if (!drop) {
      return Response.json({ error: 'Drop not found' }, { status: 404 })
    }
    return Response.json({ drop })
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
}
