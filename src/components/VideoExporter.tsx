import React from 'react'

interface Props {
  exporting: boolean
  progress: number
  error: string | null
  hasVideo: boolean
  onExport: () => void
}

export default function VideoExporter({ exporting, progress, error, hasVideo, onExport }: Props) {
  return (
    <div className="bg-gray-900/60 rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
        動画を書き出す
      </h3>

      {!exporting ? (
        <>
          <button
            onClick={onExport}
            disabled={!hasVideo}
            className={`w-full py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2
              ${hasVideo
                ? 'bg-gradient-to-r from-purple-700 to-pink-600 hover:from-purple-600 hover:to-pink-500 text-white shadow-lg shadow-purple-900/40'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            テロップ入り動画を書き出す
          </button>
          <p className="text-xs text-gray-600">
            ※ 動画全体をリアルタイムで処理するため、動画の長さと同じ時間かかります
          </p>
        </>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>書き出し中...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">動画が終わると自動でダウンロードされます</p>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400 bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
      )}
    </div>
  )
}
