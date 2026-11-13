import { v4 as uuidv4 } from 'uuid'

export type Platform = 'zepto' | 'blinkit' | 'zomato'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  building: string
  upiId?: string
}

export interface ItemEntry {
  id: string
  userId: string
  userName: string
  description: string
  estimatedCost: number
  checked: boolean // host marks as added to real delivery app cart
}

export interface Drop {
  id: string
  hostId: string
  hostName: string
  platform: Platform
  pickupLocation: string
  building: string
  waitMinutes: number // 10, 15, or 20
  createdAt: number // Date.now()
  expiresAt: number // createdAt + waitMinutes * 60000
  status: 'active' | 'locked' | 'completed'
  members: string[] // user IDs who joined
  items: ItemEntry[]
  deliveryFee: number
  splitSavings: number
}

// Global in-memory storage singleton that survives fast-refresh in dev
interface GlobalStore {
  users: Map<string, User>
  drops: Map<string, Drop>
  seeded: boolean
}

declare global {
  // eslint-disable-next-line no-var
  var __coorder_store__: GlobalStore | undefined
}

const store: GlobalStore = globalThis.__coorder_store__ ?? {
  users: new Map<string, User>(),
  drops: new Map<string, Drop>(),
  seeded: false,
}
globalThis.__coorder_store__ = store

export function getActiveDrops(building?: string | null): Drop[] {
  const now = Date.now()
  const all = Array.from(store.drops.values())

  // Keep demo drops fresh if they expire during testing
  for (const d of all) {
    if (d.expiresAt <= now && d.status === 'active') {
      d.expiresAt = now + (d.waitMinutes || 15) * 60 * 1000
    }
  }

  if (!building || building === 'all') {
    return all.filter((d) => d.status !== 'completed')
  }

  const filtered = all.filter(
    (d) =>
      (d.building.toLowerCase() === building.toLowerCase() ||
        d.building.toLowerCase().includes(building.toLowerCase()) ||
        building.toLowerCase().includes(d.building.toLowerCase())) &&
      d.status !== 'completed'
  )

  // If user selected a building with no active drops yet, fallback to all sector drops so feed is never barren
  return filtered.length > 0 ? filtered : all.filter((d) => d.status !== 'completed')
}

export function getAllDrops(): Drop[] {
  return Array.from(store.drops.values())
}

export function getDrop(id: string): Drop | null {
  return store.drops.get(id) ?? null
}

export function getUserDrops(userId: string): Drop[] {
  return Array.from(store.drops.values()).filter(
    (d) => d.hostId === userId || d.members.includes(userId)
  )
}

export function createDrop(
  data: Omit<Drop, 'id' | 'createdAt' | 'expiresAt' | 'status' | 'members' | 'items' | 'deliveryFee' | 'splitSavings'> & {
    deliveryFee?: number
    splitSavings?: number
  }
): Drop {
  const now = Date.now()
  const wait = data.waitMinutes || 15
  const deliveryFee = data.deliveryFee ?? (data.platform === 'zomato' ? 50 : data.platform === 'blinkit' ? 40 : 35)
  const splitSavings = data.splitSavings ?? deliveryFee

  const drop: Drop = {
    ...data,
    id: uuidv4(),
    createdAt: now,
    expiresAt: now + wait * 60000,
    status: 'active',
    members: [data.hostId],
    items: [],
    deliveryFee,
    splitSavings,
  }
  store.drops.set(drop.id, drop)
  return drop
}

export function updateDropStatus(dropId: string, status: 'active' | 'locked' | 'completed'): Drop | null {
  const drop = store.drops.get(dropId)
  if (!drop) return null
  drop.status = status
  return drop
}

export function joinDrop(dropId: string, userId: string): Drop | null {
  const drop = store.drops.get(dropId)
  if (!drop) return null
  if (!drop.members.includes(userId)) {
    drop.members.push(userId)
  }
  return drop
}

export function addItem(
  dropId: string,
  item: Omit<ItemEntry, 'id' | 'checked'>
): Drop | null {
  const drop = store.drops.get(dropId)
  if (!drop) return null
  const newItem: ItemEntry = {
    ...item,
    id: uuidv4(),
    checked: false,
  }
  drop.items.push(newItem)
  if (!drop.members.includes(item.userId)) {
    drop.members.push(item.userId)
  }
  return drop
}

export function removeItem(dropId: string, itemId: string): Drop | null {
  const drop = store.drops.get(dropId)
  if (!drop) return null
  drop.items = drop.items.filter((i) => i.id !== itemId)
  return drop
}

export function toggleItemCheck(dropId: string, itemId: string): Drop | null {
  const drop = store.drops.get(dropId)
  if (!drop) return null
  const item = drop.items.find((i) => i.id === itemId)
  if (item) {
    item.checked = !item.checked
  }
  return drop
}

export function getOrCreateUser(data: {
  name: string
  email: string
  building: string
  upiId?: string
}): User {
  for (const user of store.users.values()) {
    if (user.email.toLowerCase() === data.email.toLowerCase()) {
      user.building = data.building
      if (data.upiId) user.upiId = data.upiId
      return user
    }
  }
  const user: User = {
    id: uuidv4(),
    name: data.name,
    email: data.email,
    building: data.building,
    upiId: data.upiId ?? `${data.name.toLowerCase().replace(/\s+/g, '')}@okaxis`,
  }
  store.users.set(user.id, user)
  return user
}

export function seedDemoData(): void {
  store.users.clear()
  store.drops.clear()

  // 1. Host 1: Aman (matching mockup)
  const aman = getOrCreateUser({
    name: 'Aman',
    email: 'aman@godrejwoods.com',
    building: 'Godrej Woods, Tower B',
    upiId: 'aman.sharma@okhdfcbank',
  })

  // 2. Host 2: Priya S. (matching mockup)
  const priya = getOrCreateUser({
    name: 'Priya S.',
    email: 'priya.s@godrejwoods.com',
    building: 'Godrej Woods, Tower B',
    upiId: 'priyas@oksbi',
  })

  // 3. Host 3: Vikram (matching mockup)
  const vikram = getOrCreateUser({
    name: 'Vikram',
    email: 'vikram.k@godrejwoods.com',
    building: 'Godrej Woods, Tower B',
    upiId: 'vikramk@paytm',
  })

  // Neighbors for Candor TechSpace
  const rahul = getOrCreateUser({
    name: 'Rahul V.',
    email: 'rahul.v@candortech.com',
    building: 'Candor TechSpace, Tower A',
    upiId: 'rahulv@icici',
  })

  const sneha = getOrCreateUser({
    name: 'Sneha Roy',
    email: 'sneha@candortech.com',
    building: 'Candor TechSpace, Tower A',
    upiId: 'snehar@okaxis',
  })

  const now = Date.now()

  // Drop 1: Zepto started by Aman (Mockup 2)
  const drop1 = createDrop({
    hostId: aman.id,
    hostName: aman.name,
    platform: 'zepto',
    pickupLocation: 'Tower B Lobby, Godrej Woods',
    building: 'Godrej Woods, Tower B',
    waitMinutes: 15,
    deliveryFee: 35,
    splitSavings: 35,
  })
  drop1.createdAt = now
  drop1.expiresAt = now + 4 * 60 * 1000 + 27 * 1000 // 04:27 left
  addItem(drop1.id, {
    userId: aman.id,
    userName: 'Aman',
    description: 'Amul Taaza Toned Milk (500ml)',
    estimatedCost: 28,
  })
  addItem(drop1.id, {
    userId: priya.id,
    userName: 'Priya S.',
    description: 'Lays Gourmet Lime & Herb',
    estimatedCost: 30,
  })
  addItem(drop1.id, {
    userId: rahul.id,
    userName: 'Rahul V.',
    description: 'Britannia Bourbon Biscuits',
    estimatedCost: 24,
  })
  joinDrop(drop1.id, priya.id)
  joinDrop(drop1.id, rahul.id)

  // Drop 2: Blinkit started by Priya S. (Mockup 2)
  const drop2 = createDrop({
    hostId: priya.id,
    hostName: priya.name,
    platform: 'blinkit',
    pickupLocation: 'Clubhouse Entrance Gate 2',
    building: 'Godrej Woods, Tower B',
    waitMinutes: 10,
    deliveryFee: 40,
    splitSavings: 40,
  })
  drop2.createdAt = now
  drop2.expiresAt = now + 9 * 60 * 1000 + 45 * 1000
  addItem(drop2.id, {
    userId: priya.id,
    userName: 'Priya S.',
    description: 'Farm Fresh Organic Eggs (6-pack)',
    estimatedCost: 55,
  })
  addItem(drop2.id, {
    userId: vikram.id,
    userName: 'Vikram',
    description: 'Mother Dairy Curd (400g)',
    estimatedCost: 35,
  })
  joinDrop(drop2.id, vikram.id)

  // Drop 3: Zomato started by Vikram (Mockup 2)
  const drop3 = createDrop({
    hostId: vikram.id,
    hostName: vikram.name,
    platform: 'zomato',
    pickupLocation: 'Tower D Visitor Parking',
    building: 'Godrej Woods, Tower B',
    waitMinutes: 20,
    deliveryFee: 50,
    splitSavings: 50,
  })
  drop3.createdAt = now
  drop3.expiresAt = now + 8 * 60 * 1000 + 12 * 1000 // 08:12 left
  addItem(drop3.id, {
    userId: vikram.id,
    userName: 'Vikram',
    description: 'Behrouz Dum Biryani (Regular)',
    estimatedCost: 380,
  })
  addItem(drop3.id, {
    userId: aman.id,
    userName: 'Aman',
    description: 'Gulab Jamun (2 pcs)',
    estimatedCost: 100,
  })
  joinDrop(drop3.id, aman.id)

  // Drop 4 for Candor TechSpace, Tower A
  const drop4 = createDrop({
    hostId: rahul.id,
    hostName: rahul.name,
    platform: 'zepto',
    pickupLocation: 'Cafeteria Wing C, Candor TechSpace',
    building: 'Candor TechSpace, Tower A',
    waitMinutes: 15,
    deliveryFee: 35,
    splitSavings: 35,
  })
  drop4.createdAt = now
  drop4.expiresAt = now + 12 * 60 * 1000
  addItem(drop4.id, {
    userId: rahul.id,
    userName: 'Rahul V.',
    description: 'Red Bull Energy Drink (250ml)',
    estimatedCost: 125,
  })
  addItem(drop4.id, {
    userId: sneha.id,
    userName: 'Sneha Roy',
    description: 'Cheetos Masala Balls (2 packs)',
    estimatedCost: 40,
  })
  joinDrop(drop4.id, sneha.id)

  store.seeded = true
}

// Seed initially if not seeded
if (!store.seeded || store.drops.size === 0) {
  seedDemoData()
}
