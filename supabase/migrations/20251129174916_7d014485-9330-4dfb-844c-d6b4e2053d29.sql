-- Add ruta_id to vehiculos table (each bus belongs to ONE route)
ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS ruta_id UUID REFERENCES rutas(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_vehiculos_ruta_id ON vehiculos(ruta_id);

-- Update conductores to have direct ruta_id (inherited from vehicle)
ALTER TABLE conductores ADD COLUMN IF NOT EXISTS ruta_id UUID REFERENCES rutas(id) ON DELETE SET NULL;

-- Create index for conductores ruta
CREATE INDEX IF NOT EXISTS idx_conductores_ruta_id ON conductores(ruta_id);

COMMENT ON COLUMN vehiculos.ruta_id IS 'Ruta asignada a este bus/vehículo. Cada bus opera en una sola ruta.';
COMMENT ON COLUMN conductores.ruta_id IS 'Ruta asignada al conductor (heredada del vehículo asignado).';