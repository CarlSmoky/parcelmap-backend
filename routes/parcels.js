import express from 'express';
import { sourceDb, updateDb } from '../db/db.js';
import { queries } from '../db/sql/queries.js';

const router = express.Router();

router.get('/parcels', async (req, res, next) => {
  let sourceClient;
  let updateClient;
  try {
    sourceClient = await sourceDb.connect();
    updateClient = await updateDb.connect();

    const parcelsResult = await sourceClient.query(queries.fetchParcels);
    const parcels = parcelsResult.rows;

    const updatesResult = await updateClient.query(queries.fetchLatestZoningTypUpdates);
    const updates = updatesResult.rows;

    const updateMap = new Map();
    updates.forEach(update => {
      updateMap.set(update.parcel_id, update.zoning_typ);
    });

    const mergedParcels = parcels.map(parcel => ({
      ...parcel,
      zoning_typ: updateMap.get(parcel.id) || parcel.zoning_typ
    }));

    res.json(mergedParcels);
  } catch (err) {
    console.error('Error fetching parcels or updates:', err);
    next(err);
  } finally {
    if (sourceClient) sourceClient.release();
    if (updateClient) updateClient.release();
  }
});

router.post('/parcels', async (req, res, next) => {
  const { targetParcels, newZoningType } = req.body;
  if (!targetParcels || !newZoningType) {
    return res.status(400).json({ error: 'Parcel ID and zoning type are required' });
  }

  let updateClient;
  try {
    updateClient = await updateDb.connect();

    const columnsPerRow = 2;
    const values = [];
    const placeholders = targetParcels
      .map((_, index) => {
        values.push(targetParcels[index], newZoningType);
        return `(${Array.from({ length: columnsPerRow })
          .map((_, colIndex) => `$${index * columnsPerRow + colIndex + 1}`)
          .join(", ")})`;
      })
      .join(", ");

    const result = await updateClient.query(queries.zoningTypUpdates(placeholders), values);

    res.status(201).json(result.rows);
  } catch (err) {
    console.error('Error posting zoning type update:', err);
    next(err);
  } finally {
    if (updateClient) updateClient.release();
  }
});

export default router;