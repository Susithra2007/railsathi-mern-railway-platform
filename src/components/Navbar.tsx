import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Bell,
  Sparkles,
  User,
  ShieldCheck,
  Globe,
  Radio,
  LogOut,
  LogIn,
  Ticket,
  ChevronDown,
  UserPlus,
  HelpCircle,
  KeyRound,
  Check,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenAiAssistant: () => void;
  onOpenAuthModal: (mode?: 'LOGIN' | 'REGISTER') => void;
  onOpenWorkflowGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  unreadCount,
  onOpenNotifications,
  onOpenAiAssistant,
  onOpenAuthModal,
  onOpenWorkflowGuide,
}) => {
  const { user, logout, isAdmin, isLoggedIn, loginDemo } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 sm:gap-6 h-16">
          {/* Brand Wordmark */}
          <button
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-sm shrink-0"
          >
            <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-black text-slate-950 text-base tracking-tighter shadow-sm">
              RS
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white whitespace-nowrap">
                {t('brand_title')}
              </span>
              <span className="hidden sm:inline text-[9px] text-amber-400 font-mono tracking-wider uppercase font-semibold">
                Digital Passenger Portal
              </span>
            </div>
          </button>

          {/* Navigation links */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium">
            <button
              onClick={() => setCurrentTab('search')}
              className={`whitespace-nowrap transition-colors hover:text-amber-400 py-1 ${
                currentTab === 'search' ? 'text-amber-400 font-semibold border-b-2 border-amber-400' : 'text-slate-300'
              }`}
            >
              {t('nav_search')}
            </button>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`whitespace-nowrap transition-colors hover:text-amber-400 py-1 ${
                currentTab === 'dashboard' ? 'text-amber-400 font-semibold border-b-2 border-amber-400' : 'text-slate-300'
              }`}
            >
              {t('nav_companion')}
            </button>
            <button
              onClick={() => setCurrentTab('tracking')}
              className={`whitespace-nowrap transition-colors hover:text-amber-400 py-1 flex items-center gap-1.5 ${
                currentTab === 'tracking' ? 'text-amber-400 font-semibold border-b-2 border-amber-400' : 'text-slate-300'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-blue-400" />
              <span>Live Tracking</span>
            </button>
            <button
              onClick={() => setCurrentTab('bookings')}
              className={`whitespace-nowrap transition-colors hover:text-amber-400 py-1 ${
                currentTab === 'bookings' ? 'text-amber-400 font-semibold border-b-2 border-amber-400' : 'text-slate-300'
              }`}
            >
              {t('nav_bookings')}
            </button>
            <button
              onClick={() => setCurrentTab('pnr')}
              className={`whitespace-nowrap transition-colors hover:text-amber-400 py-1 ${
                currentTab === 'pnr' ? 'text-amber-400 font-semibold border-b-2 border-amber-400' : 'text-slate-300'
              }`}
            >
              {t('nav_pnr')}
            </button>
            {isAdmin && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`whitespace-nowrap transition-colors hover:text-amber-400 py-1 flex items-center gap-1.5 ${
                  currentTab === 'admin' ? 'text-amber-400 font-semibold border-b-2 border-amber-400' : 'text-slate-300'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Admin Console</span>
              </button>
            )}
          </nav>

          {/* Action & Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Workflow Guide CTA */}
            {onOpenWorkflowGuide && (
              <button
                onClick={onOpenWorkflowGuide}
                className="hidden xl:flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title="View Platform Workflow & Architecture Guide"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">Workflow Guide</span>
              </button>
            )}

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium hidden sm:inline">{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>

            {/* Notification Drawer Toggle */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* AUTHENTICATION CONTROLS */}
            {isLoggedIn && user ? (
              /* Logged In State */
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-colors shadow-xs"
                >
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] sm:max-w-[130px] truncate font-medium">{user.name}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                    user.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {user.role}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Signed in as</p>
                      <p className="text-xs font-bold text-slate-900 truncate mt-0.5">{user.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{user.email}</p>
                    </div>

                    <div className="py-1 text-xs">
                      <button
                        onClick={() => {
                          setCurrentTab('dashboard');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium"
                      >
                        <User className="w-3.5 h-3.5 text-amber-600" />
                        <span>Passenger Dashboard</span>
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTab('bookings');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium"
                      >
                        <Ticket className="w-3.5 h-3.5 text-blue-600" />
                        <span>My Bookings</span>
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setCurrentTab('admin');
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-amber-50 text-amber-900 flex items-center gap-2.5 font-semibold"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                          <span>Admin Console</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2.5 text-xs font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-600" />
                        <span>Sign Out ({user.email})</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Logged Out / Guest State */
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Sign In Button */}
                <button
                  onClick={() => onOpenAuthModal('LOGIN')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg border border-slate-700 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-300" />
                  <span>Sign In</span>
                </button>

                {/* Sign Up / Register Button */}
                <button
                  onClick={() => onOpenAuthModal('REGISTER')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>

                {/* Demo Accounts Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowDemoMenu(!showDemoMenu)}
                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
                    title="Quick Demo Testing Credentials"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                  </button>

                  {showDemoMenu && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200 p-3 z-50 text-xs space-y-2">
                      <div className="border-b border-slate-100 pb-2">
                        <p className="font-bold text-slate-900 text-xs">Quick Demo Profiles</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Instant 1-click test sign in for evaluation:
                        </p>
                      </div>

                      <button
                        onClick={async () => {
                          await loginDemo('PASSENGER');
                          setShowDemoMenu(false);
                        }}
                        className="w-full text-left p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors block"
                      >
                        <div className="font-bold text-amber-950 flex items-center justify-between">
                          <span>Passenger (Priya Sharma)</span>
                          <span className="text-[10px] font-mono text-amber-700">PASSENGER</span>
                        </div>
                        <div className="text-[10px] text-amber-800 font-mono mt-0.5">
                          passenger@rail.in / pass123
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Has active confirmed Vande Bharat booking #482-910-3847
                        </div>
                      </button>

                      <button
                        onClick={async () => {
                          await loginDemo('ADMIN');
                          setShowDemoMenu(false);
                        }}
                        className="w-full text-left p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors block"
                      >
                        <div className="font-bold text-slate-900 flex items-center justify-between">
                          <span>Admin (Rajesh Kumar)</span>
                          <span className="text-[10px] font-mono text-slate-600">ADMIN</span>
                        </div>
                        <div className="text-[10px] text-slate-700 font-mono mt-0.5">
                          admin@rail.in / admin123
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Full fleet controls, live delays, and all bookings
                        </div>
                      </button>

                      <div className="pt-1 text-center">
                        <button
                          onClick={() => {
                            setShowDemoMenu(false);
                            onOpenAuthModal('REGISTER');
                          }}
                          className="text-[11px] font-semibold text-amber-700 hover:text-amber-800"
                        >
                          + Or register your own custom email
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-slate-800 text-xs overflow-x-auto gap-2">
          <button
            onClick={() => setCurrentTab('search')}
            className={`px-2 py-1 whitespace-nowrap ${currentTab === 'search' ? 'text-amber-400 font-semibold' : 'text-slate-300'}`}
          >
            {t('nav_search')}
          </button>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-2 py-1 whitespace-nowrap ${currentTab === 'dashboard' ? 'text-amber-400 font-semibold' : 'text-slate-300'}`}
          >
            {t('nav_companion')}
          </button>
          <button
            onClick={() => setCurrentTab('tracking')}
            className={`px-2 py-1 whitespace-nowrap ${currentTab === 'tracking' ? 'text-amber-400 font-semibold' : 'text-slate-300'}`}
          >
            Tracking
          </button>
          <button
            onClick={() => setCurrentTab('bookings')}
            className={`px-2 py-1 whitespace-nowrap ${currentTab === 'bookings' ? 'text-amber-400 font-semibold' : 'text-slate-300'}`}
          >
            Bookings
          </button>
          <button
            onClick={() => setCurrentTab('pnr')}
            className={`px-2 py-1 whitespace-nowrap ${currentTab === 'pnr' ? 'text-amber-400 font-semibold' : 'text-slate-300'}`}
          >
            PNR
          </button>
          {isAdmin && (
            <button
              onClick={() => setCurrentTab('admin')}
              className={`px-2 py-1 whitespace-nowrap text-amber-400 font-semibold`}
            >
              Admin
            </button>
          )}
          {onOpenWorkflowGuide && (
            <button
              onClick={onOpenWorkflowGuide}
              className="px-2 py-1 whitespace-nowrap text-amber-300 font-semibold"
            >
              Guide
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
