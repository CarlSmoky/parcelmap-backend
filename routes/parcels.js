import express from 'express';
import { sourceDb, updateDb } from '../db/db.js';
import { queries } from '../db/sql/queries.js';

const router = express.Router();

router.get('/parcels', async (req, res, next) => {
  try {
    // 1. Fetch parcels from source database
    const parcelsResult = await sourceDb.query(queries.fetchParcels);
    const parcels = parcelsResult.rows;

    // 2. Fetch latest zoning updates from zoning_typ_update_history
    const updatesResult = await updateDb.query(queries.fetchLatestZoningTypUpdates);
    const updates = updatesResult.rows;

    // 3. Create lookup map
    const updateMap = new Map();
    updates.forEach(update => {
      updateMap.set(update.parcel_id, update.zoning_typ);
    });

    // 4. Merge updates
    const mergedParcels = parcels.map(parcel => ({
      ...parcel,
      zoning_typ: updateMap.get(parcel.id) || parcel.zoning_typ
    }));

    res.json(mergedParcels);

  } catch (err) {
    console.error('Error fetching parcels or updates:', err);
    next(err);
  }
});

export default router;