export const queries = {
  fetchParcels: `
    SELECT
      id,
      parcelnumb,
      name,
      zoning_typ,
      ST_AsGeoJSON(geom) AS geometry
    FROM real_estate_zoning;
  `,
  fetchLatestZoningTypUpdates: `
    SELECT DISTINCT ON (parcel_id)
      parcel_id,
      zoning_typ
    FROM zoning_typ_update_history
    ORDER BY parcel_id, created_at DESC;
  `,
  zoningTypUpdates: (placeholders) => `
    INSERT INTO zoning_typ_update_history (parcel_id, zoning_typ)
      VALUES ${placeholders}
      RETURNING *;
  `,
};
