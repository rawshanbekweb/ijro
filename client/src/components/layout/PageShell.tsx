import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useUiStore } from '../../store/ui.store'

const MOBILE_BREAKPOINT = 768

export default function PageShell() {
  const setSidebarCollapsed = useUiStore((state) => state.setSidebarCollapsed)

  useEffect(() => {
    if (window.innerWidth < MOBILE_BREAKPOINT) {
      setSidebarCollapsed(true)
    }
  }, [setSidebarCollapsed])

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
