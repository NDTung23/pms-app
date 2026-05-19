import { useState, useEffect } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    // Đọc từ localStorage, mặc định là dark
    return localStorage.getItem('pms_theme') || 'dark'
  })

  useEffect(() => {
    // Gắn class vào <html> để CSS vars tự động đổi
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('pms_theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return { theme, toggleTheme, isDark: theme === 'dark' }
}
