import React, { useState } from 'react';
import { SeatClassCode, Train } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Clock, ArrowRight, ShieldCheck, MapPin, Utensils, Star, Info } from 'lucide-react';

interface TrainCardProps {
  train: Train;
  travelDate: string;
  onBook: (train: Train, classCode: SeatClassCode) => void;
  onViewSchedule: (train: Train) => void;
}

export const TrainCard: React.FC<TrainCardProps> = ({
  train,
  travelDate,
  onBook,
  onViewSchedule,
}) => {
  const { t } = useLanguage();
  const [selectedClass, setSelectedClass] = useState<SeatClassCode>(
    train.classAvailabilities?.[0]?.classCode || train.classes[0]?.classCode || 'CC'
  );

  const getTrainTypeBadge = (type: string) => {
    switch (type) {
      case 'VANDE_BHARAT':
        return <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Vande Bharat Express</span>;
      case 'RAJDHANI':
        return <span className="text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">Rajdhani Express</span>;
      case 'SHATABDI':
        return <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">Shatabdi Express</span>;
      default:
        return <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Superfast Special</span>;
    }
  };

  const selectedClassInfo = train.classAvailabilities?.find((c) => c.classCode === selectedClass);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:border-slate-300 transition-all">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="font-mono font-bold text-slate-900 bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-xs">
            #{train.trainNumber}
          </span>
          <h3 className="font-bold text-slate-900 text-base">{train.trainName}</h3>
          {getTrainTypeBadge(train.trainType)}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          {train.pantryAvailable && (
            <span className="flex items-center gap-1 text-slate-600">
              <Utensils className="w-3.5 h-3.5 text-amber-600" />
              <span>Pantry</span>
            </span>
          )}
          <span className="flex items-center gap-1 font-semibold text-amber-700">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>{train.cleanlinessRating}</span>
          </span>
          <button
            onClick={() => onViewSchedule(train)}
            className="text-amber-800 hover:text-amber-950 font-semibold underline underline-offset-2 flex items-center gap-1 ml-2"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{t('view_stops')}</span>
          </button>
        </div>
      </div>

      {/* Main Schedule & Timing Grid */}
      <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Departure */}
        <div className="md:col-span-3 text-left">
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
            {train.departureTime}
          </div>
          <div className="font-semibold text-slate-800 text-sm">{train.sourceName}</div>
          <div className="text-xs text-slate-500 font-mono">({train.sourceCode})</div>
        </div>

        {/* Duration Arrow */}
        <div className="md:col-span-3 flex flex-col items-center justify-center text-center">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{train.duration}</span>
          </div>
          <div className="w-full flex items-center my-1.5">
            <div className="h-0.5 bg-slate-300 flex-1 relative">
              <div className="w-2 h-2 rounded-full bg-slate-400 absolute left-0 -top-[3px]"></div>
              <div className="w-2 h-2 rounded-full bg-amber-500 absolute right-0 -top-[3px]"></div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 -ml-1" />
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {train.distanceKm} km · {train.stops.length} halts
          </div>
        </div>

        {/* Arrival */}
        <div className="md:col-span-3 text-left md:text-right">
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
            {train.arrivalTime}
          </div>
          <div className="font-semibold text-slate-800 text-sm">{train.destinationName}</div>
          <div className="text-xs text-slate-500 font-mono">({train.destinationCode})</div>
        </div>

        {/* Live Status indicator */}
        <div className="md:col-span-3 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4 text-xs space-y-1">
          <div className="text-slate-500 font-medium">Live Status (Simulated):</div>
          {train.liveStatus?.delayMinutes === 0 ? (
            <div className="text-emerald-700 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Running On Time</span>
            </div>
          ) : (
            <div className="text-amber-700 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Delayed by {train.liveStatus?.delayMinutes || 15} mins</span>
            </div>
          )}
          <div className="text-[11px] text-slate-500">
            Platform: <strong className="text-slate-800">{train.liveStatus?.currentPlatform || train.stops[0]?.platform || 1}</strong>
          </div>
        </div>
      </div>

      {/* Class Availability & Booking Segment */}
      <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200">
        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2.5">
          Select Travel Class ({travelDate})
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-4">
          {(train.classAvailabilities || []).map((cls) => {
            const isSelected = selectedClass === cls.classCode;
            const isAvailable = cls.availableSeats > 0;

            return (
              <button
                key={cls.classCode}
                type="button"
                onClick={() => setSelectedClass(cls.classCode)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/70 shadow-sm ring-1 ring-amber-500'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{cls.classCode}</span>
                  <span className="font-mono text-xs font-bold text-slate-900">
                    ₹{cls.fare.grandTotal}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">{cls.className}</div>
                <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold font-mono ${
                      isAvailable ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {cls.status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Class Action Row */}
        {selectedClassInfo && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Class: <strong className="text-slate-800">{selectedClassInfo.className}</strong> · Base Fare ₹{selectedClassInfo.fare.baseFare} + Res Fee ₹{selectedClassInfo.fare.reservationCharge} + GST ₹{selectedClassInfo.fare.gstAmount}
              </span>
            </div>

            <button
              onClick={() => onBook(train, selectedClass)}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{t('book_now')}</span>
              <span className="font-mono text-white text-sm">₹{selectedClassInfo.fare.grandTotal}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
