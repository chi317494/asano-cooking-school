import { useState, useCallback } from 'react'
import { TextEntry } from '../types'

export function useVideoExport(
  videoRef: React.RefObject<HTMLVideoElement>,
  textEntries: TextEntry[],
  duration: number
) {
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const exportVideo = useCallback(async () => {
    const video = videoRef.current
    if (!video || !video.src) {
      setError('動画が読み込まれていません')
      return
    }

    setExporting(true)
    setProgress(0)
    setError(null)

    try {
      const W = video.videoWidth || 1080
      const H = video.videoHeight || 1920
      const scale = W / (videoRef.current?.offsetWidth || 360)

      // Canvas セットアップ
      const canvas = document.createElement('canvas')
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext('2d')!

      // canvasストリームのみ使用（音声はInstagramで追加）
      const canvasStream = canvas.captureStream(30)

      // MediaRecorder セットアップ
      const mimeType =
        MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' :
        MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/webm'

      const recorder = new MediaRecorder(canvasStream, { mimeType, videoBitsPerSecond: 8000000 })
      const chunks: Blob[] = []
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }

      // 先頭にシーク
      video.muted = true
      video.currentTime = 0
      await new Promise<void>(r => {
        video.onseeked = () => r()
        setTimeout(r, 1000) // タイムアウト保険
      })

      recorder.start(200)
      video.play()

      // 描画ループ
      let animId = 0
      const draw = () => {
        if (video.ended || video.paused) return

        ctx.drawImage(video, 0, 0, W, H)

        const t = video.currentTime
        setProgress(Math.round((t / (duration || 1)) * 100))

        // 字幕を描画
        textEntries
          .filter(e => t >= e.startTime && t <= e.endTime)
          .forEach(entry => {
            const x = (entry.x / 100) * W
            const y = (entry.y / 100) * H
            const fs = entry.fontSize * (W / 360)

            ctx.save()
            ctx.globalAlpha = entry.opacity
            ctx.font = `${entry.fontWeight} ${fs}px ${entry.fontFamily}`
            ctx.textAlign = entry.textAlign as CanvasTextAlign
            ctx.textBaseline = 'middle'

            // 背景
            if (entry.backgroundColor && entry.backgroundColor !== 'transparent') {
              const lines = entry.text.split('\n')
              const lineH = fs * 1.4
              const maxW = Math.max(...lines.map(l => ctx.measureText(l).width))
              const pad = fs * 0.3
              const totalH = lines.length * lineH
              const bx = entry.textAlign === 'center' ? x - maxW / 2 - pad
                : entry.textAlign === 'right' ? x - maxW - pad : x - pad
              ctx.fillStyle = entry.backgroundColor
              ctx.beginPath()
              ctx.roundRect(bx, y - totalH / 2 - pad, maxW + pad * 2, totalH + pad * 2, 6)
              ctx.fill()
            }

            // テキスト（複数行対応）
            ctx.fillStyle = entry.color
            const lines = entry.text.split('\n')
            const lineH = fs * 1.4
            lines.forEach((line, i) => {
              const ly = y + (i - (lines.length - 1) / 2) * lineH
              ctx.fillText(line, x, ly)
            })
            ctx.restore()
          })

        animId = requestAnimationFrame(draw)
      }

      draw()

      // 動画終了を待つ
      await new Promise<void>(resolve => {
        video.onended = () => {
          cancelAnimationFrame(animId)
          resolve()
        }
      })

      recorder.stop()

      await new Promise<void>(resolve => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `subtitled-${Date.now()}.webm`
          a.click()
          URL.revokeObjectURL(url)
          resolve()
        }
      })

      setProgress(100)
    } catch (e) {
      setError('書き出しに失敗しました: ' + String(e))
    } finally {
      setExporting(false)
    }
  }, [videoRef, textEntries, duration])

  return { exportVideo, exporting, progress, error }
}
