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

export const getAllUsers = (req: Request, res: Response) => {
  try {
    const userRole = (req.headers['x-user-role'] as string) || req.query.role;
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied: Administrator privileges required.' });
    }

    const users = db.getUsers().map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      createdAt: u.createdAt,
    }));

    return res.json({ success: true, count: users.length, data: users });
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
    const { status, delayMinutes, currentStation, nextStation, currentPlatform, notes, journeyProgress } = req.body;

    const updated = db.updateLiveStatus(trainNumber, {
      status,
      delayMinutes: Number(delayMinutes || 0),
      currentStation,
      nextStation,
      currentPlatform: Number(currentPlatform || 1),
      journeyProgress: journeyProgress !== undefined ? Number(journeyProgress) : undefined,
      notes,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: `Train #${trainNumber} not found.` });
    }

    return res.json({
      success: true,
      message: `Live status broadcasted for train #${trainNumber}`,
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
      return res.status(400).json({ success: false, message: 'Missing required train fields (number, name, source, destination).' });
    }

    const created = db.addTrain({
      ...trainData,
      id: `tr_${trainData.trainNumber}`,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: `Train #${trainData.trainNumber} added to operational fleet.`,
      data: created,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleTrainStatus = (req: Request, res: Response) => {
  try {
    const userRole = (req.headers['x-user-role'] as string);
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied: Administrator privileges required.' });
    }

    const { trainNumber } = req.params;
    const isActive = db.toggleTrainActive(trainNumber);

    return res.json({
      success: true,
      message: `Train #${trainNumber} is now ${isActive ? 'Active' : 'Inactive'}`,
      isActive,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFareRules = (req: Request, res: Response) => {
  try {
    const userRole = (req.headers['x-user-role'] as string);
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied: Administrator privileges required.' });
    }

    const { trainNumber, classCode, perKmRate, reservationFee, superfastSurcharge } = req.body;
    const train = db.getTrainByNumber(trainNumber);
    if (!train) {
      return res.status(404).json({ success: false, message: `Train #${trainNumber} not found.` });
    }

    const classConfig = train.classes.find((c) => c.classCode === classCode);
    if (!classConfig) {
      return res.status(404).json({ success: false, message: `Class ${classCode} not found on train.` });
    }

    if (perKmRate !== undefined) classConfig.perKmRate = Number(perKmRate);
    if (reservationFee !== undefined) classConfig.reservationFee = Number(reservationFee);
    if (superfastSurcharge !== undefined) classConfig.superfastSurcharge = Number(superfastSurcharge);

    return res.json({
      success: true,
      message: `Fare rules updated for ${classConfig.className} on Train #${trainNumber}`,
      data: classConfig,
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
    const users = db.getUsers();

    const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED');
    const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED');
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.fareBreakdown.grandTotal, 0);
    const totalPassengers = confirmedBookings.reduce((sum, b) => sum + b.passengers.length, 0);

    return res.json({
      success: true,
      data: {
        totalTrains: trains.length,
        totalStations: stations.length,
        totalPassengersRegistered: users.length,
        totalBookings: bookings.length,
        confirmedCount: confirmedBookings.length,
        cancelledCount: cancelledBookings.length,
        totalPassengersTraveled: totalPassengers,
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
