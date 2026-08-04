import React, { useCallback } from 'react'
import { TextEntry } from '../types'

interface Props {
  duration: number
  currentTime: number
  textEntries: TextEntry[]
  selectedId: string | null
  onSeek: (time: number) => void
  onSelectEntry: (id: string) => void
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  const ms = Math.floor((sec % 1) * 10)
  return `${m}:${String(s).padStart(2, '0')}.${ms}`
}

const TRACK_COLORS = [
  'bg-purple-600',
  'bg-violet-500',
  'bg-indigo-500',
  'bg-fuchsia-600',
  'bg-pink-600',
]

export default function Timeline({
  duration,
  currentTime,
  textEntries,
  selectedId,
  onSeek,
  onSelectEntry,
}: Props) {
  const safeMax = duration > 0 ? duration : 100

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSeek(parseFloat(e.target.value))
    },
    [onSeek]
  )

  return (
    <div className="bg-gray-900/60 rounded-xl p-4 space-y-3">
      {/* 時間表示 */}
      <div className="flex justify-between text-xs text-gray-400 font-mono">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(safeMax)}</span>
      </div>

      {/* メインシークバー */}
      <input
        type="range"
        min={0}
        max={safeMax}
        step={0.05}
        value={currentTime}
        onChange={handleSliderChange}
        className="w-full"
      />

      {/* 字幕トラック */}
      {textEntries.length > 0 && (
        <div className="space-y-1 mt-2">
          <p className="text-xs text-gray-500 mb-1">字幕トラック</p>
          {textEntries.map((entry, i) => {
            const left = (entry.startTime / safeMax) * 100
            const width = Math.max(
              ((entry.endTime - entry.startTime) / safeMax) * 100,
              1
            )
            const colorClass = TRACK_COLORS[i % TRACK_COLORS.length]
            const isSelected = selectedId === entry.id

            return (
              <div key={entry.id} className="relative h-6 bg-gray-800 rounded">
                {/* 現在位置インジケーター */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-red-500 z-10 pointer-events-none"
                  style={{ left: `${(currentTime / safeMax) * 100}%` }}
                />
                {/* 字幕ブロック */}
                <button
                  className={`absolute top-0.5 bottom-0.5 rounded text-xs truncate px-1 text-white
                    transition-opacity ${colorClass}
                    ${isSelected ? 'ring-2 ring-white/80 opacity-100' : 'opacity-70 hover:opacity-90'}`}
                  style={{ left: `${left}%`, width: `${width}%`, minWidth: '20px' }}
                  onClick={() => onSelectEntry(entry.id)}
                  title={entry.text}
                >
                  {entry.text}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {duration === 0 && (
        <p className="text-xs text-gray-600 text-center">動画を読み込むとタイムラインが表示されます</p>
      )}
    </div>
  )
}
