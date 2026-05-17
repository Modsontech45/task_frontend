import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

function useNotifPermission() {
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const request = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };
  useEffect(() => {
    if (!('Notification' in window)) return;
    setPermission(Notification.permission);
  }, []);
  return { permission, request };
}

const links = [
  { to: '/',          label: "Aujourd'hui", short: 'Accueil',  icon: '🏠' },
  { to: '/schedule',  label: 'Planning',    short: 'Planning', icon: '📅' },
  { to: '/streaks',   label: 'Séries',      short: 'Séries',   icon: '🔥' },
  { to: '/bilingual', label: 'Bilingue',    short: 'Langue',   icon: '🌍' },
  { to: '/review',    label: 'Semaine',     short: 'Semaine',  icon: '📊' },
  { to: '/revisions', label: 'Révisions',   short: 'Révisions',icon: '📚' },
  { to: '/manage',    label: 'Gérer',       short: 'Gérer',    icon: '⚙️' },
];

/* ── Desktop sidebar ─────────────────────────────────────── */
export function Sidebar() {
  const { darkMode, toggleDark } = useApp();
  const { user, logout } = useAuth();
  const { permission, request } = useNotifPermission();

  return (
    <aside className="hidden md:flex flex-col w-56 lg:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 dark:border-gray-800">
        <span className="text-2xl">📅</span>
        <div>
          <p className="font-black text-lg leading-none text-gray-900 dark:text-white tracking-tight">MyDayAI</p>
          <p className="text-[11px] text-gray-400 leading-none mt-0.5">Daily Planner</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`
            }
          >
            <span className="text-base leading-none">{l.icon}</span>
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User + actions */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 mb-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-200 truncate font-medium">{user.name}</span>
          </div>
        )}
        <button
          onClick={toggleDark}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <span>{darkMode ? '☀️' : '🌙'}</span>
          <span>{darkMode ? 'Mode clair' : 'Mode sombre'}</span>
        </button>
        {permission !== 'granted' && permission !== 'denied' && (
          <button
            onClick={request}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-950/20 transition-colors"
          >
            <span>🔔</span>
            <span>Activer les alertes</span>
          </button>
        )}
        {permission === 'granted' && (
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-green-600 dark:text-green-400">
            <span>🔔</span>
            <span>Alertes activées</span>
          </div>
        )}
        {user && (
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <span>🚪</span>
            <span>Se déconnecter</span>
          </button>
        )}
      </div>
    </aside>
  );
}

/* ── Mobile top header ───────────────────────────────────── */
export function MobileHeader() {
  const { darkMode, toggleDark } = useApp();
  const { user } = useAuth();
  const { permission, request } = useNotifPermission();

  return (
    <header
      className="md:hidden flex items-center justify-between px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shrink-0"
      style={{ height: '52px', paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">📅</span>
        <span className="font-black text-base text-gray-900 dark:text-white tracking-tight">MyDayAI</span>
      </div>
      <div className="flex items-center gap-1.5">
        {permission !== 'granted' && permission !== 'denied' && (
          <button
            onClick={request}
            title="Activer les notifications"
            className="p-1.5 rounded-lg text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/20 transition-colors"
          >
            🔔
          </button>
        )}
        {user && (
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <button
          onClick={toggleDark}
          className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}

/* ── Mobile bottom nav ───────────────────────────────────── */
export function BottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50 flex"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {links.map(l => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center pt-2 pb-1.5 transition-colors ${
              isActive ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className={`text-[20px] leading-none mb-0.5 transition-transform duration-150 ${isActive ? 'scale-110' : ''}`}>
                {l.icon}
              </span>
              <span className={`text-[9px] font-medium leading-none ${isActive ? 'font-semibold text-blue-600' : ''}`}>
                {l.short}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
