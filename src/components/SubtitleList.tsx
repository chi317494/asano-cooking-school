import React from 'react'
import { TextEntry } from '../types'

interface Props {
  entries: TextEntry[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onAdd: () => void
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function SubtitleList({ entries, selectedId, onSelect, onDelete, onAdd }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-gray-300">字幕リスト</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 text-xs bg-purple-700 hover:bg-purple-600
            text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          追加
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 text-gray-600 text-sm border border-dashed border-gray-700 rounded-xl">
          <svg className="w-8 h-8 mx-auto mb-2 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M7 8h10M7 12h6m-6 4h10M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
          </svg>
          字幕がありません
          <br />「追加」ボタンで作成してください
        </div>
      ) : (
        <ul className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {entries.map(entry => (
            <li
              key={entry.id}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer
                border transition-all text-sm
                ${selectedId === entry.id
                  ? 'border-purple-500 bg-purple-900/30'
                  : 'border-transparent bg-gray-800/60 hover:bg-gray-700/60'
                }`}
              onClick={() => onSelect(entry.id)}
            >
              {/* カラーインジケーター */}
              <div
                className="w-2 h-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-gray-200">{entry.text}</p>
                <p className="text-xs text-gray-500 font-mono">
                  {formatTime(entry.startTime)} → {formatTime(entry.endTime)}
                </p>
              </div>
              <button
                className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0 p-1 rounded"
                onClick={e => {
                  e.stopPropagation()
                  onDelete(entry.id)
                }}
                title="削除"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
