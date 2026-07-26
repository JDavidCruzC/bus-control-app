-- Insertar configuraciones del mapa si no existen
INSERT INTO configuraciones (clave, valor, tipo, categoria, descripcion)
VALUES 
  ('map_default_lat', '-17.6396', 'string', 'mapa', 'Latitud por defecto del mapa (Ilo, Perú)'),
  ('map_default_lng', '-71.3378', 'string', 'mapa', 'Longitud por defecto del mapa (Ilo, Perú)'),
  ('map_default_zoom', '13', 'string', 'mapa', 'Nivel de zoom por defecto del mapa')
ON CONFLICT (clave) DO NOTHING;