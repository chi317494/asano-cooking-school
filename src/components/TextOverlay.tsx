import React, { useRef, useCallback } from 'react'
import { TextEntry } from '../types'

interface Props {
  entry: TextEntry
  isSelected: boolean
  containerRef: React.RefObject<HTMLDivElement>
  onSelect: () => void
  onUpdate: (entry: TextEntry) => void
}

export default function TextOverlay({ entry, isSelected, containerRef, onSelect, onUpdate }: Props) {
  const isDragging = useRef(false)
  const dragStart = useRef({ mouseX: 0, mouseY: 0, entryX: 0, entryY: 0 })

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onSelect()

      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      isDragging.current = true
      dragStart.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        entryX: entry.x,
        entryY: entry.y,
      }

      const handleMouseMove = (mv: MouseEvent) => {
        if (!isDragging.current || !containerRef.current) return
        const dx = ((mv.clientX - dragStart.current.mouseX) / rect.width) * 100
        const dy = ((mv.clientY - dragStart.current.mouseY) / rect.height) * 100
        const newX = Math.max(0, Math.min(100, dragStart.current.entryX + dx))
        const newY = Math.max(0, Math.min(100, dragStart.current.entryY + dy))
        onUpdate({ ...entry, x: newX, y: newY })
      }

      const handleMouseUp = () => {
        isDragging.current = false
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
        document.body.classList.remove('overlay-dragging')
      }

      document.body.classList.add('overlay-dragging')
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    },
    [entry, onSelect, onUpdate, containerRef]
  )

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${entry.x}%`,
    top: `${entry.y}%`,
    transform: 'translate(-50%, -50%)',
    fontSize: `${entry.fontSize}px`,
    fontFamily: entry.fontFamily,
    color: entry.color,
    backgroundColor: entry.backgroundColor || 'transparent',
    opacity: entry.opacity,
    fontWeight: entry.fontWeight,
    textAlign: entry.textAlign,
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'grab',
    userSelect: 'none',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    maxWidth: '90%',
    lineHeight: 1.4,
    border: isSelected ? '2px dashed #a855f7' : '2px solid transparent',
    boxShadow: isSelected ? '0 0 0 1px rgba(168,85,247,0.4)' : 'none',
    transition: 'border-color 0.15s',
    zIndex: 10,
  }

  return (
    <div style={style} onMouseDown={handleMouseDown}>
      {entry.text}
    </div>
  )
}
