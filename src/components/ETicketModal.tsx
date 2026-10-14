import React from 'react';
import { Booking } from '../types';
import { X, Printer, CheckCircle, Shield, Train, QrCode } from 'lucide-react';

interface ETicketModalProps {
  booking: Booking;
  onClose: () => void;
}

export const ETicketModal: React.FC<ETicketModalProps> = ({ booking, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8 print:m-0 print:border-none print:shadow-none">
        {/* Modal Top Bar (hidden on print) */}
        <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Official Electronic Reservation Slip (ERS)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Body */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-900 font-sans">
          {/* Ticket Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-amber-400 font-black text-xl">
                IR
              </div>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-slate-950">
                  INDIAN RAILWAYS PASSENGER DIGITAL PLATFORM
                </h2>
                <p className="text-xs text-slate-600">
                  Electronic Reservation Slip (ERS) · Confirmed Journey Record
                </p>
              </div>
            </div>

            {/* PNR Box */}
            <div className="bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-right">
              <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase block">
                PNR Number
              </span>
              <span className="font-mono text-xl font-extrabold text-amber-900 tracking-wider">
                {booking.pnr}
              </span>
            </div>
          </div>

          {/* Journey Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Train Name & No.</span>
              <strong className="text-slate-900 text-sm block mt-0.5">
                {trainToDisplay(booking.trainNumber, booking.trainName)}
              </strong>
              <span className="text-slate-500 text-[11px] font-mono">{booking.trainType}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Journey Date</span>
              <strong className="text-slate-900 text-sm block mt-0.5 font-mono">
                {booking.travelDate}
              </strong>
              <span className="text-slate-500 text-[11px]">Dep: {booking.departureTime}</span>
            </div>
            <div>
              <span className="text-slate-500 block">From Station</span>
              <strong className="text-slate-900 text-sm block mt-0.5">
                {booking.sourceName}
              </strong>
              <span className="text-slate-500 text-[11px] font-mono">
                {booking.sourceCode} · Platform {booking.departurePlatform}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">To Station</span>
              <strong className="text-slate-900 text-sm block mt-0.5">
                {booking.destinationName}
              </strong>
              <span className="text-slate-500 text-[11px] font-mono">
                {booking.destinationCode} · Arr: {booking.arrivalTime}
              </span>
            </div>
          </div>

          {/* Passenger Information Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Passenger & Seat Allocation Details
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Passenger Name</th>
                    <th className="py-2.5 px-3">Age/Sex</th>
                    <th className="py-2.5 px-3">Booking Status</th>
                    <th className="py-2.5 px-3">Coach</th>
                    <th className="py-2.5 px-3">Berth / Seat</th>
                    <th className="py-2.5 px-3">Berth Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {booking.passengers.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{p.name}</td>
                      <td className="py-2.5 px-3">
                        {p.age} / {p.gender.charAt(0)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-emerald-700">{p.status}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{p.coach}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {p.berthNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{p.berthType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fare & QR Code Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
            <div className="md:col-span-8 p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Fare Calculation Breakdown
              </h4>
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Class:</span>
                  <span className="font-semibold text-slate-900">
                    {booking.className} ({booking.classCode})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Base Distance Fare:</span>
                  <span className="font-mono">₹{booking.fareBreakdown.baseFare * booking.passengers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reservation & Superfast Surcharge:</span>
                  <span className="font-mono">
                    ₹{(booking.fareBreakdown.reservationCharge + booking.fareBreakdown.superfastCharge) * booking.passengers.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Applicable GST (5%):</span>
                  <span className="font-mono">₹{booking.fareBreakdown.gstAmount * booking.passengers.length}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                  <span>Total Amount Paid:</span>
                  <span className="font-mono text-amber-900 text-base">
                    ₹{booking.fareBreakdown.grandTotal}
                  </span>
                </div>
              </div>
            </div>

            {/* Simulated QR Code for TTE Scanner */}
            <div className="md:col-span-4 p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center">
              <div className="p-2 bg-white rounded-lg border border-slate-300 shadow-xs mb-2">
                <svg width="90" height="90" viewBox="0 0 100 100" className="text-slate-900">
                  {/* Procedural QR Code Graphic Representation */}
                  <rect x="0" y="0" width="100" height="100" fill="white" />
                  <rect x="10" y="10" width="25" height="25" fill="black" />
                  <rect x="15" y="15" width="15" height="15" fill="white" />
                  <rect x="18" y="18" width="9" height="9" fill="black" />

                  <rect x="65" y="10" width="25" height="25" fill="black" />
                  <rect x="70" y="15" width="15" height="15" fill="white" />
                  <rect x="73" y="18" width="9" height="9" fill="black" />

                  <rect x="10" y="65" width="25" height="25" fill="black" />
                  <rect x="15" y="70" width="15" height="15" fill="white" />
                  <rect x="18" y="73" width="9" height="9" fill="black" />

                  {/* Random pattern blocks */}
                  <rect x="42" y="12" width="6" height="6" fill="black" />
                  <rect x="52" y="12" width="6" height="6" fill="black" />
                  <rect x="42" y="24" width="6" height="6" fill="black" />
                  <rect x="42" y="42" width="16" height="16" fill="black" />
                  <rect x="65" y="45" width="8" height="8" fill="black" />
                  <rect x="75" y="55" width="12" height="12" fill="black" />
                  <rect x="42" y="65" width="8" height="8" fill="black" />
                  <rect x="55" y="75" width="8" height="8" fill="black" />
                  <rect x="70" y="75" width="18" height="15" fill="black" />
                </svg>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">TTE VERIFICATION QR</span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">PNR {booking.pnr}</span>
            </div>
          </div>

          {/* Important Travel Instructions */}
          <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Important Passenger Instructions:</p>
            <p>1. At least one passenger must carry an Original Valid Government Photo ID (Aadhaar, Voter ID, Passport, PAN Card, Driving License).</p>
            <p>2. Report at Platform {booking.departurePlatform} at least 20 minutes prior to scheduled departure.</p>
            <p>3. Standard cancellation and refund rules apply. Refer to Rail Madad helpline (139) for journey assistance.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

function trainToDisplay(number: string, name: string) {
  return `${name} (${number})`;
}
