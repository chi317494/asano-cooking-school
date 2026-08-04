import React, { useRef, useCallback, useState } from 'react'
import { AspectRatio, TextEntry } from '../types'
import TextOverlay from './TextOverlay'

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>
  videoSrc: string | null
  aspectRatio: AspectRatio
  isPlaying: boolean
  visibleEntries: TextEntry[]
  selectedId: string | null
  onPlayPause: () => void
  onTimeUpdate: () => void
  onLoadedMetadata: () => void
  onEnded: () => void
  onSelectEntry: (id: string | null) => void
  onUpdateEntry: (entry: TextEntry) => void
  onVideoUpload: (file: File) => void
}

export default function VideoPlayer({
  videoRef,
  videoSrc,
  aspectRatio,
  isPlaying,
  visibleEntries,
  selectedId,
  onPlayPause,
  onTimeUpdate,
  onLoadedMetadata,
  onEnded,
  onSelectEntry,
  onUpdateEntry,
  onVideoUpload,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [videoAspect, setVideoAspect] = useState<number | null>(null)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith('video/')) {
        onVideoUpload(file)
        setVideoAspect(null)
      }
    },
    [onVideoUpload]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onVideoUpload(file)
        setVideoAspect(null)
      }
    },
    [onVideoUpload]
  )

  const handleMetadata = useCallback(() => {
    onLoadedMetadata()
    if (videoRef.current) {
      const { videoWidth, videoHeight } = videoRef.current
      if (videoWidth && videoHeight) {
        setVideoAspect(videoWidth / videoHeight)
      }
    }
  }, [onLoadedMetadata, videoRef])

  // エクスポート用のアスペクト比（9:16 or 1:1）はヘッダーで選択
  // プレビューは動画の実際の縦横比に合わせて表示
  const exportAspect = aspectRatio === '9:16' ? 9 / 16 : 1
  const displayAspect = videoAspect ?? exportAspect

  // コンテナのスタイルを動画サイズに合わせる
  const containerStyle: React.CSSProperties = {
    aspectRatio: String(displayAspect),
    maxHeight: '52vh',
    maxWidth: displayAspect >= 1 ? '100%' : '240px',
    width: '100%',
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* プレビュー領域 */}
      <div
        ref={containerRef}
        className="relative bg-black rounded-xl overflow-hidden"
        style={containerStyle}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => onSelectEntry(null)}
      >
        {videoSrc ? (
          <>
            <video
              ref={videoRef}
              src={videoSrc}
              className="w-full h-full object-contain"
              onTimeUpdate={onTimeUpdate}
              onLoadedMetadata={handleMetadata}
              onEnded={onEnded}
              onClick={e => {
                e.stopPropagation()
                onPlayPause()
              }}
            />
            {/* テキストオーバーレイ */}
            {visibleEntries.map(entry => (
              <TextOverlay
                key={entry.id}
                entry={entry}
                isSelected={selectedId === entry.id}
                containerRef={containerRef}
                onSelect={() => onSelectEntry(entry.id)}
                onUpdate={onUpdateEntry}
              />
            ))}
            {/* 再生/停止アイコン */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/40 rounded-full p-3">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
          </>
        ) : (
          /* アップロードプレースホルダー */
          <div
            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer
              border-2 border-dashed border-purple-600 rounded-xl
              hover:border-purple-400 hover:bg-purple-900/10 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg className="w-12 h-12 text-purple-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
            <p className="text-purple-400 font-medium">動画をクリックまたはドロップ</p>
            <p className="text-gray-500 text-sm mt-1">MP4, MOV, WebM など</p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {videoSrc && (
        <button
          className="text-sm text-gray-400 hover:text-purple-400 underline transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          別の動画を選択
        </button>
      )}
    </div>
  )
}
