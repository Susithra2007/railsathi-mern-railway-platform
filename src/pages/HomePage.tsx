import React, { useState } from 'react';
import { Station, Train } from '../types';
import { TrainSearchForm } from '../components/TrainSearchForm';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Shield,
  Clock,
  Search,
  ArrowRight,
  Zap,
  CheckCircle2,
  MapPin,
  UserPlus,
  LogIn,
  HelpCircle,
  Ticket,
  Radio,
  FileText,
  KeyRound,
} from 'lucide-react';

interface HomePageProps {
  stations: Station[];
  onSearch: (params: { from: string; to: string; date: string; classCode?: string }) => void;
  onCheckPnr: (pnr: string) => void;
  onExploreTrain: (train: Train) => void;
  featuredTrains: Train[];
  onOpenAuthModal?: (mode?: 'LOGIN' | 'REGISTER') => void;
  onOpenWorkflowGuide?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  stations,
  onSearch,
  onCheckPnr,
  featuredTrains,
  onOpenAuthModal,
  onOpenWorkflowGuide,
}) => {
  const { t } = useLanguage();
  const { user, isLoggedIn, loginDemo } = useAuth();
  const [quickPnr, setQuickPnr] = useState('');

  const handleQuickPnrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickPnr.trim()) {
      onCheckPnr(quickPnr.trim());
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section with High-Fidelity Train Image */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-2xl border border-slate-800">
        {/* Background Image with Contrast Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_vande_bharat_1791947010608.jpg"
            alt="Indian Railways Vande Bharat High-Speed Train"
            className="w-full h-full object-cover opacity-35 filter brightness-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-900/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 sm:py-16 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Next-Generation Railway Passenger Experience · MERN Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto text-balance">
            Smart Journey Planning, Instant Seat Booking &amp; Real-Time Tracking
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Search scheduled trains across Indian Railway routes, verify transparent distance-based fares, check live seat availability, and manage your journeys.
          </p>

          {/* Guest Onboarding Banner */}
          {!isLoggedIn ? (
            <div className="max-w-xl mx-auto p-3.5 rounded-2xl bg-slate-950/80 border border-slate-700/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs text-left">
              <div>
                <span className="font-bold text-amber-400 block">Personalized Passenger Experience</span>
                <span className="text-slate-300 text-[11px]">
                  Register your own email or sign in to track live status and download e-tickets.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuthModal && onOpenAuthModal('REGISTER')}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-lg transition-all shadow-xs flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register Free</span>
                </button>
                <button
                  onClick={() => onOpenAuthModal && onOpenAuthModal('LOGIN')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-300" />
                  <span>Sign In</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Signed in as <strong>{user?.name}</strong> ({user?.email}) · Ready to book tickets</span>
            </div>
          )}

          {/* Search Form Card Overlay */}
          <div className="pt-2 text-left">
            <TrainSearchForm stations={stations} onSearch={onSearch} />
          </div>
        </div>
      </div>

      {/* Interactive Architecture & Workflow Walkthrough Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 text-white shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 mb-2">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Complete System Workflow</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                How RailSathi Digital Railway Platform Works
              </h2>
              <p className="text-slate-400 text-xs max-w-2xl mt-1 leading-relaxed">
                A seamless passenger journey from registration to arrival. Designed for university evaluation and real-world compliance.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 shrink-0">
              {onOpenWorkflowGuide && (
                <button
                  onClick={onOpenWorkflowGuide}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md"
                >
                  <FileText className="w-4 h-4" />
                  <span>Open Full Architecture Guide</span>
                </button>
              )}
            </div>
          </div>

          {/* 4 Core Lifecycle Stages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <span className="text-[10px] font-mono text-slate-400">AUTH &amp; PROFILES</span>
              </div>
              <h3 className="font-bold text-white text-sm">Register &amp; Sign In</h3>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Create a personal account with name, email, and password (salted &amp; hashed via bcrypt). Access your clean passenger dashboard.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <span className="text-[10px] font-mono text-slate-400">SEARCH &amp; INVENTORY</span>
              </div>
              <h3 className="font-bold text-white text-sm">Schedules &amp; Live Seats</h3>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Search origin to destination. View route distance, travel duration, class fares, and atomic seat availability (1A, 2A, 3A, SL, CC).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <span className="text-[10px] font-mono text-slate-400">BOOKING &amp; PNR</span>
              </div>
              <h3 className="font-bold text-white text-sm">10-Digit PNR &amp; E-Ticket</h3>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Enter passenger details and berth preferences. Receive unique 10-digit PNR, assigned coach &amp; seat numbers, and printable ticket slip.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <span className="text-[10px] font-mono text-slate-400">TRACKING &amp; REFUND</span>
              </div>
              <h3 className="font-bold text-white text-sm">Live Tracking &amp; Cancellation</h3>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Track train status, delay, and platforms in real-time. Cancel anytime with IRCTC deduction calculations and instant inventory release.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick PNR Lookup & Service Highlights Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Quick PNR Checker Widget */}
          <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Search className="w-4 h-4 text-amber-600" />
              <span>Instant PNR Status &amp; Coach Tracker</span>
            </div>
            <p className="text-xs text-slate-500">
              Check live confirmation status, allocated coach, and berth number for any 10-digit PNR.
            </p>
            <form onSubmit={handleQuickPnrSubmit} className="flex gap-2 pt-1">
              <input
                type="text"
                value={quickPnr}
                onChange={(e) => setQuickPnr(e.target.value)}
                placeholder="e.g. 482-910-3847"
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:bg-white focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-lg transition-colors whitespace-nowrap"
              >
                {t('check_pnr')}
              </button>
            </form>
          </div>

          {/* Core Novel Feature Highlights */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="p-2 w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Smart Companion</h4>
              <p className="text-slate-500 leading-relaxed">
                Visual station route timeline, intermediate halts, platform info, and packing checklist.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="p-2 w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Alternative Explorer</h4>
              <p className="text-slate-500 leading-relaxed">
                Suggests alternative timings and connecting routes through hubs when trains are waitlisted.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="p-2 w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Admin Station Master</h4>
              <p className="text-slate-500 leading-relaxed">
                Simulate delays, update platform announcements, broadcast status, and audit fleet bookings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
