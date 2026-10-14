import React from 'react';
import { Train } from '../types';
import { X, MapPin, Clock } from 'lucide-react';

interface StationScheduleModalProps {
  train: Train;
  onClose: () => void;
}

export const StationScheduleModal: React.FC<StationScheduleModalProps> = ({ train, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold">Route Schedule & Intermediate Halts</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {train.trainName} (#{train.trainNumber}) · Total Distance: {train.distanceKm} km
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">Station Name</th>
                  <th className="py-3 px-3 font-mono">Code</th>
                  <th className="py-3 px-3">Arr. Time</th>
                  <th className="py-3 px-3">Dep. Time</th>
                  <th className="py-3 px-3">Halt</th>
                  <th className="py-3 px-3">Distance</th>
                  <th className="py-3 px-3">Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {train.stops.map((stop, idx) => (
                  <tr key={stop.stationCode} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                      {stop.stationName}
                    </td>
                    <td className="py-2.5 px-3 text-amber-900 font-bold">{stop.stationCode}</td>
                    <td className="py-2.5 px-3 text-slate-700">{stop.arrivalTime}</td>
                    <td className="py-2.5 px-3 text-slate-700">{stop.departureTime}</td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {stop.haltMinutes > 0 ? `${stop.haltMinutes}m` : 'Starts/Ends'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{stop.distanceKm} km</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold text-[10px]">
                        PF {stop.platform}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
