import { Request, Response } from 'express';
import { db } from '../db';
import { SeatClassCode } from '../types';

export const createBooking = (req: Request, res: Response) => {
  try {
    const {
      userId,
      userEmail,
      userName,
      userPhone,
      trainNumber,
      travelDate,
      classCode,
      fromCode,
      toCode,
      passengers,
    } = req.body;

    if (!trainNumber || !travelDate || !classCode || !passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking fields (trainNumber, travelDate, classCode, passengers list).',
      });
    }

    if (!userId || !userEmail) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to book railway tickets.',
      });
    }

    const booking = db.createBooking({
      userId,
      userEmail,
      userName: userName || 'Passenger',
      userPhone: userPhone || '',
      trainNumber: String(trainNumber),
      travelDate: String(travelDate),
      classCode: classCode as SeatClassCode,
      fromCode,
      toCode,
      passengers,
    });

    return res.status(201).json({
      success: true,
      message: `Reservation confirmed! Unique PNR: ${booking.pnr}`,
      data: booking,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Booking failed' });
  }
};

export const getBookingByPnr = (req: Request, res: Response) => {
  try {
    const { pnr } = req.params;
    const booking = db.getBookingByPnr(pnr);

    if (!booking) {
      return res.status(404).json({ success: false, message: `No booking record found for PNR #${pnr}.` });
    }

    const train = db.getTrainByNumber(booking.trainNumber);

    return res.json({
      success: true,
      data: {
        ...booking,
        trainLiveStatus: train?.liveStatus,
        stops: train?.stops,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserBookings = (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
    if (!userId) {
      return res.json({ success: true, count: 0, data: [] });
    }

    // Security: Only return bookings belonging to this passenger
    const bookings = db.getUserBookings(userId);

    return res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelBooking = (req: Request, res: Response) => {
  try {
    const { pnr } = req.params;
    const userId = (req.headers['x-user-id'] as string) || (req.body.userId as string);
    const userRole = (req.headers['x-user-role'] as string) || 'PASSENGER';

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const result = db.cancelBooking(pnr, userId, userRole === 'ADMIN');

    return res.json({
      success: true,
      message: `Booking cancelled successfully. Refund of ₹${result.refundAmount} calculated according to railway cancellation rules.`,
      data: result.booking,
      refundAmount: result.refundAmount,
      cancellationFee: result.cancellationFee,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
