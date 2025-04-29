CREATE TABLE IF NOT EXISTS zoning_typ_update_history (
  id SERIAL PRIMARY KEY,
  parcel_id INTEGER NOT NULL,
  zoning_typ VARCHAR(80) NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);
