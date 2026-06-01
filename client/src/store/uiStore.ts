import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ThemeMode = 'dark' | 'light'

interface UIState {
  themeMode: ThemeMode
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  activeRoute: string

  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebarCollapsed: () => void
  setActiveRoute: (route: string) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      themeMode: 'dark',
      sidebarOpen: true,
      sidebarCollapsed: false,
      activeRoute: '/dashboard',

      toggleTheme: () =>
        set((state) => ({
          themeMode: state.themeMode === 'dark' ? 'light' : 'dark',
        })),

      setTheme: (mode: ThemeMode) => set({ themeMode: mode }),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),

      toggleSidebarCollapsed: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setActiveRoute: (route: string) => set({ activeRoute: route }),
    }),
    {
      name: 'houseos-ui',
      partialize: (state) => ({
        themeMode: state.themeMode,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
)
