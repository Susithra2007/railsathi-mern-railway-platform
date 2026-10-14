import { Booking } from '../types';

export function generateTicketHtml(booking: Booking): string {
  const passengerRows = booking.passengers
    .map(
      (p, idx) => `
      <tr style="border-bottom: 1px solid #cbd5e1;">
        <td style="padding: 10px; font-family: monospace; font-size: 13px;">${idx + 1}</td>
        <td style="padding: 10px; font-weight: 700; color: #0f172a; font-size: 13px;">${escapeHtml(p.name)}</td>
        <td style="padding: 10px; font-size: 13px;">${p.age} / ${p.gender ? p.gender.charAt(0) : 'M'}</td>
        <td style="padding: 10px; font-weight: 700; color: #047857; font-size: 13px;">${p.status}</td>
        <td style="padding: 10px; font-family: monospace; font-weight: 800; font-size: 14px; color: #0f172a;">${p.coach}</td>
        <td style="padding: 10px; font-family: monospace; font-weight: 800; font-size: 14px; color: #b45309;">${p.berthNumber}</td>
        <td style="padding: 10px; font-size: 13px; color: #475569;">${p.berthType}</td>
      </tr>`
    )
    .join('');

  const paxCount = booking.passengers.length || 1;
  const baseFareTotal = (booking.fareBreakdown?.baseFare || 0) * paxCount;
  const chargesTotal =
    ((booking.fareBreakdown?.reservationCharge || 0) +
      (booking.fareBreakdown?.superfastCharge || 0)) *
    paxCount;
  const gstTotal = (booking.fareBreakdown?.gstAmount || 0) * paxCount;
  const grandTotal = booking.fareBreakdown?.grandTotal || baseFareTotal + chargesTotal + gstTotal;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Electronic Reservation Slip (ERS) - PNR ${booking.pnr}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background-color: #f1f5f9;
      padding: 24px;
    }
    .ticket-page {
      max-width: 860px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .no-print-toolbar {
      background: #0f172a;
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #ffffff;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 18px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      border: none;
      text-decoration: none;
      transition: background-color 0.15s;
    }
    .btn-print {
      background: #f59e0b;
      color: #0f172a;
    }
    .btn-print:hover {
      background: #d97706;
    }
    .ticket-content {
      padding: 32px;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 18px;
      margin-bottom: 24px;
    }
    .logo-badge {
      display: inline-block;
      background: #0f172a;
      color: #f59e0b;
      font-weight: 900;
      font-size: 22px;
      padding: 6px 14px;
      border-radius: 8px;
      letter-spacing: 1px;
    }
    .title-area {
      margin-left: 14px;
    }
    .title-area h1 {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .title-area p {
      font-size: 12px;
      color: #475569;
      margin-top: 2px;
    }
    .pnr-box {
      background: #fef3c7;
      border: 2px dashed #d97706;
      border-radius: 8px;
      padding: 8px 18px;
      text-align: right;
    }
    .pnr-label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 800;
      color: #92400e;
      letter-spacing: 0.5px;
    }
    .pnr-val {
      font-family: monospace;
      font-size: 20px;
      font-weight: 900;
      color: #78350f;
    }
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .grid-label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      display: block;
      margin-bottom: 4px;
    }
    .grid-val {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      display: block;
    }
    .grid-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
      display: block;
      font-family: monospace;
    }
    .table-container {
      margin-bottom: 24px;
    }
    .table-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0f172a;
      margin-bottom: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
    }
    thead th {
      background: #f1f5f9;
      padding: 10px;
      font-size: 11px;
      text-align: left;
      font-weight: 700;
      color: #334155;
      text-transform: uppercase;
      border-bottom: 2px solid #cbd5e1;
    }
    .fare-and-qr {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }
    .fare-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
    }
    .fare-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      padding: 4px 0;
      color: #475569;
    }
    .fare-row.total {
      border-top: 2px solid #0f172a;
      padding-top: 8px;
      margin-top: 8px;
      font-weight: 800;
      font-size: 15px;
      color: #0f172a;
    }
    .qr-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .instructions {
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      font-size: 11px;
      color: #64748b;
      line-height: 1.6;
    }
    .instructions strong {
      color: #1e293b;
    }
    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .no-print-toolbar {
        display: none !important;
      }
      .ticket-page {
        border: none !important;
        box-shadow: none !important;
        max-width: 100% !important;
        width: 100% !important;
      }
      .ticket-content {
        padding: 12px !important;
      }
    }
  </style>
</head>
<body>
  <div class="ticket-page">
    <div class="no-print-toolbar">
      <div style="font-size: 13px; font-weight: 700;">Official Electronic Reservation Slip (ERS)</div>
      <div>
        <button class="btn btn-print" onclick="window.print()">
          🖨️ Print Ticket / Save as PDF
        </button>
      </div>
    </div>

    <div class="ticket-content">
      <div class="header-bar">
        <div style="display: flex; align-items: center;">
          <div class="logo-badge">IR</div>
          <div class="title-area">
            <h1>INDIAN RAILWAYS PASSENGER DIGITAL PLATFORM</h1>
            <p>Electronic Reservation Slip (ERS) · Confirmed Journey Record</p>
          </div>
        </div>
        <div class="pnr-box">
          <div class="pnr-label">PNR Number</div>
          <div class="pnr-val">${booking.pnr}</div>
        </div>
      </div>

      <div class="grid-4">
        <div>
          <span class="grid-label">Train Name & No.</span>
          <span class="grid-val">${escapeHtml(booking.trainName)} (#${escapeHtml(booking.trainNumber)})</span>
          <span class="grid-sub">${escapeHtml(booking.trainType || 'Express')}</span>
        </div>
        <div>
          <span class="grid-label">Journey Date</span>
          <span class="grid-val">${escapeHtml(booking.travelDate)}</span>
          <span class="grid-sub">Dep: ${escapeHtml(booking.departureTime)}</span>
        </div>
        <div>
          <span class="grid-label">From Station</span>
          <span class="grid-val">${escapeHtml(booking.sourceName)}</span>
          <span class="grid-sub">${escapeHtml(booking.sourceCode)} · Platform ${booking.departurePlatform || 1}</span>
        </div>
        <div>
          <span class="grid-label">To Station</span>
          <span class="grid-val">${escapeHtml(booking.destinationName)}</span>
          <span class="grid-sub">${escapeHtml(booking.destinationCode)} · Arr: ${escapeHtml(booking.arrivalTime)}</span>
        </div>
      </div>

      <div class="table-container">
        <div class="table-title">Passenger &amp; Seat Allocation Details</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Passenger Name</th>
              <th>Age / Sex</th>
              <th>Status</th>
              <th>Coach</th>
              <th>Berth / Seat</th>
              <th>Berth Type</th>
            </tr>
          </thead>
          <tbody>
            ${passengerRows}
          </tbody>
        </table>
      </div>

      <div class="fare-and-qr">
        <div class="fare-box">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin-bottom: 8px;">
            Fare Calculation Breakdown
          </div>
          <div class="fare-row">
            <span>Class:</span>
            <strong style="color: #0f172a;">${escapeHtml(booking.className)} (${escapeHtml(booking.classCode)})</strong>
          </div>
          <div class="fare-row">
            <span>Distance:</span>
            <span>${booking.fareBreakdown?.distanceKm || 0} km</span>
          </div>
          <div class="fare-row">
            <span>Base Fare (${paxCount} Pax):</span>
            <span>₹${baseFareTotal}</span>
          </div>
          <div class="fare-row">
            <span>Reservation &amp; Superfast Charges:</span>
            <span>₹${chargesTotal}</span>
          </div>
          <div class="fare-row">
            <span>Applicable GST (5%):</span>
            <span>₹${gstTotal}</span>
          </div>
          <div class="fare-row total">
            <span>Total Amount Paid:</span>
            <span style="font-family: monospace; color: #78350f;">₹${grandTotal}</span>
          </div>
        </div>

        <div class="qr-box">
          <svg width="86" height="86" viewBox="0 0 100 100">
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
          <div style="font-size: 10px; font-weight: 700; color: #475569; margin-top: 6px;">TTE DIGITAL QR VERIFICATION</div>
          <div style="font-size: 9px; font-family: monospace; color: #94a3b8; margin-top: 2px;">PNR: ${booking.pnr}</div>
        </div>
      </div>

      <div class="instructions">
        <p><strong>Important Passenger Instructions:</strong></p>
        <p>1. At least one passenger must carry an Original Valid Government Photo ID (Aadhaar, Voter ID, Passport, PAN Card, Driving License).</p>
        <p>2. Please report at Platform ${booking.departurePlatform || 1} at least 20 minutes prior to scheduled departure (${booking.departureTime}).</p>
        <p>3. This Electronic Reservation Slip is an official digital travel authorization. For 24x7 Railway Assistance, dial Rail Madad helpline 139.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function downloadTicketHtml(booking: Booking): void {
  const htmlContent = generateTicketHtml(booking);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `RailSathi_Ticket_${booking.pnr.replace(/\D/g, '') || booking.pnr}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadTicketText(booking: Booking): void {
  const separator = '========================================================================\n';
  const subSeparator = '------------------------------------------------------------------------\n';
  
  let content = '';
  content += separator;
  content += '           INDIAN RAILWAYS PASSENGER DIGITAL PLATFORM (RailSathi)        \n';
  content += '                   ELECTRONIC RESERVATION SLIP (ERS)                    \n';
  content += separator;
  content += `PNR NUMBER         : ${booking.pnr}\n`;
  content += `TRAIN NUMBER & NAME: ${booking.trainNumber} - ${booking.trainName} (${booking.trainType})\n`;
  content += `DATE OF JOURNEY    : ${booking.travelDate} | DEPARTURE TIME: ${booking.departureTime}\n`;
  content += `FROM STATION       : ${booking.sourceName} (${booking.sourceCode}) - PLATFORM ${booking.departurePlatform || 1}\n`;
  content += `TO STATION         : ${booking.destinationName} (${booking.destinationCode}) - ARRIVAL: ${booking.arrivalTime}\n`;
  content += `TRAVEL CLASS       : ${booking.className} (${booking.classCode})\n`;
  content += `BOOKING STATUS     : ${booking.status}\n`;
  content += `BOOKED BY          : ${booking.userName} (${booking.userEmail})\n`;
  content += subSeparator;
  content += 'PASSENGER ALLOCATION DETAILS:\n';
  content += 'S.No.  Passenger Name                 Age/Sex  Status   Coach  Berth/Seat  Type\n';
  content += subSeparator;

  booking.passengers.forEach((p, idx) => {
    const sNo = (idx + 1).toString().padEnd(6);
    const name = p.name.padEnd(30).slice(0, 30);
    const ageSex = `${p.age}/${p.gender ? p.gender.charAt(0) : 'M'}`.padEnd(9);
    const status = p.status.padEnd(9);
    const coach = p.coach.padEnd(7);
    const berth = p.berthNumber.toString().padEnd(12);
    const type = p.berthType;
    content += `${sNo} ${name} ${ageSex} ${status} ${coach} ${berth} ${type}\n`;
  });

  content += subSeparator;
  content += 'FARE DETAILS:\n';
  content += `Distance           : ${booking.fareBreakdown?.distanceKm || 0} KM\n`;
  content += `Total Passengers   : ${booking.passengers.length}\n`;
  content += `Total Amount Paid  : INR ${booking.fareBreakdown?.grandTotal || 0}/-\n`;
  content += subSeparator;
  content += 'IMPORTANT NOTES:\n';
  content += '1. Carry original valid government photo ID card during journey.\n';
  content += '2. Report at station platform 20 minutes before scheduled departure.\n';
  content += '3. Rail Madad Helpline: Dial 139.\n';
  content += separator;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `RailSathi_Ticket_${booking.pnr.replace(/\D/g, '') || booking.pnr}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function copyTicketSummary(booking: Booking): Promise<boolean> {
  const paxList = booking.passengers
    .map((p, i) => `${i + 1}. ${p.name} (Coach ${p.coach}, Berth ${p.berthNumber} ${p.berthType})`)
    .join('\n');

  const text = `🚆 RailSathi E-Ticket Slip
PNR: ${booking.pnr}
Train: ${booking.trainName} (#${booking.trainNumber})
Date: ${booking.travelDate} | Dep: ${booking.departureTime} (PF ${booking.departurePlatform || 1})
Route: ${booking.sourceName} (${booking.sourceCode}) ➔ ${booking.destinationName} (${booking.destinationCode})
Class: ${booking.className} (${booking.classCode})
Status: ${booking.status}

Passengers:
${paxList}

Total Fare: ₹${booking.fareBreakdown?.grandTotal || 0}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  } else {
    // Fallback using textarea
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return Promise.resolve(success);
    } catch {
      return Promise.resolve(false);
    }
  }
}

export function printTicketDirectly(booking: Booking): { success: boolean; method: string } {
  const htmlContent = generateTicketHtml(booking);

  // Method A: Hidden iframe print
  try {
    const existingFrame = document.getElementById('ticket-print-frame');
    if (existingFrame) {
      existingFrame.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'ticket-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (err) {
          console.warn('Iframe print blocked, attempting direct window.print:', err);
          window.print();
        }
      }, 400);

      return { success: true, method: 'iframe' };
    }
  } catch (err) {
    console.warn('Iframe setup error, attempting window.print:', err);
  }

  // Method B: window.print()
  try {
    window.print();
    return { success: true, method: 'window' };
  } catch (err) {
    console.error('All direct print attempts blocked by browser sandbox:', err);
    // Auto-trigger HTML download so passenger gets ticket immediately
    downloadTicketHtml(booking);
    return { success: false, method: 'download_fallback' };
  }
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
