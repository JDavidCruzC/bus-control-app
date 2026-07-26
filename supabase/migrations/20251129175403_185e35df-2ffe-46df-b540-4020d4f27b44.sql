-- Agregar constraint única a la columna clave en configuraciones (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'configuraciones_clave_key'
  ) THEN
    ALTER TABLE configuraciones ADD CONSTRAINT configuraciones_clave_key UNIQUE (clave);
  END IF;
END $$;

-- Insertar el token de Mapbox en configuraciones
INSERT INTO configuraciones (clave, valor, tipo, descripcion, categoria, empresa_id)
VALUES (
  'mapbox_token',
  'pk.eyJ1IjoiamRhdmlkLWNjIiwiYSI6ImNtaWtrcWVwcTFhNTIzZXBwNzc4N201MHEifQ.RJ9VeLTfTuZ4V4Z0FBMdag',
  'string',
  'Token de acceso de Mapbox API',
  'apis',
  NULL
)
ON CONFLICT (clave) DO UPDATE SET
  valor = EXCLUDED.valor,
  updated_at = now();