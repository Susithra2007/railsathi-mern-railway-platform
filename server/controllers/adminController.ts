import { Request, Response } from 'express';
import { db } from '../db';
import { Train } from '../types';

export const getAllBookings = (req: Request, res: Response) => {
  try {
    const userRole = (req.headers['x-user-role'] as string) || req.query.role;
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied: Administrator privileges required.' });
    }

    const bookings = db.getBookings();
    return res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLiveStatus = (req: Request, res: Response) => {
  try {
    const userRole = (req.headers['x-user-role'] as string) || req.body.role;
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied: Administrator privileges required.' });
    }

    const { trainNumber } = req.params;
    const { status, delayMinutes, currentStation, nextStation, currentPlatform, notes } = req.body;

    const updated = db.updateLiveStatus(trainNumber, {
      status,
      delayMinutes: Number(delayMinutes || 0),
      currentStation,
      nextStation,
      currentPlatform: Number(currentPlatform || 1),
      notes,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: `Train ${trainNumber} not found.` });
    }

    return res.json({
      success: true,
      message: `Live status broadcasted for train ${trainNumber}`,
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addTrain = (req: Request, res: Response) => {
  try {
    const userRole = (req.headers['x-user-role'] as string) || req.body.role;
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied: Administrator privileges required.' });
    }

    const trainData: Train = req.body;
    if (!trainData.trainNumber || !trainData.trainName || !trainData.sourceCode || !trainData.destinationCode) {
      return res.status(400).json({ success: false, message: 'Missing required train fields.' });
    }

    const created = db.addTrain({
      ...trainData,
      id: `tr_${trainData.trainNumber}`,
    });

    return res.status(201).json({
      success: true,
      message: 'New train added to railway network.',
      data: created,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSystemStats = (req: Request, res: Response) => {
  try {
    const bookings = db.getBookings();
    const trains = db.getTrains();
    const stations = db.getStations();

    const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED');
    const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED');
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.fareBreakdown.grandTotal, 0);
    const totalPassengers = confirmedBookings.reduce((sum, b) => sum + b.passengers.length, 0);

    return res.json({
      success: true,
      data: {
        totalTrains: trains.length,
        totalStations: stations.length,
        totalBookings: bookings.length,
        confirmedCount: confirmedBookings.length,
        cancelledCount: cancelledBookings.length,
        totalPassengers,
        totalRevenue,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getNotifications = (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
    const notifications = db.getNotifications(userId);
    return res.json({ success: true, count: notifications.length, data: notifications });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationAsRead = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
      db.markAllNotificationsRead(userId);
    } else {
      db.markNotificationAsRead(id);
    }
    return res.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
