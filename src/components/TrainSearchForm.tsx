import React, { useState } from 'react';
import { Station } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeftRight, Calendar, Search, MapPin, Sparkles } from 'lucide-react';

interface TrainSearchFormProps {
  stations: Station[];
  onSearch: (params: { from: string; to: string; date: string; classCode?: string }) => void;
  initialFrom?: string;
  initialTo?: string;
  initialDate?: string;
  initialClass?: string;
  compact?: boolean;
}

export const TrainSearchForm: React.FC<TrainSearchFormProps> = ({
  stations,
  onSearch,
  initialFrom = 'MAS',
  initialTo = 'SBC',
  initialDate,
  initialClass = '',
  compact = false,
}) => {
  const { t } = useLanguage();

  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [fromStation, setFromStation] = useState(initialFrom);
  const [toStation, setToStation] = useState(initialTo);
  const [journeyDate, setJourneyDate] = useState(initialDate || getTomorrowDate());
  const [selectedClass, setSelectedClass] = useState(initialClass);

  const handleSwap = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      from: fromStation,
      to: toStation,
      date: journeyDate,
      classCode: selectedClass || undefined,
    });
  };

  const popularRoutes = [
    { from: 'MAS', to: 'SBC', label: 'Chennai ↔ Bengaluru' },
    { from: 'NDLS', to: 'MAS', label: 'Delhi ↔ Chennai' },
    { from: 'CSMT', to: 'NDLS', label: 'Mumbai ↔ Delhi' },
    { from: 'MAS', to: 'CBE', label: 'Chennai ↔ Coimbatore' },
  ];

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-slate-200 ${compact ? 'p-4' : 'p-6 sm:p-8'}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Source Station */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              {t('from_station')}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <select
                value={fromStation}
                onChange={(e) => setFromStation(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium transition-all"
                required
              >
                {stations.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.city} ({s.code}) - {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center pb-1">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2.5 rounded-full bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 border border-slate-200 transition-colors"
              title="Swap Stations"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Destination Station */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              {t('to_station')}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <select
                value={toStation}
                onChange={(e) => setToStation(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium transition-all"
                required
              >
                {stations.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.city} ({s.code}) - {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Journey Date */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              {t('travel_date')}
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="date"
                value={journeyDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium transition-all"
                required
              />
            </div>
          </div>
        </div>

        {/* Secondary Row: Class & Submit */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-1">
          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              {t('class_label')} (Optional)
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="">All Travel Classes</option>
              <option value="1A">AC First Class (1A / Executive)</option>
              <option value="2A">AC 2-Tier (2A)</option>
              <option value="3A">AC 3-Tier (3A)</option>
              <option value="CC">AC Chair Car (CC)</option>
              <option value="SL">Sleeper Class (SL)</option>
              <option value="2S">Second Sitting (2S)</option>
            </select>
          </div>

          {/* Quick Popular Corridors */}
          <div className="md:col-span-5 flex flex-wrap items-center gap-1.5 pt-4 md:pt-0">
            <span className="text-[11px] text-slate-500 font-medium">Corridors:</span>
            {popularRoutes.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setFromStation(r.from);
                  setToStation(r.to);
                }}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-amber-50 hover:text-amber-900 text-slate-600 transition-colors border border-slate-200"
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Search Submit CTA */}
          <div className="md:col-span-3 flex justify-end pt-2 md:pt-0">
            <button
              type="submit"
              className="w-full py-2.5 px-5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold text-sm rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>{t('search_button')}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
