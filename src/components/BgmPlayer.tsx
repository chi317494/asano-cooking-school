import React, { useRef, useEffect, useCallback, useState } from 'react'

interface Props {
  isPlaying: boolean
  currentTime: number
}

export default function BgmPlayer({ isPlaying, currentTime }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [bgmSrc, setBgmSrc] = useState<string | null>(null)
  const [bgmName, setBgmName] = useState<string>('')
  const [volume, setVolume] = useState<number>(0.5)
  const [loop, setLoop] = useState<boolean>(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastSyncTime = useRef<number>(-1)

  // 再生・停止を動画に同期
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !bgmSrc) return
    if (isPlaying) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [isPlaying, bgmSrc])

  // シーク同期（大きくずれた時だけ合わせる）
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !bgmSrc) return
    if (Math.abs(audio.currentTime - currentTime) > 0.5) {
      audio.currentTime = currentTime
      lastSyncTime.current = currentTime
    }
  }, [currentTime, bgmSrc])

  // 音量
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  // ループ
  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = loop
  }, [loop])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setBgmSrc(url)
    setBgmName(file.name)
    e.target.value = ''
  }, [])

  const handleRemove = useCallback(() => {
    if (audioRef.current) audioRef.current.pause()
    setBgmSrc(null)
    setBgmName('')
  }, [])

  return (
    <div className="bg-gray-900/60 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z"/>
          </svg>
          BGM（プレビュー用）
        </h3>
        {bgmSrc && (
          <button onClick={handleRemove} className="text-xs text-gray-500 hover:text-red-400 transition-colors">
            削除
          </button>
        )}
      </div>

      {!bgmSrc ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 border-2 border-dashed border-gray-700 rounded-lg
            text-gray-500 hover:border-purple-600 hover:text-purple-400 transition-colors text-sm"
        >
          + 音楽ファイルを選択（MP3, AAC など）
        </button>
      ) : (
        <div className="space-y-3">
          {/* ファイル名 */}
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
            <svg className="w-4 h-4 text-purple-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z"/>
            </svg>
            <span className="text-sm text-gray-300 truncate">{bgmName}</span>
          </div>

          {/* ボリューム */}
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0013 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
            <input
              type="range"
              min={0} max={1} step={0.05}
              value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-gray-400 w-8 text-right">{Math.round(volume * 100)}%</span>
          </div>

          {/* ループ */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              className={`w-9 h-5 rounded-full transition-colors relative ${loop ? 'bg-purple-600' : 'bg-gray-700'}`}
              onClick={() => setLoop(v => !v)}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
                ${loop ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-gray-400">ループ再生</span>
          </label>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept=".mp3,.m4a,.aac,.wav,.ogg,.flac,audio/*" className="hidden" onChange={handleFileChange} />

      {bgmSrc && (
        <audio ref={audioRef} src={bgmSrc} loop={loop} />
      )}

      <p className="text-xs text-gray-600">※ プレビュー再生専用です。動画ファイルには書き出されません。</p>
    </div>
  )
}
