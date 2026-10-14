import { Request, Response } from 'express';
import { db } from '../db';
import { SeatClassCode } from '../types';

export const createBooking = (req: Request, res: Response) => {
  try {
    const { userId, userEmail, userName, trainNumber, travelDate, classCode, passengers } = req.body;

    if (!trainNumber || !travelDate || !classCode || !passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking fields (trainNumber, travelDate, classCode, passengers array).',
      });
    }

    const booking = db.createBooking({
      userId: userId || 'usr_passenger_1',
      userEmail: userEmail || 'passenger@rail.in',
      userName: userName || 'Passenger',
      trainNumber: String(trainNumber),
      travelDate: String(travelDate),
      classCode: classCode as SeatClassCode,
      passengers,
    });

    return res.status(201).json({
      success: true,
      message: 'Ticket booked successfully. Unique PNR generated.',
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
      return res.status(404).json({ success: false, message: `PNR #${pnr} not found in database.` });
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
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_passenger_1';
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
    const userId = (req.headers['x-user-id'] as string) || (req.body.userId as string) || 'usr_passenger_1';
    const userRole = (req.headers['x-user-role'] as string) || 'PASSENGER';

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
