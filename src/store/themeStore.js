import { create } from 'zustand'

const init = () => {
  const saved = localStorage.getItem('sg_theme')
  return saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
}

const apply = (theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  localStorage.setItem('sg_theme', theme)
}

export const useThemeStore = create((set) => ({
  theme: init(),
  init: () => { apply(init()) },
  toggle: () => set((s) => {
    const next = s.theme === 'dark' ? 'light' : 'dark'
    apply(next)
    return { theme: next }
  }),
}))
