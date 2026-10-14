import React, { useState } from 'react';
import { Station, Train } from '../types';
import { TrainSearchForm } from '../components/TrainSearchForm';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, Shield, Clock, Search, ArrowRight, Zap, CheckCircle2, MapPin } from 'lucide-react';

interface HomePageProps {
  stations: Station[];
  onSearch: (params: { from: string; to: string; date: string; classCode?: string }) => void;
  onCheckPnr: (pnr: string) => void;
  onExploreTrain: (train: Train) => void;
  featuredTrains: Train[];
}

export const HomePage: React.FC<HomePageProps> = ({
  stations,
  onSearch,
  onCheckPnr,
  featuredTrains,
}) => {
  const { t } = useLanguage();
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
            <span>Next-Generation Railway Passenger Experience</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto text-balance">
            Smart Journey Planning, Instant Seat Booking & Real-Time Tracking
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Search scheduled trains, verify transparent class-wise seat inventory, receive live status notifications, and access your smart journey companion.
          </p>

          {/* Search Form Card Overlay */}
          <div className="pt-4 text-left">
            <TrainSearchForm stations={stations} onSearch={onSearch} />
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
              <span>Instant PNR Status & Coach Tracker</span>
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
              <h4 className="font-bold text-slate-900 text-sm">Transparent Fares</h4>
              <p className="text-slate-500 leading-relaxed">
                Deterministic distance-based pricing with transparent base fare, reservation charges & GST.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Fleet Corridor Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Popular High-Speed Rail Corridors</h2>
            <p className="text-xs text-slate-500">
              Major express lines operated across Southern, Northern, and Central railway zones
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featuredTrains.slice(0, 3).map((train) => (
            <div
              key={train.trainNumber}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                    #{train.trainNumber}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {train.trainType.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mt-2">{train.trainName}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                  <span>{train.sourceName}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>{train.destinationName}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-2">
                  Dep: <strong className="font-mono text-slate-800">{train.departureTime}</strong> · Duration: <strong>{train.duration}</strong> ({train.distanceKm} km)
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-600">
                  Classes: <strong className="text-slate-900">{train.classes.map((c) => c.classCode).join(', ')}</strong>
                </span>
                <button
                  onClick={() =>
                    onSearch({
                      from: train.sourceCode,
                      to: train.destinationCode,
                      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                    })
                  }
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                >
                  <span>Check Seats</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
