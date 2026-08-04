import { useState, useRef, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { TextEntry, AspectRatio, DEFAULT_TEXT_ENTRY, ProjectData } from '../types'

export function useVideoEditor() {
  const videoRef = useRef<HTMLVideoElement>(null)

  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [videoName, setVideoName] = useState<string>('')
  const [duration, setDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16')
  const [textEntries, setTextEntries] = useState<TextEntry[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<TextEntry | null>(null)

  const loadVideo = useCallback((file: File) => {
    const url = URL.createObjectURL(file)
    setVideoSrc(url)
    setVideoName(file.name)
    setCurrentTime(0)
    setIsPlaying(false)
  }, [])

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }, [])

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }, [])

  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const handleSeek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  const addTextEntry = useCallback(() => {
    const newEntry: TextEntry = {
      ...DEFAULT_TEXT_ENTRY,
      id: uuidv4(),
      startTime: Math.floor(currentTime),
      endTime: Math.min(Math.floor(currentTime) + 3, duration || 10),
    }
    setTextEntries(prev => [...prev, newEntry])
    setSelectedId(newEntry.id)
    setEditingEntry(newEntry)
  }, [currentTime, duration])

  const updateTextEntry = useCallback((updated: TextEntry) => {
    setTextEntries(prev =>
      prev.map(e => (e.id === updated.id ? updated : e))
    )
    setEditingEntry(updated)
  }, [])

  const deleteTextEntry = useCallback((id: string) => {
    setTextEntries(prev => prev.filter(e => e.id !== id))
    if (selectedId === id) {
      setSelectedId(null)
      setEditingEntry(null)
    }
  }, [selectedId])

  const selectEntry = useCallback((id: string | null) => {
    setSelectedId(id)
    if (id) {
      const entry = textEntries.find(e => e.id === id)
      setEditingEntry(entry || null)
    } else {
      setEditingEntry(null)
    }
  }, [textEntries])

  const exportProject = useCallback((): string => {
    const data: ProjectData = { aspectRatio, textEntries }
    return JSON.stringify(data, null, 2)
  }, [aspectRatio, textEntries])

  const importProject = useCallback((json: string) => {
    try {
      const data: ProjectData = JSON.parse(json)
      if (data.aspectRatio) setAspectRatio(data.aspectRatio)
      if (Array.isArray(data.textEntries)) setTextEntries(data.textEntries)
      setSelectedId(null)
      setEditingEntry(null)
    } catch {
      alert('JSONの読み込みに失敗しました')
    }
  }, [])

  const visibleEntries = textEntries.filter(
    e => currentTime >= e.startTime && currentTime <= e.endTime
  )

  return {
    videoRef,
    videoSrc,
    videoName,
    duration,
    currentTime,
    isPlaying,
    aspectRatio,
    setAspectRatio,
    textEntries,
    selectedId,
    editingEntry,
    visibleEntries,
    loadVideo,
    handleTimeUpdate,
    handleLoadedMetadata,
    handlePlayPause,
    handleSeek,
    addTextEntry,
    updateTextEntry,
    deleteTextEntry,
    selectEntry,
    exportProject,
    importProject,
    setIsPlaying,
  }
}
