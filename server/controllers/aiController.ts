import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { db } from '../db';

export const askAiAssistant = async (req: Request, res: Response) => {
  try {
    const { prompt, pnr, context } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt query is required.' });
    }

    // Retrieve relevant context from DB if PNR is provided
    let pnrContext = '';
    if (pnr) {
      const booking = db.getBookingByPnr(pnr);
      if (booking) {
        const train = db.getTrainByNumber(booking.trainNumber);
        pnrContext = `
Passenger Booking Record (Ground Truth):
- PNR: ${booking.pnr}
- Train: ${booking.trainNumber} - ${booking.trainName} (${booking.trainType})
- Travel Date: ${booking.travelDate}
- From: ${booking.sourceName} (${booking.sourceCode}) Departure: ${booking.departureTime} (Platform: ${booking.departurePlatform})
- To: ${booking.destinationName} (${booking.destinationCode}) Arrival: ${booking.arrivalTime}
- Class: ${booking.className} (${booking.classCode})
- Booking Status: ${booking.status}
- Passenger Count: ${booking.passengers.length}
- Assigned Coach/Berths: ${booking.passengers.map((p) => `${p.name} -> Coach ${p.coach}, Berth ${p.berthNumber} (${p.berthType})`).join('; ')}
- Total Fare: ₹${booking.fareBreakdown.grandTotal} (Base: ₹${booking.fareBreakdown.baseFare}, Res: ₹${booking.fareBreakdown.reservationCharge}, GST: ₹${booking.fareBreakdown.gstAmount})
- Current Train Live Status: ${train?.liveStatus?.status || 'ON_TIME'} (Delay: ${train?.liveStatus?.delayMinutes || 0} mins)
`;
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemInstruction = `You are RailSathi AI, an official Indian Railways passenger companion assistant.
Your answers must be concise, polite, accurate, and completely grounded in Indian Railways rules and the following verified database data:
${pnrContext}
${context ? `Additional Application Context: ${context}` : ''}

Key Railway Knowledge:
- IRCTC Cancellation Rules: >48 hrs before departure: flat clerkage (1A: ₹240, 2A: ₹200, 3A/CC: ₹180, SL: ₹120, 2S: ₹60). 12-48 hrs: 25% deducted. 4-12 hrs: 50% deducted. <4 hrs: No refund after chart preparation.
- Tatkal Booking opens at 10:00 AM for AC classes and 11:00 AM for Non-AC classes one day prior to journey date.
- Luggage allowance: 1A (70kg), 2A (50kg), 3A/CC (40kg), Sleeper (40kg).
- ID proof mandatory for all passengers during journey.

Keep answers under 3-4 bullet points or 2 short paragraphs. Never make up fake PNR numbers or fake booking details.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.2,
          },
        });

        const replyText = response.text || 'I am ready to help you with your journey details.';
        return res.json({
          success: true,
          source: 'GEMINI_AI',
          reply: replyText,
        });
      } catch (genAiError: any) {
        console.warn('Gemini API call failed, falling back to deterministic response:', genAiError?.message);
      }
    }

    // Built-in Deterministic Knowledge Fallback (works offline or without API key)
    const lowerPrompt = prompt.toLowerCase();
    let reply = '';

    if (pnrContext && (lowerPrompt.includes('status') || lowerPrompt.includes('pnr') || lowerPrompt.includes('ticket') || lowerPrompt.includes('coach') || lowerPrompt.includes('berth'))) {
      reply = `Here is your verified booking breakdown for PNR ${pnr}:\n${pnrContext.trim()}`;
    } else if (lowerPrompt.includes('cancel') || lowerPrompt.includes('refund')) {
      reply = `IRCTC Refund Policy Breakdown:
• More than 48 hours before departure: Flat clerkage deduction (₹240 for 1A, ₹200 for 2A, ₹180 for 3A/CC, ₹120 for SL, ₹60 for 2S).
• Between 12 to 48 hours: 25% of total ticket fare deducted.
• Between 4 to 12 hours: 50% of total ticket fare deducted.
• Less than 4 hours: No refund once chart is finalized.
All refunds in RailSathi are automatically credited to your original payment method.`;
    } else if (lowerPrompt.includes('tatkal')) {
      reply = `Tatkal Booking Guidelines:
• AC Classes (1A, 2A, 3A, CC): Booking opens at 10:00 AM IST one day before journey date.
• Non-AC Classes (SL, 2S): Booking opens at 11:00 AM IST one day before journey date.
• A maximum of 4 passengers can be booked per Tatkal PNR. Premium Tatkal features dynamic fare increments.`;
    } else if (lowerPrompt.includes('luggage') || lowerPrompt.includes('baggage')) {
      reply = `Free Luggage Allowance per Passenger:
• AC First Class (1A): 70 kg free allowance (maximum 150 kg with marginal fee).
• AC 2-Tier (2A): 50 kg free allowance.
• AC 3-Tier & Chair Car: 40 kg free allowance.
• Sleeper Class: 40 kg free allowance.
Bulky articles exceeding 100 cm x 60 cm x 25 cm must be booked in the brake van.`;
    } else if (lowerPrompt.includes('meal') || lowerPrompt.includes('food') || lowerPrompt.includes('pantry')) {
      reply = `Catering & Meal Service:
• Premium trains like Vande Bharat, Rajdhani, and Shatabdi include onboard meal service (breakfast, tea, lunch/dinner) if opted during booking.
• Superfast trains feature dedicated pantry cars and e-catering at major junction halts like Vijayawada (BZA), Nagpur (NGP), and Katpadi (KPD).`;
    } else {
      reply = `RailSathi Smart Companion Help:
• Search Trains: Enter source and destination to view live seat availability, classes (1A, 2A, 3A, SL, CC), and fares.
• PNR Status: Enter any 10-digit PNR to track coach allocation, berth number, and live delay status.
• Smart Alternatives: When trains are full, check the "Alternative Journey Explorer" for connecting routes through major junction hubs.
• Departure Checklist: Use our pre-journey packing checklist on your dashboard before boarding.`;
    }

    return res.json({
      success: true,
      source: 'LOCAL_KNOWLEDGE_ENGINE',
      reply,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'AI service error' });
  }
};
