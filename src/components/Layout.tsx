import { ReactNode } from 'react';
import { Sidebar, MobileHeader, BottomNav } from './NavBar';
import NotificationManager from './NotificationManager';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white md:h-screen md:overflow-hidden">
      {/* Desktop: sticky sidebar */}
      <Sidebar />

      {/* Content column */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile: slim top header */}
        <MobileHeader />

        {/* Scrollable page area */}
        <main className="flex-1 md:overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-5 pb-28 md:pb-8 md:px-6 md:py-7">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile: fixed bottom tab bar */}
      <BottomNav />

      {/* Runs silently in background — no UI */}
      <NotificationManager />
    </div>
  );
}
