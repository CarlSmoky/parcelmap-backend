export const allowedZoningTypes = ['Residential', 'Commercial', 'Industrial'];

export const status = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
};

export const logMessages = {
  invalidParcelIds: 'Invalid parcel IDs provided',
  invalidZoningType: (zoningType) =>
    zoningType === ''
      ? 'Zoning type is required and cannot be empty.'
      : `Invalid zoning type: ${zoningType}.`,
  transactionError: (errorMessage) => `Error during transaction: ${errorMessage}`,
  rollbackError: (errorMessage) => `Rollback failed: ${errorMessage}`,
  successUpdate: (count) => `Updated ${count} parcels successfully`,
};