import React from 'react';
import { JourneyNotification } from '../types';
import { X, Bell, CheckCheck, AlertTriangle, Train, Calendar, Info } from 'lucide-react';

interface NotificationDrawerProps {
  notifications: JourneyNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'DELAY':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'PLATFORM_CHANGE':
        return <Train className="w-4 h-4 text-blue-600" />;
      case 'BOOKING':
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col">
        {/* Drawer Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm">Real-Time Journey Updates</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List of Notifications */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 text-xs">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
              <p>No active journey alerts or updates.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  !notif.read
                    ? 'bg-white border-amber-300 shadow-xs ring-1 ring-amber-100'
                    : 'bg-white/80 border-slate-200 opacity-80'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{notif.title}</span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      )}
                    </div>
                    <p className="text-slate-600 leading-relaxed">{notif.message}</p>
                    <div className="text-[10px] text-slate-400 font-mono pt-1">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
