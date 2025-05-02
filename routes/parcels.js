import express from 'express';
import { sourceDb, updateDb } from '../db/db.js';
import { queries } from '../db/sql/queries.js';
import { writeAuditLog } from '../utils/auditLog.js';
import { logMessages, status, allowedZoningTypes } from '../config/constants.js';

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
    next(err);
  } finally {
    if (sourceClient) sourceClient.release();
    if (updateClient) updateClient.release();
  }
});

router.post('/parcels', async (req, res, next) => {
  const { targetParcels, newZoningType } = req.body;

  if (!Array.isArray(targetParcels) || targetParcels.length === 0 || !targetParcels.every(id => Number.isInteger(id))) {
    writeAuditLog({
      status: status.FAILED,
      method: req.method,
      uri: req.originalUrl,
      message: logMessages.invalidParcelIds,
      targetIds: targetParcels,
      newZoningType
    });
    return res.status(400).json({ error: 'An array of parcel IDs is required' });
  }

  if (
    typeof newZoningType !== 'string' ||
    newZoningType.trim() === '' ||
    !allowedZoningTypes.includes(newZoningType.trim())
  ) {
    const trimmedZoningType = newZoningType?.trim() || '';
    const errorMessage = logMessages.invalidZoningType(trimmedZoningType);

    writeAuditLog({
      status: status.FAILED,
      method: req.method,
      uri: req.originalUrl,
      message: errorMessage,
      targetIds: targetParcels,
      newZoningType: trimmedZoningType
    });

    return res.status(400).json({ error: 'A valid zoning type is required' });
  }

  let updateClient;
  try {
    updateClient = await updateDb.connect();

    await updateClient.query('BEGIN');
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

    writeAuditLog({
      status: status.SUCCESS,
      method: req.method,
      uri: req.originalUrl,
      message: logMessages.successUpdate(targetParcels.length),
      targetIds: targetParcels,
      newZoningType
    });

    res.status(201).json(result.rows);
  } catch (err) {

    writeAuditLog({
      status: status.FAILED,
      method: req.method,
      uri: req.originalUrl,
      message: logMessages.transactionError(err.message),
      targetIds: targetParcels,
      newZoningType
    });

    // Rollback the transaction on error
    if (updateClient) {
      try {
        await updateClient.query('ROLLBACK');

        writeAuditLog({
          status: status.FAILED,
          method: req.method,
          uri: req.originalUrl,
          message: logMessages.transactionError(err.message),
          targetIds: targetParcels,
          newZoningType,
        });
      } catch (rollbackErr) {
        writeAuditLog({
          status: status.FAILED,
          method: req.method,
          uri: req.originalUrl,
          message: logMessages.rollbackError(rollbackErr.message),
          targetIds: targetParcels,
          newZoningType
        });

        next(rollbackErr); // Pass rollback error to the global error handler
        return; // Exit early to avoid sending a response twice
      }
    }
    next(err); // Pass the original error to the global error handler
  } finally {
    if (updateClient) updateClient.release();
  }
});

export default router;