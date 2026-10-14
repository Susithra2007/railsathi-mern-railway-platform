import React, { useState } from 'react';
import { Booking, SeatClassCode, Train } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { X, Plus, Trash2, ShieldCheck, AlertCircle, Loader2, LogIn, Calculator } from 'lucide-react';

interface BookingModalProps {
  train: Train;
  classCode: SeatClassCode;
  travelDate: string;
  fromCode?: string;
  toCode?: string;
  onClose: () => void;
  onSuccess: (booking: Booking) => void;
  onOpenAuthModal: () => void;
}

interface PassengerInput {
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'TRANSGENDER';
  berthPreference: 'LOWER' | 'MIDDLE' | 'UPPER' | 'SIDE_LOWER' | 'SIDE_UPPER' | 'WINDOW' | 'NO_PREFERENCE';
}

export const BookingModal: React.FC<BookingModalProps> = ({
  train,
  classCode,
  travelDate,
  fromCode,
  toCode,
  onClose,
  onSuccess,
  onOpenAuthModal,
}) => {
  const { user, isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const classRule = train.classes.find((c) => c.classCode === classCode) || train.classes[0];

  const [passengers, setPassengers] = useState<PassengerInput[]>([
    {
      name: user?.name || '',
      age: 28,
      gender: 'MALE',
      berthPreference: 'LOWER',
    },
  ]);

  React.useEffect(() => {
    if (user?.name && (!passengers[0].name || passengers[0].name === '')) {
      const updated = [...passengers];
      updated[0] = { ...updated[0], name: user.name };
      setPassengers(updated);
    }
  }, [user]);

  const addPassenger = () => {
    if (passengers.length >= 4) return;
    setPassengers([
      ...passengers,
      {
        name: '',
        age: 30,
        gender: 'FEMALE',
        berthPreference: 'NO_PREFERENCE',
      },
    ]);
  };

  const removePassenger = (index: number) => {
    if (passengers.length <= 1) return;
    setPassengers(passengers.filter((_, idx) => idx !== index));
  };

  const updatePassenger = (index: number, field: keyof PassengerInput, value: any) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  // Distance-Based Fare Estimation Formula:
  // Base Fare = Route Distance (km) × Class Rate per km
  // Subtotal = Base Fare + Configured Charges (Reservation Fee + Superfast Surcharge)
  // Total Fare = (Subtotal + GST) × Passenger Count
  const distanceKm = train.distanceKm || 359;
  const ratePerKm = classRule.perKmRate || 0.48;
  const baseRate = Math.round(distanceKm * ratePerKm);
  const reservationFee = classRule.reservationFee;
  const superfastCharge = train.trainType === 'SUPERFAST' || train.trainType === 'VANDE_BHARAT' || train.trainType === 'RAJDHANI'
    ? classRule.superfastSurcharge
    : 0;
  const configuredCharges = reservationFee + superfastCharge;
  const subtotalPerPax = baseRate + configuredCharges;
  const gstPerPax = Math.round(subtotalPerPax * (classRule.gstRate || 0));
  const farePerPax = subtotalPerPax + gstPerPax;
  const grandTotal = farePerPax * passengers.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn || !user) {
      setError('Please sign in or register to complete ticket reservation.');
      return;
    }

    // Form validation
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name.trim()) {
        setError(`Please enter passenger #${i + 1}'s full name.`);
        return;
      }
      if (p.age < 1 || p.age > 120) {
        setError(`Please enter a valid age for passenger #${i + 1} (1-120).`);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const booking = await api.createBooking(
        {
          trainNumber: train.trainNumber,
          travelDate,
          classCode,
          fromCode,
          toCode,
          passengers,
        },
        user
      );
      onSuccess(booking);
    } catch (err: any) {
      setError(err.message || 'Booking submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold">Passenger Reservation Slip</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {train.trainName} (#{train.trainNumber}) · {classRule.className} ({classCode})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Journey Summary Strip */}
        <div className="px-5 py-3 bg-amber-50/70 border-b border-amber-200 text-xs flex flex-wrap items-center justify-between gap-3 text-amber-950">
          <div>
            Route: <strong>{train.sourceName}</strong> ({train.sourceCode}) → <strong>{train.destinationName}</strong> ({train.destinationCode})
          </div>
          <div>
            Date: <strong>{travelDate}</strong> · Dep: <strong>{train.departureTime}</strong> ({distanceKm} km)
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {!isLoggedIn && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-4">
              <div>
                <p className="font-bold">You are currently browsing as a Guest.</p>
                <p className="text-amber-800 mt-0.5">Please sign in or register with your email to book tickets.</p>
              </div>
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            </div>
          )}

          {/* Passenger Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Passenger Details & Berth Preferences (Max 4)
              </h4>
              {passengers.length < 4 && (
                <button
                  type="button"
                  onClick={addPassenger}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Passenger</span>
                </button>
              )}
            </div>

            {passengers.map((pax, index) => (
              <div key={index} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Passenger #{index + 1}
                  </span>
                  {passengers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePassenger(index)}
                      className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-5 space-y-1">
                    <label className="text-[11px] font-medium text-slate-600">Full Name</label>
                    <input
                      type="text"
                      value={pax.name}
                      onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                      placeholder="As per Government ID"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-medium text-slate-600">Age</label>
                    <input
                      type="number"
                      value={pax.age}
                      min={1}
                      max={120}
                      onChange={(e) => updatePassenger(index, 'age', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-amber-500 font-mono"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-medium text-slate-600">Gender</label>
                    <select
                      value={pax.gender}
                      onChange={(e) => updatePassenger(index, 'gender', e.target.value)}
                      className="w-full px-2 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="TRANSGENDER">Other</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[11px] font-medium text-slate-600">Berth Preference</label>
                    <select
                      value={pax.berthPreference}
                      onChange={(e) => updatePassenger(index, 'berthPreference', e.target.value)}
                      className="w-full px-2 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="NO_PREFERENCE">No Preference</option>
                      <option value="LOWER">Lower Berth (LB)</option>
                      <option value="MIDDLE">Middle Berth (MB)</option>
                      <option value="UPPER">Upper Berth (UB)</option>
                      <option value="SIDE_LOWER">Side Lower (SL)</option>
                      <option value="SIDE_UPPER">Side Upper (SU)</option>
                      <option value="WINDOW">Window Seat (WS)</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Distance-Based Transparent Fare Calculator */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              <span className="flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-amber-600" />
                <span>Distance-Based Fare Breakdown (Per Passenger)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {distanceKm} km @ ₹{ratePerKm}/km
              </span>
            </div>

            <div className="space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Base Distance Fare ({distanceKm} km × ₹{ratePerKm}/km):</span>
                <span className="font-mono text-slate-900">₹{baseRate}</span>
              </div>
              <div className="flex justify-between">
                <span>Reservation Fee:</span>
                <span className="font-mono text-slate-900">₹{reservationFee}</span>
              </div>
              {superfastCharge > 0 && (
                <div className="flex justify-between">
                  <span>Superfast Surcharge:</span>
                  <span className="font-mono text-slate-900">₹{superfastCharge}</span>
                </div>
              )}
              {gstPerPax > 0 && (
                <div className="flex justify-between">
                  <span>GST (5% AC Service Tax):</span>
                  <span className="font-mono text-slate-900">₹{gstPerPax}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                <span>Total Amount ({passengers.length} Passenger{passengers.length > 1 ? 's' : ''}):</span>
                <span className="font-mono text-amber-900 text-base">₹{grandTotal}</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-start gap-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Seats are reserved atomically and tied to your authenticated passenger account. Original government photo ID is required during travel.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Reserving Seats...</span>
                </>
              ) : (
                <span>Confirm &amp; Pay ₹{grandTotal}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
