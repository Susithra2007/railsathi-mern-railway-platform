import { Request, Response } from 'express';
import { db } from '../db';
import { SeatClassCode } from '../types';

export const getStations = (req: Request, res: Response) => {
  try {
    const stations = db.getStations();
    return res.json({ success: true, count: stations.length, data: stations });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const searchTrains = (req: Request, res: Response) => {
  try {
    const { from, to, date, classCode } = req.query;

    if (!from || !to) {
      const allTrains = db.getTrains();
      return res.json({ success: true, count: allTrains.length, data: allTrains });
    }

    const fromCode = String(from).trim().toUpperCase();
    const toCode = String(to).trim().toUpperCase();

    if (fromCode === toCode) {
      return res.status(400).json({ success: false, message: 'Source and destination stations cannot be identical.' });
    }

    const trains = db.searchTrains(fromCode, toCode);
    const travelDate = String(date || new Date().toISOString().split('T')[0]);

    // Enhance each train with distance-based fare and real-time seat availability
    const enhancedTrains = trains.map((train) => {
      const routeDistance = db.calculateRouteDistance(train, fromCode, toCode);

      const classAvailabilities = train.classes.map((cls) => {
        const avail = db.getSeatAvailability(train.trainNumber, cls.classCode, travelDate);
        const fare = db.calculateFare(train, cls, 1, fromCode, toCode);
        return {
          classCode: cls.classCode,
          className: cls.className,
          status: avail?.status || 'AVAILABLE-24',
          availableSeats: avail?.availableSeats || 24,
          fare,
        };
      });

      const filteredByClass = classCode
        ? classAvailabilities.some((c) => c.classCode === classCode)
        : true;

      return {
        ...train,
        distanceKm: routeDistance,
        classAvailabilities,
        matchesClass: filteredByClass,
      };
    });

    return res.json({
      success: true,
      query: { from: fromCode, to: toCode, date: travelDate, classCode },
      count: enhancedTrains.length,
      data: enhancedTrains,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getTrainByNumber = (req: Request, res: Response) => {
  try {
    const { trainNumber } = req.params;
    const train = db.getTrainByNumber(trainNumber);
    if (!train) {
      return res.status(404).json({ success: false, message: `Train #${trainNumber} not found.` });
    }

    const date = String(req.query.date || new Date().toISOString().split('T')[0]);
    const classAvailabilities = train.classes.map((cls) => {
      const avail = db.getSeatAvailability(train.trainNumber, cls.classCode, date);
      const fare = db.calculateFare(train, cls, 1);
      return {
        classCode: cls.classCode,
        className: cls.className,
        status: avail?.status || 'AVAILABLE-24',
        availableSeats: avail?.availableSeats || 24,
        fare,
      };
    });

    return res.json({
      success: true,
      data: {
        ...train,
        classAvailabilities,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const checkAvailability = (req: Request, res: Response) => {
  try {
    const { trainNumber, classCode, date, from, to } = req.query;
    if (!trainNumber || !classCode) {
      return res.status(400).json({ success: false, message: 'trainNumber and classCode are required.' });
    }

    const travelDate = String(date || new Date().toISOString().split('T')[0]);
    const avail = db.getSeatAvailability(String(trainNumber), classCode as SeatClassCode, travelDate);

    if (!avail) {
      return res.status(404).json({ success: false, message: 'Class or train not found.' });
    }

    return res.json({ success: true, data: avail });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getLiveTrainTracking = (req: Request, res: Response) => {
  try {
    const { trainNumber } = req.params;
    const train = db.getTrainByNumber(trainNumber);
    if (!train) {
      return res.status(404).json({ success: false, message: `Train #${trainNumber} not found.` });
    }

    const liveStatus = db.getLiveTrainStatus(trainNumber);
    return res.json({
      success: true,
      data: {
        train,
        liveStatus,
        stops: train.stops,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const advanceSimulationStep = (req: Request, res: Response) => {
  try {
    const { trainNumber } = req.params;
    const updated = db.advanceLiveSimulation(trainNumber);
    if (!updated) {
      return res.status(404).json({ success: false, message: `Train #${trainNumber} not found.` });
    }

    return res.json({
      success: true,
      message: 'Simulated position advanced on track',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAlternativeRoutes = (req: Request, res: Response) => {
  try {
    const { from, to, date, currentTrain } = req.query;
    if (!from || !to) {
      return res.status(400).json({ success: false, message: 'from and to station codes required.' });
    }

    const travelDate = String(date || new Date().toISOString().split('T')[0]);
    const alternatives = db.getAlternativeJourneys(
      String(from),
      String(to),
      travelDate,
      currentTrain ? String(currentTrain) : undefined
    );

    return res.json({ success: true, data: alternatives });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
