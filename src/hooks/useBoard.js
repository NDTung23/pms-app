import { useContext } from 'react'
import { BoardContext } from '../context/BoardContext'

export function useBoard() {
  const ctx = useContext(BoardContext)
  if (!ctx) throw new Error('useBoard phải được dùng bên trong BoardProvider')
  return ctx
}
