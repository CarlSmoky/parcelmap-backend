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

    // TODO: remove 
    // throw new Error('Simulated error');
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

  if (!Array.isArray(targetParcels) || targetParcels.length === 0 || !targetParcels.every(id => Number.isInteger(id))) {
    return res.status(400).json({ error: 'An array of parcel IDs is required' });
  }

  if (typeof newZoningType !== 'string' || newZoningType.trim() === '') {
    return res.status(400).json({ error: 'A valid zoning type is required' });
  }

  let updateClient;
  try {
    updateClient = await updateDb.connect();

    await updateClient.query('BEGIN');

    // TODO: remove -> Simulate an error after starting the transaction
    // throw new Error('Simulated error for rollback testing');

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

    const query = queries.zoningTypUpdates(placeholders);

    const result = await updateClient.query(query, values);

    await updateClient.query('COMMIT');

    res.status(201).json(result.rows);
  } catch (err) {
    console.error('Error posting zoning type update:', err);

    // Rollback the transaction on error
    if (updateClient) {
      try {
        await updateClient.query('ROLLBACK');
        // TODO: remove
        // throw new Error('Simulated rollback failure');
      } catch (rollbackErr) {
        console.error('Error rolling back transaction:', rollbackErr.message);
      }
    }
    next(err);
  } finally {
    if (updateClient) updateClient.release();
  }
});

export default router;