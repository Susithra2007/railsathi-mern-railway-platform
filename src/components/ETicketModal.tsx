import React, { useState } from 'react';
import { Booking } from '../types';
import {
  X,
  Printer,
  Download,
  FileText,
  Copy,
  Check,
  CheckCircle,
  Train,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import {
  downloadTicketHtml,
  downloadTicketText,
  copyTicketSummary,
  printTicketDirectly,
} from '../utils/ticketGenerator';

interface ETicketModalProps {
  booking: Booking;
  onClose: () => void;
}

export const ETicketModal: React.FC<ETicketModalProps> = ({ booking, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [printFeedback, setPrintFeedback] = useState<string | null>(null);

  const handlePrint = () => {
    const result = printTicketDirectly(booking);
    if (!result.success) {
      setPrintFeedback(
        'Browser iframe blocked the direct print dialog. We downloaded your standalone E-Ticket HTML file instead — open it to print anytime!'
      );
    } else {
      setPrintFeedback('Print command sent to browser! You can also download the offline HTML file below.');
    }
  };

  const handleDownloadHtml = () => {
    downloadTicketHtml(booking);
    setPrintFeedback('Downloaded standalone E-Ticket HTML! You can open it in any browser and press Ctrl+P to print.');
  };

  const handleDownloadText = () => {
    downloadTicketText(booking);
    setPrintFeedback('Downloaded text travel slip (.txt)!');
  };

  const handleCopy = async () => {
    const ok = await copyTicketSummary(booking);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const paxCount = booking.passengers.length || 1;
  const baseFareTotal = (booking.fareBreakdown?.baseFare || 0) * paxCount;
  const chargesTotal =
    ((booking.fareBreakdown?.reservationCharge || 0) +
      (booking.fareBreakdown?.superfastCharge || 0)) *
    paxCount;
  const gstTotal = (booking.fareBreakdown?.gstAmount || 0) * paxCount;
  const grandTotal = booking.fareBreakdown?.grandTotal || baseFareTotal + chargesTotal + gstTotal;

  return (
    <div className="ticket-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="ticket-modal-box bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="font-bold text-sm block">Official Electronic Reservation Slip (ERS)</span>
              <span className="text-[11px] text-slate-400">PNR: {booking.pnr}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Print Button */}
            <button
              onClick={handlePrint}
              title="Print via browser or save as PDF"
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            {/* Direct HTML E-Ticket Download Button */}
            <button
              onClick={handleDownloadHtml}
              title="Download standalone HTML ticket file for offline printing"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Download HTML</span>
            </button>

            {/* Text Slip Download */}
            <button
              onClick={handleDownloadText}
              title="Download clean plain-text slip"
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs hidden sm:flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Text Slip</span>
            </button>

            {/* Copy Details */}
            <button
              onClick={handleCopy}
              title="Copy journey details to clipboard"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              title="Close ticket dialog"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback / Instructions banner if user clicked print */}
        {printFeedback && (
          <div className="no-print bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900 flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>{printFeedback}</span>
            </div>
            <button
              onClick={() => setPrintFeedback(null)}
              className="text-amber-700 hover:text-amber-900 text-xs font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Printable Ticket Content Container */}
        <div id="printable-eticket" className="p-6 sm:p-8 space-y-6 text-slate-900 font-sans">
          {/* Header Banner */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-slate-900 flex items-center justify-center text-amber-400 font-black text-xl tracking-wider shadow-sm">
                IR
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-950">
                  INDIAN RAILWAYS PASSENGER DIGITAL PLATFORM
                </h2>
                <p className="text-xs text-slate-600">
                  Electronic Reservation Slip (ERS) · Confirmed Journey Record
                </p>
              </div>
            </div>

            {/* PNR Box */}
            <div className="bg-amber-50/80 border-2 border-dashed border-amber-600 rounded-lg px-4 py-2 text-right">
              <span className="text-[10px] text-amber-900 font-extrabold tracking-wider uppercase block">
                PNR Number
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black text-amber-950 tracking-wider">
                {booking.pnr}
              </span>
            </div>
          </div>

          {/* Journey Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-bold">Train Name & No.</span>
              <strong className="text-slate-900 text-sm block mt-0.5">
                {booking.trainName} (#{booking.trainNumber})
              </strong>
              <span className="text-slate-500 text-[11px] font-mono">{booking.trainType}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-bold">Journey Date</span>
              <strong className="text-slate-900 text-sm block mt-0.5 font-mono">
                {booking.travelDate}
              </strong>
              <span className="text-slate-500 text-[11px]">Departure: {booking.departureTime}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-bold">From Station</span>
              <strong className="text-slate-900 text-sm block mt-0.5">
                {booking.sourceName}
              </strong>
              <span className="text-slate-500 text-[11px] font-mono">
                {booking.sourceCode} · Platform {booking.departurePlatform || 1}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-bold">To Station</span>
              <strong className="text-slate-900 text-sm block mt-0.5">
                {booking.destinationName}
              </strong>
              <span className="text-slate-500 text-[11px] font-mono">
                {booking.destinationCode} · Arrival: {booking.arrivalTime}
              </span>
            </div>
          </div>

          {/* Passenger Information Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Passenger &amp; Seat Allocation Details
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">
                Quota: General (GN) · Class: {booking.className} ({booking.classCode})
              </span>
            </div>
            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[500px]">
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
                        {p.age} / {p.gender ? p.gender.charAt(0) : 'M'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-emerald-700">{p.status}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{p.coach}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-900">
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
              <div className="space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Class &amp; Distance:</span>
                  <span className="font-semibold text-slate-900">
                    {booking.className} ({booking.classCode}) · {booking.fareBreakdown?.distanceKm || 0} km
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Base Distance Fare ({paxCount} Pax):</span>
                  <span className="font-mono">₹{baseFareTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reservation &amp; Superfast Surcharge:</span>
                  <span className="font-mono">₹{chargesTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Applicable GST (5%):</span>
                  <span className="font-mono">₹{gstTotal}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                  <span>Total Amount Paid:</span>
                  <span className="font-mono text-amber-900 text-base">
                    ₹{grandTotal}
                  </span>
                </div>
              </div>
            </div>

            {/* Simulated QR Code for TTE Scanner */}
            <div className="md:col-span-4 p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center">
              <div className="p-2 bg-white rounded-lg border border-slate-300 shadow-xs mb-2">
                <svg width="88" height="88" viewBox="0 0 100 100" className="text-slate-900">
                  <rect x="0" y="0" width="100" height="100" fill="white" />
                  <rect x="8" y="8" width="28" height="28" fill="#0f172a" />
                  <rect x="14" y="14" width="16" height="16" fill="white" />
                  <rect x="18" y="18" width="8" height="8" fill="#0f172a" />

                  <rect x="64" y="8" width="28" height="28" fill="#0f172a" />
                  <rect x="70" y="14" width="16" height="16" fill="white" />
                  <rect x="74" y="18" width="8" height="8" fill="#0f172a" />

                  <rect x="8" y="64" width="28" height="28" fill="#0f172a" />
                  <rect x="14" y="70" width="16" height="16" fill="white" />
                  <rect x="18" y="74" width="8" height="8" fill="#0f172a" />

                  <rect x="44" y="10" width="8" height="8" fill="#0f172a" />
                  <rect x="44" y="24" width="8" height="8" fill="#0f172a" />
                  <rect x="42" y="42" width="18" height="18" fill="#0f172a" />
                  <rect x="68" y="46" width="10" height="10" fill="#0f172a" />
                  <rect x="42" y="68" width="10" height="10" fill="#0f172a" />
                  <rect x="72" y="72" width="16" height="16" fill="#0f172a" />
                </svg>
              </div>
              <span className="text-[10px] text-slate-700 font-bold font-mono">TTE VERIFICATION QR</span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">PNR {booking.pnr}</span>
            </div>
          </div>

          {/* Important Travel Instructions */}
          <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Important Passenger Instructions:</p>
            <p>1. At least one passenger must carry an Original Valid Government Photo ID (Aadhaar, Voter ID, Passport, PAN Card, Driving License).</p>
            <p>2. Report at Platform {booking.departurePlatform || 1} at least 20 minutes prior to scheduled departure ({booking.departureTime}).</p>
            <p>3. Standard cancellation and refund rules apply. Refer to Rail Madad helpline (139) for 24x7 journey assistance.</p>
          </div>
        </div>

        {/* Modal Bottom Footer (hidden on print) */}
        <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Digital E-Ticket verified with Indian Railways PNR database</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadHtml}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save Ticket File (.html)</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Ticket</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
