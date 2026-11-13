'use client'

import { useState, useEffect } from 'react'
import {
  MapPin,
  Clock,
  Plus,
  CheckCircle2,
  Lock,
  Share2,
  Copy,
  Check,
  QrCode,
  Sparkles,
  ShoppingBag,
  Trash2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'
import type { Drop, ItemEntry } from '@/lib/store'
import { formatTimeLeft, formatCurrency, platformConfig, cn } from '@/lib/utils'

interface DropDetailViewProps {
  drop: Drop
  currentUserId: string
  currentUserName: string
  isHost: boolean
  onAddItem: (data: { description: string; estimatedCost: number }) => void
  onToggleItem: (itemId: string) => void
  onDeleteItem?: (itemId: string) => void
  onUpdateStatus?: (status: 'active' | 'locked' | 'completed') => void
  onSimulateNeighbor?: () => void
}

const QUICK_SUGGESTIONS: Record<string, { name: string; price: number }[]> = {
  zepto: [
    { name: 'Amul Taaza Milk 500ml', price: 28 },
    { name: 'Brown Bread 400g', price: 45 },
    { name: 'Lays Gourmet Chips', price: 30 },
    { name: 'Diet Coke 300ml', price: 40 },
  ],
  blinkit: [
    { name: 'Farm Fresh Eggs (6-pack)', price: 55 },
    { name: 'Amul Butter 100g', price: 58 },
    { name: 'Mother Dairy Curd 400g', price: 35 },
    { name: 'Bananas (500g)', price: 40 },
  ],
  zomato: [
    { name: 'Butter Naan', price: 45 },
    { name: 'Gulab Jamun (2 pcs)', price: 70 },
    { name: 'Thums Up (Cold Can)', price: 40 },
    { name: 'Mint Raita', price: 35 },
  ],
}

export default function DropDetailView({
  drop,
  currentUserId,
  currentUserName,
  isHost,
  onAddItem,
  onToggleItem,
  onDeleteItem,
  onUpdateStatus,
  onSimulateNeighbor,
}: DropDetailViewProps) {
  const [timeLeft, setTimeLeft] = useState(() => formatTimeLeft(drop.expiresAt))
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedUpi, setCopiedUpi] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)
  const [paidStatus, setPaidStatus] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setTimeLeft(formatTimeLeft(drop.expiresAt))
    const interval = setInterval(() => {
      setTimeLeft(formatTimeLeft(drop.expiresAt))
    }, 1000)
    return () => clearInterval(interval)
  }, [drop.expiresAt])

  const platform = platformConfig[drop.platform]
  const totalCost = drop.items.reduce((sum, item) => sum + item.estimatedCost, 0)
  const isLocked = drop.status === 'locked' || drop.status === 'completed'
  const isCompleted = drop.status === 'completed'

  // Member grouping for Split-Wise View
  const memberBreakdown = drop.items.reduce((acc, item) => {
    if (!acc[item.userId]) {
      acc[item.userId] = {
        userId: item.userId,
        userName: item.userName,
        items: [],
        subtotal: 0,
      }
    }
    acc[item.userId].items.push(item)
    acc[item.userId].subtotal += item.estimatedCost
    return acc
  }, {} as Record<string, { userId: string; userName: string; items: ItemEntry[]; subtotal: number }>)

  // Ensure members who joined but haven't added items yet are listed
  drop.members.forEach((memberId) => {
    if (!memberBreakdown[memberId]) {
      memberBreakdown[memberId] = {
        userId: memberId,
        userName: memberId === drop.hostId ? drop.hostName : memberId === currentUserId ? currentUserName : 'Neighbor',
        items: [],
        subtotal: 0,
      }
    }
  })

  const memberCount = Object.keys(memberBreakdown).length || 1
  const deliveryFee = drop.deliveryFee || platform.deliveryFee || 35
  const splitDeliveryPerPerson = Math.round(deliveryFee / memberCount)
  const individualDeliverySaved = Math.max(0, deliveryFee - splitDeliveryPerPerson)

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const numericCost = parseFloat(cost)
    if (!description.trim() || isNaN(numericCost) || numericCost <= 0) return
    onAddItem({
      description: description.trim(),
      estimatedCost: numericCost,
    })
    setDescription('')
    setCost('')
  }

  const handleQuickAdd = (item: { name: string; price: number }) => {
    onAddItem({
      description: item.name,
      estimatedCost: item.price,
    })
  }

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const hostUpi = `${drop.hostName.toLowerCase().replace(/\s+/g, '')}@okaxis`

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(hostUpi)
    setCopiedUpi(true)
    setTimeout(() => setCopiedUpi(false), 2000)
  }

  const togglePaid = (userId: string) => {
    setPaidStatus((prev) => ({ ...prev, [userId]: !prev[userId] }))
  }

  const suggestions = QUICK_SUGGESTIONS[drop.platform] || QUICK_SUGGESTIONS.zepto

  return (
    <div className="space-y-4 pb-24">
      {/* Platform & Status Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-xs',
                platform.accentBg,
                platform.accentText
              )}
            >
              {platform.letter}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base text-gray-900">{platform.label} Pool</span>
                <span
                  className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full capitalize',
                    isCompleted
                      ? 'bg-blue-100 text-blue-700'
                      : isLocked
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  )}
                >
                  {isCompleted ? 'Order Placed' : isLocked ? 'Cart Locked' : 'Active Room'}
                </span>
              </div>
              <p className="text-xs text-gray-500">Hyper-Local bulk order</p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3 text-red-500" />
              <span className="text-xs font-bold tabular-nums">
                {isLocked ? 'Locked' : timeLeft}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5">Cut-off countdown</span>
          </div>
        </div>

        {/* Pickup spot & Host Info */}
        <div className="bg-gray-50 rounded-xl p-3 flex items-start justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-gray-700 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#F95919] shrink-0" />
              <span>Pickup: <strong className="font-bold text-gray-900">{drop.pickupLocation}</strong></span>
            </div>
            <div className="text-gray-500 pl-5">
              Host: <span className="font-semibold text-gray-800">{drop.hostName}</span>
              {isHost && <span className="text-orange-600 font-bold ml-1">(You)</span>}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1 bg-white border border-gray-200 px-2.5 py-1.5 rounded-lg text-gray-700 hover:text-gray-900 shadow-2xs font-semibold cursor-pointer shrink-0"
          >
            {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Share2 className="w-3 h-3 text-gray-500" />}
            <span className="text-[11px]">{copiedLink ? 'Copied!' : 'Share Room'}</span>
          </button>
        </div>

        {/* Savings banner */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="text-xs font-semibold text-orange-950">
              Each member saves <span className="font-bold text-orange-600">₹{individualDeliverySaved}</span> on delivery fees!
            </span>
          </div>
          <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full shrink-0">
            ₹0 Fee Plan
          </span>
        </div>

        {/* Host Control Actions */}
        {isHost && (
          <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-2">
            {!isLocked && (
              <button
                type="button"
                onClick={() => onUpdateStatus?.('locked')}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Cart & Place Order on {platform.label}</span>
              </button>
            )}
            {isLocked && !isCompleted && (
              <>
                <button
                  type="button"
                  onClick={() => onUpdateStatus?.('completed')}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Order Placed on {platform.label}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateStatus?.('active')}
                  className="py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Re-open Cart
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* PRD Section 03: Collaborative Cart & Checklist */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-[#F95919]" />
              <span>Bulk Order Cart</span>
              <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full ml-1">
                {drop.items.length} items
              </span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {isHost
                ? 'Check items off as you add them to the delivery app'
                : 'Host reviews and adds these to the bulk order'}
            </p>
          </div>

          {onSimulateNeighbor && (
            <button
              type="button"
              onClick={onSimulateNeighbor}
              className="text-[11px] font-bold text-orange-600 hover:text-orange-700 bg-orange-50 border border-orange-200 px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              title="Test real-time neighbor collaboration"
            >
              <Sparkles className="w-3 h-3 text-orange-500" />
              <span>+ Demo Neighbor</span>
            </button>
          )}
        </div>

        {/* Cart Checklist items */}
        {drop.items.length === 0 ? (
          <div className="text-center py-6 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">No items submitted yet</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Add your items below to include them in {drop.hostName}&apos;s order!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {drop.items.map((item) => {
              const isMine = item.userId === currentUserId
              return (
                <div
                  key={item.id}
                  className={cn(
                    'p-3 rounded-xl border transition-all flex items-center gap-3',
                    item.checked
                      ? 'bg-emerald-50/40 border-emerald-100 text-gray-500'
                      : 'bg-white border-gray-100 hover:border-gray-200 shadow-2xs'
                  )}
                >
                  {/* Host checklist checkbox */}
                  {isHost ? (
                    <button
                      type="button"
                      onClick={() => onToggleItem(item.id)}
                      className={cn(
                        'w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0',
                        item.checked
                          ? 'bg-emerald-500 border-emerald-600 text-white'
                          : 'border-gray-300 hover:border-orange-500 bg-white'
                      )}
                      title="Mark as added to delivery app"
                    >
                      {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  ) : (
                    <div
                      className={cn(
                        'w-5 h-5 rounded-md flex items-center justify-center shrink-0',
                        item.checked
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-gray-100 text-gray-400'
                      )}
                    >
                      {item.checked ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      )}
                    </div>
                  )}

                  {/* Description & User */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-xs sm:text-sm font-semibold truncate',
                          item.checked ? 'line-through text-gray-400' : 'text-gray-900'
                        )}
                      >
                        {item.description}
                      </span>
                      {item.checked && (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded shrink-0">
                          Added to {platform.label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5">
                      <span className="font-medium text-gray-600">{item.userName}</span>
                      {isMine && <span className="text-orange-600 font-bold">(You)</span>}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs sm:text-sm font-extrabold text-gray-900">
                      {formatCurrency(item.estimatedCost)}
                    </span>
                    {(isMine || isHost) && onDeleteItem && (
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        className="text-gray-300 hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* PRD Section 03: Item Submission Form */}
        {!isLocked ? (
          <div className="pt-2 border-t border-gray-100 space-y-2.5">
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
              + Add Item to Bulk Order
            </span>

            {/* Quick add chips */}
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickAdd(s)}
                  className="text-[11px] bg-gray-50 hover:bg-orange-50 hover:border-orange-200 border border-gray-200 text-gray-700 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  + {s.name} <strong className="text-gray-900">₹{s.price}</strong>
                </button>
              ))}
            </div>

            <form onSubmit={handleAddItem} className="flex gap-2">
              <input
                type="text"
                placeholder="Item name (e.g. Amul Butter 100g)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-medium"
              />
              <div className="relative w-24">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="Cost"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full pl-6 pr-2 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-bold"
                />
              </div>
              <button
                type="submit"
                disabled={!description.trim() || !cost}
                className={cn(
                  'px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all cursor-pointer',
                  description.trim() && cost
                    ? 'bg-[#F95919] hover:bg-[#E54807] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-center gap-2 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Cart is currently locked. The host is placing the consolidated order on {platform.label}.
            </span>
          </div>
        )}
      </div>

      {/* PRD Section 03: Cost Splitting & Settlement (Split-Wise View) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
        <div>
          <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Split-Wise Settlement Breakdown</span>
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Transparent itemized cost split and direct Host reimbursement
          </p>
        </div>

        {/* Member by member breakdown */}
        <div className="space-y-2.5">
          {Object.values(memberBreakdown).map((member) => {
            const isMemberHost = member.userId === drop.hostId
            const isMe = member.userId === currentUserId
            const itemTotal = member.subtotal
            // Delivery fee is split among members
            const memberFee = member.items.length > 0 ? splitDeliveryPerPerson : 0
            const memberTotalOwed = itemTotal + memberFee
            const isPaid = paidStatus[member.userId]

            return (
              <div
                key={member.userId}
                className={cn(
                  'p-3 rounded-xl border text-xs space-y-2',
                  isMe ? 'bg-orange-50/40 border-orange-200' : 'bg-gray-50 border-gray-100'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-900 text-sm">{member.userName}</span>
                    {isMemberHost && (
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded">
                        Host
                      </span>
                    )}
                    {isMe && (
                      <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.2 rounded">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-sm text-gray-900">
                      {formatCurrency(memberTotalOwed)}
                    </span>
                    <span className="text-[10px] text-gray-400 block">Total share</span>
                  </div>
                </div>

                {/* Sub-itemization */}
                <div className="flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-200/60 pt-1.5">
                  <span>
                    Items: {formatCurrency(itemTotal)} ({member.items.length} items)
                  </span>
                  <span>
                    Delivery split:{' '}
                    <span className="text-emerald-600 font-bold">
                      {formatCurrency(memberFee)}
                    </span>{' '}
                    <span className="line-through text-gray-400 font-normal">
                      ₹{deliveryFee}
                    </span>
                  </span>
                </div>

                {/* Hopper Reimbursement toggle */}
                {!isMemberHost && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-gray-500">
                      Reimbursement to Host ({drop.hostName}):
                    </span>
                    <button
                      type="button"
                      onClick={() => togglePaid(member.userId)}
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors',
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      )}
                    >
                      {isPaid ? <Check className="w-3 h-3 text-emerald-600" /> : null}
                      <span>{isPaid ? 'Settled via UPI' : 'Pending Payment'}</span>
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Total Summary */}
        <div className="bg-slate-900 text-white rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Combined Cart Items</span>
            <span className="font-semibold text-white">{formatCurrency(totalCost)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Platform Delivery Fee ({platform.label})</span>
            <div className="flex items-center gap-1">
              <span className="line-through text-slate-400">₹{deliveryFee * memberCount}</span>
              <span className="font-semibold text-emerald-400">₹{deliveryFee} (Pooled)</span>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-2 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-300">Total Group Bill</span>
              <span className="text-[10px] text-emerald-400 block">
                Total savings: ₹{(memberCount - 1) * deliveryFee}
              </span>
            </div>
            <span className="text-lg font-extrabold text-orange-400">
              {formatCurrency(totalCost + deliveryFee)}
            </span>
          </div>
        </div>

        {/* Host Payment Settlement Details */}
        <div className="bg-orange-50/60 border border-orange-100 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-900 block">Reimburse Host via UPI</span>
              <span className="text-[11px] text-gray-600">Send your share directly to {drop.hostName}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-1 text-[11px] font-bold text-orange-700 bg-white border border-orange-200 px-2 py-1 rounded-lg cursor-pointer hover:bg-orange-50"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Show QR</span>
            </button>
          </div>

          <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-orange-200/80">
            <span className="text-xs font-mono font-bold text-gray-800">{hostUpi}</span>
            <button
              type="button"
              onClick={handleCopyUpi}
              className="text-[11px] font-bold text-orange-600 flex items-center gap-1 hover:text-orange-700 cursor-pointer"
            >
              {copiedUpi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedUpi ? 'Copied' : 'Copy UPI'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <h4 className="font-bold text-gray-900 text-base">Pay {drop.hostName}</h4>
            <div className="w-48 h-48 mx-auto bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-4">
              <QrCode className="w-28 h-28 text-gray-800" />
              <span className="text-[10px] font-mono font-bold text-gray-500 mt-2">{hostUpi}</span>
            </div>
            <p className="text-xs text-gray-500">
              Scan with GPay, PhonePe, Paytm, or BHIM to settle your share.
            </p>
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
