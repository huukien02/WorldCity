'use client'

import { useState } from 'react'
import { useMapStore } from '../store'
import { getChunkId, getTileKey } from '@/lib/firestore'
import { useClaimTile } from '../hooks/useClaimTile'
import { useCurrentUser } from '@/features/auth/hooks/useAuth'
import { useUserGold } from '@/features/economy/hooks/useUserGold'
import { usePendingGold } from '@/features/economy/hooks/usePendingGold'
import { useHarvest } from '@/features/economy/hooks/useHarvest'
import { useSwapBuilding } from '@/features/building/hooks/useSwapBuilding'
import { useSellBuilding, SELL_REFUND_RATE } from '@/features/building/hooks/useSellBuilding'
import { BuildModal } from '@/features/building/components/BuildModal'
import { CLAIM_COST, BUILDING_CONFIG, BUILDING_EMOJI } from '@/types'

export function TileInfoPanel() {
  const selectedTile = useMapStore((s) => s.selectedTile)
  const chunkData = useMapStore((s) => s.chunkData)
  const movingFrom = useMapStore((s) => s.movingFrom)
  const setMovingFrom = useMapStore((s) => s.setMovingFrom)

  const currentUser = useCurrentUser()
  const { gold } = useUserGold(currentUser?.uid)
  const { claimTile } = useClaimTile()
  const { harvestTile } = useHarvest()
  const { swapBuilding } = useSwapBuilding()
  const { sellBuilding } = useSellBuilding()

  const [claiming, setClaiming] = useState(false)
  const [harvesting, setHarvesting] = useState(false)
  const [swapping, setSwapping] = useState(false)
  const [selling, setSelling] = useState(false)
  const [showSellConfirm, setShowSellConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showBuildModal, setShowBuildModal] = useState(false)
  const [lastEarned, setLastEarned] = useState<number | null>(null)

  const chunkId = selectedTile ? getChunkId(selectedTile.x, selectedTile.y) : ''
  const tileKey = selectedTile ? getTileKey(selectedTile.x, selectedTile.y) : ''
  const tile = selectedTile ? (chunkData[chunkId]?.[tileKey] ?? null) : null
  const isOwner = tile?.ownerId === currentUser?.uid
  const isEmpty = !tile?.ownerId
  const buildingConfig = tile?.buildingType ? BUILDING_CONFIG[tile.buildingType] : null

  const { pending: pendingGold, secondsLeft, canHarvest } = usePendingGold(isOwner ? tile : null)

  const sellRefund = buildingConfig ? Math.floor(buildingConfig.cost * SELL_REFUND_RATE) : 0
  const sellTotal = sellRefund + pendingGold

  // Source tile data when in move mode
  const srcChunkId = movingFrom ? getChunkId(movingFrom.x, movingFrom.y) : ''
  const srcTileKey = movingFrom ? getTileKey(movingFrom.x, movingFrom.y) : ''
  const srcTile = movingFrom ? (chunkData[srcChunkId]?.[srcTileKey] ?? null) : null
  const srcBuildingConfig = srcTile?.buildingType ? BUILDING_CONFIG[srcTile.buildingType] : null

  const isSourceSelected =
    movingFrom != null &&
    selectedTile?.x === movingFrom.x &&
    selectedTile?.y === movingFrom.y

  const isSelectingDestination = movingFrom != null && !isSourceSelected

  function cancelMoveMode() {
    setMovingFrom(null)
    setError(null)
  }

  async function handleClaim() {
    if (!currentUser || !selectedTile) return
    setClaiming(true)
    setError(null)
    try {
      await claimTile(currentUser.uid, currentUser.displayName ?? 'Unnamed', selectedTile.x, selectedTile.y)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định')
    } finally {
      setClaiming(false)
    }
  }

  async function handleHarvest() {
    if (!currentUser || !selectedTile) return
    setHarvesting(true)
    setError(null)
    setLastEarned(null)
    try {
      const earned = await harvestTile(currentUser.uid, selectedTile.x, selectedTile.y)
      setLastEarned(earned)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định')
    } finally {
      setHarvesting(false)
    }
  }

  async function handleSwap() {
    if (!currentUser || !movingFrom || !selectedTile) return
    setSwapping(true)
    setError(null)
    try {
      const result = await swapBuilding(
        currentUser.uid,
        movingFrom.x, movingFrom.y,
        selectedTile.x, selectedTile.y,
      )
      setMovingFrom(null)
      const msg = result === 'swapped' ? '✓ Đã đổi chỗ công trình' : '✓ Đã di chuyển công trình'
      setError(msg)
      setTimeout(() => setError(null), 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định')
    } finally {
      setSwapping(false)
    }
  }

  async function handleSell() {
    if (!currentUser || !selectedTile) return
    setSelling(true)
    setError(null)
    try {
      const earned = await sellBuilding(currentUser.uid, selectedTile.x, selectedTile.y)
      setShowSellConfirm(false)
      setError(`✓ Đã bán — nhận +${earned.toLocaleString()} gold`)
      setTimeout(() => setError(null), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định')
    } finally {
      setSelling(false)
    }
  }

  if (!selectedTile) {
    return (
      <div className="p-4 text-slate-500 text-sm">
        Click vào một ô trên bản đồ để xem thông tin.
      </div>
    )
  }

  // ── Move mode: source tile is selected ──────────────────────────────────
  if (isSourceSelected && srcBuildingConfig) {
    return (
      <div className="p-4 space-y-4">
        <div className="p-3 rounded-lg bg-blue-900/40 border border-blue-500/50">
          <p className="text-blue-300 text-xs font-medium mb-1">Đang di chuyển</p>
          <p className="text-white text-sm">
            {BUILDING_EMOJI[srcTile!.buildingType!]} {srcBuildingConfig.label}
          </p>
          <p className="text-slate-400 text-xs">từ ({movingFrom!.x}, {movingFrom!.y})</p>
        </div>
        <p className="text-slate-300 text-sm">
          Click vào ô đất của bạn để di chuyển hoặc đổi chỗ công trình.
        </p>
        <button
          onClick={cancelMoveMode}
          className="w-full py-2 px-4 rounded-lg border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 text-sm transition-colors"
        >
          Huỷ
        </button>
      </div>
    )
  }

  // ── Move mode: destination tile selected ────────────────────────────────
  if (isSelectingDestination && srcBuildingConfig) {
    const dstBuildingConfig = tile?.buildingType ? BUILDING_CONFIG[tile.buildingType] : null
    const dstOwnedByUser = tile?.ownerId === currentUser?.uid
    const dstIsEmpty = dstOwnedByUser && !tile?.buildingType
    const canConfirm = dstOwnedByUser && (dstIsEmpty || !!dstBuildingConfig)

    return (
      <div className="p-4 space-y-3">
        <div className="p-3 rounded-lg bg-blue-900/40 border border-blue-500/50">
          <p className="text-blue-300 text-xs font-medium mb-1">Di chuyển</p>
          <p className="text-white text-sm">
            {BUILDING_EMOJI[srcTile!.buildingType!]} {srcBuildingConfig.label}
            <span className="text-slate-400 text-xs ml-2">({movingFrom!.x}, {movingFrom!.y})</span>
          </p>
        </div>

        <div className="text-center text-slate-500 text-lg">
          {dstBuildingConfig ? '⇄' : '↓'}
        </div>

        <div className={`p-3 rounded-lg border ${canConfirm ? 'bg-slate-800 border-slate-600' : 'bg-red-900/20 border-red-500/50'}`}>
          <p className={`text-xs font-medium mb-1 ${canConfirm ? 'text-slate-400' : 'text-red-400'}`}>
            {dstBuildingConfig ? 'Đổi với' : 'Đến'}
          </p>
          {dstBuildingConfig ? (
            <p className="text-white text-sm">
              {BUILDING_EMOJI[tile!.buildingType!]} {dstBuildingConfig.label}
              <span className="text-slate-400 text-xs ml-2">({selectedTile.x}, {selectedTile.y})</span>
            </p>
          ) : dstIsEmpty ? (
            <p className="text-emerald-400 text-sm">
              Đất trống ({selectedTile.x}, {selectedTile.y})
            </p>
          ) : (
            <p className="text-red-400 text-xs">
              {!dstOwnedByUser
                ? tile?.ownerId ? 'Đất của người khác' : 'Đất chưa được claim'
                : 'Ô này không hợp lệ'}
            </p>
          )}
        </div>

        {error && (
          <p className={`text-xs ${error.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>{error}</p>
        )}

        <div className="flex gap-2">
          <button
            onClick={cancelMoveMode}
            className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 text-sm transition-colors"
          >
            Huỷ
          </button>
          {canConfirm && (
            <button
              onClick={handleSwap}
              disabled={swapping}
              className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium transition-colors"
            >
              {swapping ? 'Đang xử lý...' : dstBuildingConfig ? 'Đổi chỗ' : 'Di chuyển'}
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Sell confirmation ────────────────────────────────────────────────────
  if (showSellConfirm && buildingConfig && isOwner) {
    return (
      <div className="p-4 space-y-4">
        <div>
          <p className="text-white font-medium mb-1">Bán công trình?</p>
          <p className="text-slate-400 text-xs">
            {BUILDING_EMOJI[tile!.buildingType!]} {buildingConfig.label} tại ({selectedTile.x}, {selectedTile.y})
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-800 border border-slate-700 space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>Hoàn tiền ({Math.round(SELL_REFUND_RATE * 100)}%)</span>
            <span className="text-yellow-400">+{sellRefund.toLocaleString()} gold</span>
          </div>
          {pendingGold > 0 && (
            <div className="flex justify-between text-slate-300">
              <span>Gold tích lũy</span>
              <span className="text-yellow-400">+{pendingGold.toLocaleString()} gold</span>
            </div>
          )}
          <div className="border-t border-slate-700 pt-1.5 flex justify-between font-medium">
            <span className="text-white">Tổng nhận</span>
            <span className="text-emerald-400">+{sellTotal.toLocaleString()} gold</span>
          </div>
        </div>

        <p className="text-slate-500 text-xs">Công trình sẽ bị phá dỡ, đất vẫn thuộc về bạn.</p>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={() => { setShowSellConfirm(false); setError(null) }}
            className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 text-sm transition-colors"
          >
            Huỷ
          </button>
          <button
            onClick={handleSell}
            disabled={selling}
            className="flex-1 py-2 rounded-lg bg-red-700 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-medium transition-colors"
          >
            {selling ? 'Đang bán...' : 'Xác nhận bán'}
          </button>
        </div>
      </div>
    )
  }

  // ── Normal tile view ─────────────────────────────────────────────────────
  return (
    <div className="p-4 space-y-4">
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Vị trí</p>
        <p className="text-white font-mono text-lg">({selectedTile.x}, {selectedTile.y})</p>
      </div>

      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Trạng thái</p>
        {isEmpty ? (
          <span className="text-emerald-400 text-sm">Đất trống</span>
        ) : (
          <span className="text-slate-300 text-sm">
            Chủ:{' '}
            <span className={isOwner ? 'text-blue-400' : 'text-slate-200'}>
              {isOwner ? 'Bạn' : (tile?.ownerName ?? 'Người khác')}
            </span>
          </span>
        )}
      </div>

      {buildingConfig && (
        <div className="space-y-1">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Công trình</p>
          <p className="text-white text-sm font-medium">
            {BUILDING_EMOJI[tile!.buildingType!]} {buildingConfig.label}
          </p>
          <p className="text-slate-400 text-xs">
            Level {tile?.buildingLevel ?? 1} · {buildingConfig.incomePerMinute} gold/phút
          </p>

          {isOwner && (
            <div className="mt-3 p-3 rounded-lg bg-slate-800 border border-slate-700">
              <p className="text-xs text-slate-500 mb-1">Chờ thu hoạch</p>
              <p className="text-yellow-400 font-mono text-xl font-bold">
                +{pendingGold.toLocaleString()} 🪙
              </p>
              {secondsLeft > 0 && (
                <p className="text-slate-500 text-xs mt-1">
                  Có thể thu sau {secondsLeft >= 60
                    ? `${Math.ceil(secondsLeft / 60)} phút`
                    : `${secondsLeft}s`}
                </p>
              )}
              {lastEarned !== null && (
                <p className="text-emerald-400 text-xs mt-1">
                  Vừa nhận +{lastEarned.toLocaleString()} gold
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className={`text-xs ${error.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>{error}</p>
      )}

      {isEmpty && currentUser && (
        <button
          onClick={handleClaim}
          disabled={claiming || gold < CLAIM_COST}
          className="w-full py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          {claiming ? 'Đang claim...' : `Claim đất (${CLAIM_COST} gold)`}
        </button>
      )}

      {isOwner && !tile?.buildingType && (
        <button
          onClick={() => setShowBuildModal(true)}
          className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          Xây công trình
        </button>
      )}

      {isOwner && tile?.buildingType && (
        <>
          <button
            onClick={handleHarvest}
            disabled={harvesting || !canHarvest}
            className="w-full py-2 px-4 rounded-lg bg-yellow-600 hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {harvesting
              ? 'Đang thu...'
              : secondsLeft > 0
                ? `Chờ ${secondsLeft >= 60 ? `${Math.ceil(secondsLeft / 60)} phút` : `${secondsLeft}s`}`
                : pendingGold > 0
                  ? `Thu hoạch (+${pendingGold} gold)`
                  : 'Chưa có gold'}
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => { setError(null); setMovingFrom({ x: selectedTile.x, y: selectedTile.y }) }}
              className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 text-sm transition-colors"
            >
              Di chuyển
            </button>
            <button
              onClick={() => { setError(null); setShowSellConfirm(true) }}
              className="flex-1 py-2 rounded-lg border border-red-800 text-red-400 hover:text-red-300 hover:border-red-600 text-sm transition-colors"
            >
              Bán
            </button>
          </div>
        </>
      )}

      {showBuildModal && selectedTile && (
        <BuildModal
          tileX={selectedTile.x}
          tileY={selectedTile.y}
          onClose={() => setShowBuildModal(false)}
        />
      )}
    </div>
  )
}
