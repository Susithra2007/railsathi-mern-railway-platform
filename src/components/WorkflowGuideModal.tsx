import React from 'react';
import {
  X,
  UserCheck,
  Search,
  Calculator,
  Ticket,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Database,
  Lock,
} from 'lucide-react';

interface WorkflowGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: (mode?: 'LOGIN' | 'REGISTER') => void;
}

export const WorkflowGuideModal: React.FC<WorkflowGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      num: '01',
      title: 'Registration & BCrypt Authentication',
      icon: UserCheck,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      description:
        'Passengers register with their real name, unique email, phone number, and password. Passwords are salted and hashed using bcryptjs. JWT session tokens secure passenger and admin roles. Role-Based Access Control (RBAC) strictly prevents passenger privilege escalation.',
    },
    {
      num: '02',
      title: 'Station Matrix & Train Schedule Search',
      icon: Search,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      description:
        'Passengers search trains by Origin station, Destination station, and Journey date. The route finder checks halts, departure/arrival schedules, train type (Vande Bharat, Rajdhani, Superfast, Mail/Express), and pantry services across Indian Railway zones.',
    },
    {
      num: '03',
      title: 'Distance-Based Transparent Fare Calculator',
      icon: Calculator,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      description:
        'Fares are accurately computed from calibrated track distances (km) × class rate per km (1A, 2A, 3A, SL, CC, 2S) + standard railway reservation fees + superfast surcharges + 5% GST. No random guessing or mock numbers.',
    },
    {
      num: '04',
      title: 'Live Seat Inventory & Quota Ledger',
      icon: Database,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      description:
        'Class-wise seat availability is tracked atomically per train, class, and journey date. Confirmed seats, RAC, and Waitlist quotas are updated immediately upon reservation to prevent duplicate seat allocation.',
    },
    {
      num: '05',
      title: 'Booking Engine & 10-Digit PNR Generation',
      icon: Ticket,
      color: 'text-violet-600 bg-violet-50 border-violet-200',
      description:
        'Upon entering passenger names, ages, and berth preferences (Lower, Middle, Upper, Side), an atomic reservation is confirmed. The system issues a unique 10-digit PNR, allocates Coach & Berth numbers (e.g. C3-24, B2-18), and generates a printable E-Ticket.',
    },
    {
      num: '06',
      title: 'Real-Time Train Tracking & Journey Companion',
      icon: Radio,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
      description:
        'Tracks current station, next station, delay in minutes, and platform position along a dynamic visual timeline. Includes packing checklist, boarding reminders, and real-time alerts.',
    },
    {
      num: '07',
      title: 'IRCTC-Compliant Cancellation & Refunds',
      icon: RefreshCw,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      description:
        'Passengers can cancel confirmed tickets from their booking history. The cancellation engine applies official timing-based deduction rules, calculates exact refund amounts, marks status as CANCELLED, and restores the seat count to the inventory.',
    },
    {
      num: '08',
      title: 'Admin Fleet Oversight & Status Broadcast',
      icon: ShieldCheck,
      color: 'text-amber-700 bg-amber-100 border-amber-300',
      description:
        'Protected Station Master console (role: ADMIN) providing real-time fleet management: create new trains, update delay minutes, assign platforms, modify fare rules, and inspect total passenger bookings.',
    },
    {
      num: '09',
      title: 'Smart AI Assistant Grounded in Railway Data',
      icon: Sparkles,
      color: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200',
      description:
        'Powered by Gemini AI to answer passenger queries about luggage rules, senior citizen concessions, tatkal booking timings, and station amenities, with intelligent offline deterministic fallbacks.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-semibold border border-amber-500/30">
              <span>MERN College Project Architecture &amp; Lifecycle</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              RailSathi Platform End-to-End Workflow Guide
            </h2>
            <p className="text-xs text-slate-300">
              Comprehensive walkthrough of modules, user journeys, data flow, and review examination criteria.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Quick Summary Pill */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-sm">How to Test the User Workflow Right Now:</p>
              <p className="text-xs text-amber-900 mt-1">
                You can create a new account with your own email (or use demo accounts), search MAS → SBC, book a ticket, view the generated 10-digit PNR slip, simulate live train status, and test ticket cancellation!
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth('REGISTER');
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-xs"
              >
                Sign Up as New Passenger
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth('LOGIN');
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs"
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Workflow Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.num}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-amber-300 hover:shadow-xs transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl border ${s.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{s.title}</h4>
                    </div>
                    <span className="font-mono text-xs font-black text-slate-400">
                      STEP {s.num}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">{s.description}</p>
                </div>
              );
            })}
          </div>

          {/* Technology Stack Verification Summary */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
            <h4 className="font-bold text-sm text-amber-400 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Security &amp; Technology Stack Architecture</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700">
                <strong className="text-white block">Authentication &amp; Security</strong>
                <p className="text-[11px] mt-1 text-slate-400">
                  bcrypt password hashing (10 salt rounds), JWT Bearer tokens, protected Express routes, RBAC authorization.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700">
                <strong className="text-white block">Backend &amp; Database</strong>
                <p className="text-[11px] mt-1 text-slate-400">
                  Node.js + Express.js REST APIs, file-backed atomic JSON store with schema collections, centralized error handling.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700">
                <strong className="text-white block">Frontend &amp; Responsive UI</strong>
                <p className="text-[11px] mt-1 text-slate-400">
                  React 19 + TypeScript + Tailwind CSS, bilingual English &amp; Tamil support, real-time tracking, print-ready tickets.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 shrink-0">
          <span>RailSathi Railway Passenger Digital Platform</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
