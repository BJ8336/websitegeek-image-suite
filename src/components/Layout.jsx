import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Footer from './Footer'
import UpgradeModal from './UpgradeModal'
import Toast from './Toast'

function Layout() {
  return (
    <div className="flex min-h-screen md:flex-row flex-col">
      <Sidebar />
      <div className="light-surface flex min-w-0 flex-1 flex-col bg-slate-50">
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
          <Outlet />
        </main>
        <Footer />
      </div>
      <UpgradeModal />
      <Toast />
    </div>
  )
}

export default Layout
