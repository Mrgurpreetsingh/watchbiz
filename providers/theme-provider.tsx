'use client'

/**
 * 🌓 Theme Provider - Gestion du Dark Mode
 *
 * Features:
 * - Context API pour gérer le thème (light/dark/system)
 * - Persistance dans localStorage
 * - Détection préférence système (prefers-color-scheme)
 * - Hook useTheme() pour consommer le context
 * - Toggle light/dark avec animation
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark' // Le thème réellement appliqué
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = 'watchbiz_theme'

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // Détecter la préférence système
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light'

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }

  // Résoudre le thème (system → light/dark)
  const resolveTheme = (currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'system') {
      return getSystemTheme()
    }
    return currentTheme
  }

  // Charger le thème depuis localStorage au montage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    const initialTheme = stored || defaultTheme

    setThemeState(initialTheme)
    const resolved = resolveTheme(initialTheme)
    setResolvedTheme(resolved)

    // Appliquer la classe au <html>
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(resolved)

    setMounted(true)
  }, [defaultTheme])

  // Écouter les changements de préférence système
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      const systemTheme = getSystemTheme()
      setResolvedTheme(systemTheme)
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(systemTheme)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // Fonction pour changer le thème
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(STORAGE_KEY, newTheme)

    const resolved = resolveTheme(newTheme)
    setResolvedTheme(resolved)

    // Appliquer la classe au <html>
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(resolved)
  }

  // Toggle light/dark (ignore system)
  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  // Toujours fournir le context, même avant le montage
  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook pour utiliser le theme context
export function useTheme() {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
