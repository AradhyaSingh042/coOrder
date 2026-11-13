import { getOrCreateUser } from '@/lib/store'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, building } = body

    if (!name || !email || !building) {
      return Response.json(
        { error: 'name, email, and building are required' },
        { status: 400 }
      )
    }

    const user = getOrCreateUser({ name, email, building })
    return Response.json({ user })
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
}
