import React, { useState } from 'react'
import { Navbar } from './components/layout/Navbar'
import { Sidebar, NavTab } from './components/layout/Sidebar'
import { NotificationDrawer } from './components/layout/NotificationDrawer'
import { LandingPage } from './pages/LandingPage'
import { DashboardOverview } from './pages/DashboardOverview'
import { SlotRecoveryPage } from './pages/SlotRecoveryPage'
import { LiveQueuePage } from './pages/LiveQueuePage'
import { InventoryPage } from './pages/InventoryPage'
import { PatientsPage } from './pages/PatientsPage'
import { DoctorsPage } from './pages/DoctorsPage'
import { AppointmentsPage } from './pages/AppointmentsPage'
import { BillingPage } from './pages/BillingPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { SqlDemoPage } from './pages/SqlDemoPage'
import { AuditPage } from './pages/AuditPage'
import { AuthPage } from './pages/AuthPage'
import { db } from './services/db'
import { UserRole } from './types'

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard')
  const [currentRole, setCurrentRole] = useState<UserRole>('admin')
  const [resetKey, setResetKey] = useState<number>(0)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role)
    db.setCurrentRole(role)

    // Role redirection if current tab is restricted
    if (role === 'doctor' && (activeTab === 'recovery' || activeTab === 'billing' || activeTab === 'audit')) {
      setActiveTab('queue')
    } else if (role === 'inventory_manager' && activeTab !== 'inventory' && activeTab !== 'landing' && activeTab !== 'dashboard') {
      setActiveTab('inventory')
    } else if (role === 'receptionist' && activeTab === 'audit') {
      setActiveTab('appointments')
    }
  }

  const handleResetDatabase = () => {
    db.resetToSeed()
    setResetKey((prev) => prev + 1)
  }

  const handleAuthSuccess = (role: UserRole) => {
    handleRoleChange(role)
    setIsAuthOpen(false)
    setActiveTab('dashboard')
  }

  return (
    <div key={resetKey} className="min-h-screen bg-[#F7F9FC] text-[#172B4D] flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        onResetDatabase={handleResetDatabase}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Real-time Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigate={(tab) => {
          setActiveTab(tab)
          setIsNotificationsOpen(false)
        }}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex w-full relative">
        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-64 bg-white h-full shadow-2xl p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar
                activeTab={activeTab}
                onSelectTab={(tab) => {
                  setActiveTab(tab)
                  setMobileMenuOpen(false)
                }}
                currentRole={currentRole}
              />
            </div>
          </div>
        )}

        {/* Desktop Sidebar: hidden on full-width public landing page */}
        {activeTab !== 'landing' && (
          <div className="hidden lg:block shrink-0">
            <Sidebar
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              currentRole={currentRole}
            />
          </div>
        )}

        {/* Dynamic Page Viewport or Auth Modal */}
        <main className={`flex-1 transition-all overflow-y-auto ${activeTab === 'landing' ? 'w-full' : 'p-2 sm:p-6'}`}>
          {isAuthOpen ? (
            <AuthPage
              onSuccess={handleAuthSuccess}
              onCancel={() => setIsAuthOpen(false)}
            />
          ) : (
            <>
              {activeTab === 'landing' && (
                <LandingPage
                  onNavigate={setActiveTab}
                  onOpenAuth={() => setIsAuthOpen(true)}
                />
              )}
              {activeTab === 'dashboard' && <DashboardOverview onNavigate={setActiveTab} />}
              {activeTab === 'recovery' && <SlotRecoveryPage />}
              {activeTab === 'queue' && <LiveQueuePage />}
              {activeTab === 'inventory' && <InventoryPage />}
              {activeTab === 'patients' && <PatientsPage />}
              {activeTab === 'doctors' && <DoctorsPage />}
              {activeTab === 'appointments' && <AppointmentsPage />}
              {activeTab === 'billing' && <BillingPage />}
              {activeTab === 'analytics' && <AnalyticsPage />}
              {activeTab === 'sql_demo' && <SqlDemoPage />}
              {activeTab === 'audit' && <AuditPage />}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
