DROP TABLE IF EXISTS zoning_typ_update_history CASCADE;
CREATE TABLE zoning_typ_update_history (
  id SERIAL PRIMARY KEY,
  parcel_id INTEGER NOT NULL,
  zoning_typ VARCHAR(80) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
