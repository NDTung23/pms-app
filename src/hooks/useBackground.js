import { useEffect } from 'react'

export function useBackground() {
  useEffect(() => {
    const app = document.querySelector('.app')
    if (!app) return

    const bg      = localStorage.getItem('pms_bg')      || 'midnight'
    const bgImg   = localStorage.getItem('pms_bg_img')  || ''
    const overlay = localStorage.getItem('pms_overlay') || '55'
    const theme   = localStorage.getItem('pms_theme')   || 'dark'

    if (bg === 'custom' && bgImg) {
      app.setAttribute('data-bg', 'custom')
      app.style.setProperty('--bg-image', `url("${bgImg}")`)
      app.style.setProperty('--bg-overlay', `rgba(0,0,0,.${overlay})`)
    } else {
      app.setAttribute('data-bg', bg)
    }

    app.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [])
}
