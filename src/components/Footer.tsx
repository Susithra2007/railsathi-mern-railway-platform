import React from 'react';
import { Phone, AlertCircle, Shield, TrainTrack } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Context */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-amber-500 flex items-center justify-center font-black text-slate-950 text-xs">
                RS
              </div>
              <span className="text-white font-bold text-sm tracking-tight">RailSathi Digital</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              A MERN-based Railway Passenger Digital Platform engineered with Smart Journey Assistance, transparent seat inventory, and simulated real-time updates.
            </p>
            <div className="flex items-center gap-2 text-slate-500">
              <TrainTrack className="w-4 h-4 text-amber-500" />
              <span>Full-Stack College Demonstration Platform</span>
            </div>
          </div>

          {/* Passenger Helplines */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Emergency & Helplines</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Rail Madad All-in-One: <strong>139</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Railway Protection Force: <strong>182</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Medical & Security Emergency: <strong>112</strong></span>
              </li>
            </ul>
          </div>

          {/* Cancellation Guidelines */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">IRCTC Refund Slab Rules</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li>• &gt;48 hrs: Flat clerkage deduction (₹60 - ₹240)</li>
              <li>• 12 to 48 hrs: 25% of total ticket fare</li>
              <li>• 4 to 12 hrs: 50% of total ticket fare</li>
              <li>• &lt;4 hrs / Post Chart: No refund permissible</li>
            </ul>
          </div>

          {/* Demonstration Notice */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Evaluation Notice</h4>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Demonstration railway schedules and simulated status events are provided for academic evaluation. Fares are computed transparently based on distance multipliers.
            </p>
            <div className="text-[11px] text-slate-500">
              Powered by Node.js, Express, React, and Gemini AI.
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} RailSathi Digital Passenger Platform. Designed for College Final Project Demonstration.
          </div>
          <div className="flex items-center gap-4">
            <span>Security Verified</span>
            <span>·</span>
            <span>Atomic Inventory</span>
            <span>·</span>
            <span>Bilingual English / தமிழ்</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
