import { type NextRequest } from 'next/server'
import { getActiveDrops, createDrop } from '@/lib/store'

export async function GET(request: NextRequest) {
  const building = request.nextUrl.searchParams.get('building')
  const drops = getActiveDrops(building)
  return Response.json({ drops })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { hostId, hostName, platform, pickupLocation, building, waitMinutes } = body

    if (!hostId || !hostName || !platform || !pickupLocation || !building) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const drop = createDrop({
      hostId,
      hostName,
      platform,
      pickupLocation,
      building,
      waitMinutes: waitMinutes ? Number(waitMinutes) : 15,
    })
    return Response.json({ drop })
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
}
