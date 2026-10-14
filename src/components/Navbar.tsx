import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Bell, Sparkles, User, ShieldCheck, Globe } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenAiAssistant: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  unreadCount,
  onOpenNotifications,
  onOpenAiAssistant,
}) => {
  const { user, switchRole, isAdmin } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element Brand Wordmark */}
          <button
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-sm"
          >
            <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-black text-slate-950 text-base tracking-tighter">
              RS
            </div>
            <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0">
              {t('brand_title')}
            </span>
          </button>

          {/* Zone 2: Concise single-line navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => setCurrentTab('search')}
              className={`whitespace-nowrap transition-colors hover:text-amber-400 ${
                currentTab === 'search' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-1' : 'text-slate-300'
              }`}
            >
              {t('nav_search')}
            </button>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`whitespace-nowrap transition-colors hover:text-amber-400 ${
                currentTab === 'dashboard' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-1' : 'text-slate-300'
              }`}
            >
              {t('nav_companion')}
            </button>
            <button
              onClick={() => setCurrentTab('bookings')}
              className={`whitespace-nowrap transition-colors hover:text-amber-400 ${
                currentTab === 'bookings' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-1' : 'text-slate-300'
              }`}
            >
              {t('nav_bookings')}
            </button>
            <button
              onClick={() => setCurrentTab('pnr')}
              className={`whitespace-nowrap transition-colors hover:text-amber-400 ${
                currentTab === 'pnr' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-1' : 'text-slate-300'
              }`}
            >
              {t('nav_pnr')}
            </button>
            <button
              onClick={() => setCurrentTab('admin')}
              className={`whitespace-nowrap transition-colors hover:text-amber-400 flex items-center gap-1.5 ${
                currentTab === 'admin' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-1' : 'text-slate-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              {t('nav_admin')}
            </button>
          </nav>

          {/* Zone 3: Primary Action & Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium">{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>

            {/* Notification Drawer Toggle */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline max-w-[110px] truncate">{user?.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-amber-300">
                  {user?.role}
                </span>
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-md bg-white text-slate-900 shadow-xl border border-slate-200 py-1 z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-500">Logged in as</p>
                    <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        switchRole('PASSENGER');
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 ${
                        !isAdmin ? 'bg-amber-50 text-amber-900 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <span>Switch to Passenger Mode</span>
                      {!isAdmin && <span className="text-amber-600 text-[10px]">Active</span>}
                    </button>
                    <button
                      onClick={() => {
                        switchRole('ADMIN');
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 ${
                        isAdmin ? 'bg-amber-50 text-amber-900 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <span>Switch to Admin Mode</span>
                      {isAdmin && <span className="text-amber-600 text-[10px]">Active</span>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => setCurrentTab('search')}
            className={`px-2 py-1 ${currentTab === 'search' ? 'text-amber-400 font-semibold' : 'text-slate-300'}`}
          >
            {t('nav_search')}
          </button>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-2 py-1 ${currentTab === 'dashboard' ? 'text-amber-400 font-semibold' : 'text-slate-300'}`}
          >
            {t('nav_companion')}
          </button>
          <button
            onClick={() => setCurrentTab('bookings')}
            className={`px-2 py-1 ${currentTab === 'bookings' ? 'text-amber-400 font-semibold' : 'text-slate-300'}`}
          >
            {t('nav_bookings')}
          </button>
          <button
            onClick={() => setCurrentTab('pnr')}
            className={`px-2 py-1 ${currentTab === 'pnr' ? 'text-amber-400 font-semibold' : 'text-slate-300'}`}
          >
            {t('nav_pnr')}
          </button>
          <button
            onClick={() => setCurrentTab('admin')}
            className={`px-2 py-1 ${currentTab === 'admin' ? 'text-amber-400 font-semibold' : 'text-slate-300'}`}
          >
            {t('nav_admin')}
          </button>
        </div>
      </div>
    </header>
  );
};
