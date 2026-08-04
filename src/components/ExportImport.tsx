import React, { useRef, useCallback } from 'react'

interface Props {
  onExport: () => string
  onImport: (json: string) => void
}

export default function ExportImport({ onExport, onImport }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = useCallback(() => {
    const json = onExport()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subtitle-project-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [onExport])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = ev => {
        const text = ev.target?.result as string
        onImport(text)
      }
      reader.readAsText(file)
      e.target.value = ''
    },
    [onImport]
  )

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExport}
        className="flex-1 flex items-center justify-center gap-1.5 text-sm
          bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500
          text-gray-300 px-3 py-2 rounded-lg transition-colors"
        title="プロジェクトをJSONで書き出す"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        エクスポート
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex-1 flex items-center justify-center gap-1.5 text-sm
          bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500
          text-gray-300 px-3 py-2 rounded-lg transition-colors"
        title="JSONプロジェクトを読み込む"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
        </svg>
        インポート
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
