import React from 'react'
import { useVideoEditor } from './hooks/useVideoEditor'
import VideoPlayer from './components/VideoPlayer'
import Timeline from './components/Timeline'
import SubtitleList from './components/SubtitleList'
import SubtitleEditor from './components/SubtitleEditor'
import ExportImport from './components/ExportImport'
import BgmPlayer from './components/BgmPlayer'
import VideoExporter from './components/VideoExporter'
import { useVideoExport } from './hooks/useVideoExport'

const ASPECT_RATIOS = [
  { value: '9:16' as const, label: '縦型 9:16', sub: 'リール' },
  { value: '1:1' as const, label: '正方形 1:1', sub: 'フィード' },
]

export default function App() {
  const editor = useVideoEditor()
  const exporter = useVideoExport(editor.videoRef, editor.textEntries, editor.duration)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 flex flex-col">
      {/* ヘッダー */}
      <header className="border-b border-gray-800 px-4 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg p-1.5">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">Instagram 動画エディター</h1>
            {editor.videoName && (
              <p className="text-xs text-gray-500 truncate max-w-[200px]">{editor.videoName}</p>
            )}
          </div>
        </div>

        {/* アスペクト比切り替え */}
        <div className="flex gap-1.5">
          {ASPECT_RATIOS.map(ar => (
            <button
              key={ar.value}
              onClick={() => editor.setAspectRatio(ar.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                ${editor.aspectRatio === ar.value
                  ? 'bg-purple-700 border-purple-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
            >
              <span className="font-bold">{ar.label}</span>
              <span className="ml-1 opacity-60">{ar.sub}</span>
            </button>
          ))}
        </div>
      </header>

      {/* メインレイアウト */}
      <main className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
        {/* 左: プレビュー + タイムライン */}
        <div className="lg:w-[45%] xl:w-[40%] flex flex-col gap-4 p-4 border-b lg:border-b-0 lg:border-r border-gray-800 overflow-y-auto">
          <VideoPlayer
            videoRef={editor.videoRef}
            videoSrc={editor.videoSrc}
            aspectRatio={editor.aspectRatio}
            isPlaying={editor.isPlaying}
            visibleEntries={editor.visibleEntries}
            selectedId={editor.selectedId}
            onPlayPause={editor.handlePlayPause}
            onTimeUpdate={editor.handleTimeUpdate}
            onLoadedMetadata={editor.handleLoadedMetadata}
            onEnded={() => editor.setIsPlaying(false)}
            onSelectEntry={editor.selectEntry}
            onUpdateEntry={editor.updateTextEntry}
            onVideoUpload={editor.loadVideo}
          />

          {/* 再生コントロール */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => editor.handleSeek(0)}
              className="text-gray-400 hover:text-white transition-colors"
              title="先頭に戻る"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>
            <button
              onClick={() => editor.handleSeek(Math.max(0, editor.currentTime - 5))}
              className="text-gray-400 hover:text-white transition-colors"
              title="-5秒"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                <text x="8" y="15" fontSize="6" fill="currentColor">5</text>
              </svg>
            </button>
            <button
              onClick={editor.handlePlayPause}
              className="w-12 h-12 rounded-full bg-purple-700 hover:bg-purple-600
                flex items-center justify-center transition-colors shadow-lg shadow-purple-900/50"
            >
              {editor.isPlaying ? (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
            <button
              onClick={() => editor.handleSeek(Math.min(editor.duration, editor.currentTime + 5))}
              className="text-gray-400 hover:text-white transition-colors"
              title="+5秒"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.01 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
              </svg>
            </button>
          </div>

          {/* タイムライン */}
          <Timeline
            duration={editor.duration}
            currentTime={editor.currentTime}
            textEntries={editor.textEntries}
            selectedId={editor.selectedId}
            onSeek={editor.handleSeek}
            onSelectEntry={editor.selectEntry}
          />
        </div>

        {/* 右: 設定パネル */}
        <div className="lg:flex-1 flex flex-col gap-4 p-4 overflow-y-auto">
          {/* 動画書き出し */}
          <VideoExporter
            exporting={exporter.exporting}
            progress={exporter.progress}
            error={exporter.error}
            hasVideo={!!editor.videoSrc}
            onExport={exporter.exportVideo}
          />

          {/* BGM */}
          <BgmPlayer
            isPlaying={editor.isPlaying}
            currentTime={editor.currentTime}
          />

          {/* エクスポート/インポート */}
          <ExportImport
            onExport={editor.exportProject}
            onImport={editor.importProject}
          />

          {/* 字幕リスト */}
          <SubtitleList
            entries={editor.textEntries}
            selectedId={editor.selectedId}
            onSelect={editor.selectEntry}
            onDelete={editor.deleteTextEntry}
            onAdd={editor.addTextEntry}
          />

          {/* 字幕エディター */}
          {editor.editingEntry ? (
            <SubtitleEditor
              entry={editor.editingEntry}
              duration={editor.duration}
              onChange={editor.updateTextEntry}
            />
          ) : (
            <div className="text-center py-10 text-gray-600 text-sm border border-dashed border-gray-800 rounded-xl">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              字幕を選択すると<br />詳細設定が表示されます
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
