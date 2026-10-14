import React, { useState } from 'react';
import { AlternativeJourneyOption, SeatClassCode, Station, Train } from '../types';
import { TrainCard } from '../components/TrainCard';
import { AlternativeExplorer } from '../components/AlternativeExplorer';
import { TrainSearchForm } from '../components/TrainSearchForm';
import { Filter, ArrowUpDown, AlertCircle, Train as TrainIcon, Sparkles } from 'lucide-react';

interface SearchResultsPageProps {
  trains: Train[];
  stations: Station[];
  searchParams: { from: string; to: string; date: string; classCode?: string };
  onSearch: (params: { from: string; to: string; date: string; classCode?: string }) => void;
  onBook: (train: Train, classCode: SeatClassCode) => void;
  onViewSchedule: (train: Train) => void;
  alternatives?: {
    directAlternatives: AlternativeJourneyOption[];
    connectingAlternatives: AlternativeJourneyOption[];
  };
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  trains,
  stations,
  searchParams,
  onSearch,
  onBook,
  onViewSchedule,
  alternatives,
}) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'departure' | 'duration'>('departure');

  const sourceStation = stations.find((s) => s.code === searchParams.from);
  const destStation = stations.find((s) => s.code === searchParams.to);

  // Filtering
  const filteredTrains = trains.filter((train) => {
    if (selectedType !== 'ALL' && train.trainType !== selectedType) {
      return false;
    }

    if (selectedTimeOfDay !== 'ALL') {
      const depHour = parseInt(train.departureTime.split(':')[0], 10);
      if (selectedTimeOfDay === 'MORNING' && (depHour < 6 || depHour >= 12)) return false;
      if (selectedTimeOfDay === 'AFTERNOON' && (depHour < 12 || depHour >= 18)) return false;
      if (selectedTimeOfDay === 'NIGHT' && depHour < 18) return false;
      if (selectedTimeOfDay === 'EARLY' && depHour >= 6) return false;
    }

    return true;
  });

  // Sorting
  const sortedTrains = [...filteredTrains].sort((a, b) => {
    if (sortBy === 'departure') {
      return a.departureTime.localeCompare(b.departureTime);
    } else {
      return parseInt(a.duration) - parseInt(b.duration);
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Search Modifying Bar */}
      <TrainSearchForm
        stations={stations}
        onSearch={onSearch}
        initialFrom={searchParams.from}
        initialTo={searchParams.to}
        initialDate={searchParams.date}
        compact={true}
      />

      {/* Corridor Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              {sourceStation?.city || searchParams.from} ({searchParams.from}) → {destStation?.city || searchParams.to} ({searchParams.to})
            </h2>
            <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
              {sortedTrains.length} Train{sortedTrains.length !== 1 ? 's' : ''} Found
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Journey Date: {searchParams.date} · Class: {searchParams.classCode || 'All Classes'}
          </p>
        </div>

        {/* Filters and Sort Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Train Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium"
          >
            <option value="ALL">All Train Types</option>
            <option value="VANDE_BHARAT">Vande Bharat</option>
            <option value="RAJDHANI">Rajdhani Express</option>
            <option value="SUPERFAST">Superfast Special</option>
          </select>

          {/* Time of Day */}
          <select
            value={selectedTimeOfDay}
            onChange={(e) => setSelectedTimeOfDay(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium"
          >
            <option value="ALL">All Departure Times</option>
            <option value="EARLY">Early Morning (00:00 - 06:00)</option>
            <option value="MORNING">Morning (06:00 - 12:00)</option>
            <option value="AFTERNOON">Afternoon (12:00 - 18:00)</option>
            <option value="NIGHT">Evening / Night (18:00 - 24:00)</option>
          </select>

          {/* Sort By */}
          <button
            onClick={() => setSortBy(sortBy === 'departure' ? 'duration' : 'departure')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center gap-1.5 transition-colors border border-slate-200"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort: {sortBy === 'departure' ? 'Departure Time' : 'Travel Duration'}</span>
          </button>
        </div>
      </div>

      {/* Train Cards List */}
      {sortedTrains.length > 0 ? (
        <div className="space-y-4">
          {sortedTrains.map((train) => (
            <TrainCard
              key={train.trainNumber}
              train={train}
              travelDate={searchParams.date}
              onBook={onBook}
              onViewSchedule={onViewSchedule}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <TrainIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              No Direct Trains Operating on Filtered Criteria
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              There are no trains directly matching your criteria for {searchParams.from} → {searchParams.to}. Please check our smart alternative journeys below!
            </p>
          </div>
        </div>
      )}

      {/* Alternative Journey Explorer Integration */}
      {alternatives && (alternatives.directAlternatives.length > 0 || alternatives.connectingAlternatives.length > 0) && (
        <AlternativeExplorer
          directAlternatives={alternatives.directAlternatives}
          connectingAlternatives={alternatives.connectingAlternatives}
          onSelectAlternative={(option) => {
            if (option.trainNumber) {
              const matched = trains.find((t) => t.trainNumber === option.trainNumber);
              if (matched) {
                onBook(matched, option.recommendedClass || 'CC');
              }
            } else if (option.hubCode) {
              onSearch({
                from: searchParams.from,
                to: option.hubCode,
                date: searchParams.date,
              });
            }
          }}
        />
      )}
    </div>
  );
};
