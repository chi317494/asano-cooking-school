import React, { useCallback } from 'react'
import { TextEntry, FONT_FAMILIES } from '../types'

interface Props {
  entry: TextEntry
  duration: number
  onChange: (entry: TextEntry) => void
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-purple-500 transition-colors'

export default function SubtitleEditor({ entry, duration, onChange }: Props) {
  const update = useCallback(
    (patch: Partial<TextEntry>) => onChange({ ...entry, ...patch }),
    [entry, onChange]
  )

  const safeMax = duration > 0 ? duration : 3600

  return (
    <div className="space-y-3 bg-gray-900/60 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-300 border-b border-gray-700 pb-2">
        字幕を編集
      </h3>

      {/* テキスト */}
      <Field label="テキスト">
        <textarea
          className={`${inputCls} resize-none h-16`}
          value={entry.text}
          onChange={e => update({ text: e.target.value })}
          placeholder="字幕テキストを入力"
        />
      </Field>

      {/* 時間設定 */}
      <div className="grid grid-cols-2 gap-2">
        <Field label="開始時間（秒）">
          <input
            type="number"
            className={inputCls}
            min={0}
            max={entry.endTime - 0.1}
            step={0.1}
            value={entry.startTime}
            onChange={e => update({ startTime: parseFloat(e.target.value) || 0 })}
          />
        </Field>
        <Field label="終了時間（秒）">
          <input
            type="number"
            className={inputCls}
            min={entry.startTime + 0.1}
            max={safeMax}
            step={0.1}
            value={entry.endTime}
            onChange={e => update({ endTime: parseFloat(e.target.value) || 3 })}
          />
        </Field>
      </div>

      {/* フォント */}
      <div className="grid grid-cols-2 gap-2">
        <Field label="フォント">
          <select
            className={inputCls}
            value={entry.fontFamily}
            onChange={e => update({ fontFamily: e.target.value })}
          >
            {FONT_FAMILIES.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </Field>
        <Field label="サイズ（px）">
          <input
            type="number"
            className={inputCls}
            min={8}
            max={120}
            step={1}
            value={entry.fontSize}
            onChange={e => update({ fontSize: parseInt(e.target.value) || 24 })}
          />
        </Field>
      </div>

      {/* カラー */}
      <div className="grid grid-cols-2 gap-2">
        <Field label="文字色">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={entry.color}
              onChange={e => update({ color: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
            />
            <input
              type="text"
              className={`${inputCls} flex-1`}
              value={entry.color}
              onChange={e => update({ color: e.target.value })}
              maxLength={9}
            />
          </div>
        </Field>
        <Field label="背景色">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={entry.backgroundColor.startsWith('rgba') ? '#000000' : entry.backgroundColor}
              onChange={e => update({ backgroundColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
            />
            <input
              type="text"
              className={`${inputCls} flex-1`}
              value={entry.backgroundColor}
              onChange={e => update({ backgroundColor: e.target.value })}
            />
          </div>
        </Field>
      </div>

      {/* スタイル */}
      <div className="grid grid-cols-2 gap-2">
        <Field label="太字">
          <button
            className={`py-1.5 rounded-lg text-sm font-medium transition-colors border
              ${entry.fontWeight === 'bold'
                ? 'bg-purple-700 border-purple-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            onClick={() => update({ fontWeight: entry.fontWeight === 'bold' ? 'normal' : 'bold' })}
          >
            B
          </button>
        </Field>
        <Field label="揃え">
          <div className="flex gap-1">
            {(['left', 'center', 'right'] as const).map(align => (
              <button
                key={align}
                className={`flex-1 py-1.5 rounded-lg text-xs transition-colors border
                  ${entry.textAlign === align
                    ? 'bg-purple-700 border-purple-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                onClick={() => update({ textAlign: align })}
              >
                {align === 'left' ? '左' : align === 'center' ? '中' : '右'}
              </button>
            ))}
          </div>
        </Field>
      </div>

      {/* 不透明度 */}
      <Field label={`不透明度: ${Math.round(entry.opacity * 100)}%`}>
        <input
          type="range"
          className="w-full"
          min={0}
          max={1}
          step={0.05}
          value={entry.opacity}
          onChange={e => update({ opacity: parseFloat(e.target.value) })}
        />
      </Field>

      {/* 位置 */}
      <div className="grid grid-cols-2 gap-2">
        <Field label={`X位置: ${Math.round(entry.x)}%`}>
          <input
            type="range"
            className="w-full"
            min={0}
            max={100}
            step={1}
            value={entry.x}
            onChange={e => update({ x: parseFloat(e.target.value) })}
          />
        </Field>
        <Field label={`Y位置: ${Math.round(entry.y)}%`}>
          <input
            type="range"
            className="w-full"
            min={0}
            max={100}
            step={1}
            value={entry.y}
            onChange={e => update({ y: parseFloat(e.target.value) })}
          />
        </Field>
      </div>
    </div>
  )
}
