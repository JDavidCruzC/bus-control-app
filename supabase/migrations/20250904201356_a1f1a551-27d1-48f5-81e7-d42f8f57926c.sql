-- Create empresas table
CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  ruc VARCHAR(20) UNIQUE,
  direccion TEXT,
  telefono VARCHAR(20),
  email VARCHAR(100),
  logo_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT,
  permisos JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usuarios table
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100),
  telefono VARCHAR(20),
  cedula VARCHAR(20) UNIQUE,
  rol_id UUID REFERENCES roles(id),
  empresa_id UUID REFERENCES empresas(id),
  activo BOOLEAN DEFAULT true,
  ultimo_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rutas table
CREATE TABLE rutas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id),
  nombre VARCHAR(100) NOT NULL,
  codigo VARCHAR(10) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2),
  distancia_km DECIMAL(10,2),
  tiempo_estimado_minutos INTEGER,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create paraderos table
CREATE TABLE paraderos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  latitud DECIMAL(10, 8) NOT NULL,
  longitud DECIMAL(11, 8) NOT NULL,
  ubicacion GEOGRAPHY(POINT, 4326),
  direccion TEXT,
  tiene_techado BOOLEAN DEFAULT false,
  tiene_asientos BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rutas_paraderos table
CREATE TABLE rutas_paraderos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ruta_id UUID REFERENCES rutas(id) ON DELETE CASCADE,
  paradero_id UUID REFERENCES paraderos(id) ON DELETE CASCADE,
  orden_secuencia INTEGER NOT NULL,
  direccion VARCHAR(20) CHECK (direccion IN ('ida', 'vuelta', 'ambas')),
  tiempo_llegada_estimado TIME,
  UNIQUE(ruta_id, paradero_id, direccion)
);

-- Create vehiculos table
CREATE TABLE vehiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id),
  placa VARCHAR(20) NOT NULL UNIQUE,
  modelo VARCHAR(100),
  marca VARCHAR(100),
  año INTEGER,
  capacidad_pasajeros INTEGER,
  numero_interno VARCHAR(20),
  color VARCHAR(50),
  tiene_gps BOOLEAN DEFAULT false,
  tiene_aire BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conductores table
CREATE TABLE conductores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  vehiculo_id UUID REFERENCES vehiculos(id),
  licencia_numero VARCHAR(50) NOT NULL UNIQUE,
  licencia_vencimiento DATE,
  experiencia_años INTEGER,
  calificacion_promedio DECIMAL(3,2) DEFAULT 0.0,
  total_viajes INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create viajes table
CREATE TABLE viajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ruta_id UUID REFERENCES rutas(id),
  conductor_id UUID REFERENCES conductores(id),
  vehiculo_id UUID REFERENCES vehiculos(id),
  fecha_hora_inicio TIMESTAMP WITH TIME ZONE,
  fecha_hora_fin TIMESTAMP WITH TIME ZONE,
  estado VARCHAR(20) CHECK (estado IN ('programado', 'en_curso', 'completado', 'cancelado')),
  pasajeros_subidos INTEGER DEFAULT 0,
  direccion VARCHAR(20) CHECK (direccion IN ('ida', 'vuelta')),
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ubicaciones_tiempo_real table
CREATE TABLE ubicaciones_tiempo_real (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehiculo_id UUID REFERENCES vehiculos(id),
  conductor_id UUID REFERENCES conductores(id),
  viaje_id UUID REFERENCES viajes(id),
  latitud DECIMAL(10, 8) NOT NULL,
  longitud DECIMAL(11, 8) NOT NULL,
  ubicacion GEOGRAPHY(POINT, 4326),
  velocidad DECIMAL(5,2),
  direccion_grados INTEGER,
  precision_metros INTEGER,
  timestamp_gps TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reportes table
CREATE TABLE reportes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  conductor_id UUID REFERENCES conductores(id),
  vehiculo_id UUID REFERENCES vehiculos(id),
  viaje_id UUID REFERENCES viajes(id),
  paradero_id UUID REFERENCES paraderos(id),
  ubicacion_lat DECIMAL(10, 8),
  ubicacion_lng DECIMAL(11, 8),
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_revision', 'resuelto', 'cerrado')),
  prioridad VARCHAR(20) DEFAULT 'normal' CHECK (prioridad IN ('baja', 'normal', 'alta', 'critica')),
  fecha_reporte TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_resolucion TIMESTAMP WITH TIME ZONE,
  resuelto_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create configuraciones table
CREATE TABLE configuraciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id),
  clave VARCHAR(100) NOT NULL,
  valor TEXT,
  tipo VARCHAR(20) DEFAULT 'string' CHECK (tipo IN ('string', 'number', 'boolean', 'json')),
  descripcion TEXT,
  categoria VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(empresa_id, clave)
);

-- Enable Row Level Security on all tables
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE rutas ENABLE ROW LEVEL SECURITY;
ALTER TABLE paraderos ENABLE ROW LEVEL SECURITY;
ALTER TABLE rutas_paraderos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE conductores ENABLE ROW LEVEL SECURITY;
ALTER TABLE viajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ubicaciones_tiempo_real ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuraciones ENABLE ROW LEVEL SECURITY;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_empresas_updated_at
BEFORE UPDATE ON empresas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rutas_updated_at
BEFORE UPDATE ON rutas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_paraderos_updated_at
BEFORE UPDATE ON paraderos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehiculos_updated_at
BEFORE UPDATE ON vehiculos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conductores_updated_at
BEFORE UPDATE ON conductores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_viajes_updated_at
BEFORE UPDATE ON viajes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reportes_updated_at
BEFORE UPDATE ON reportes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_configuraciones_updated_at
BEFORE UPDATE ON configuraciones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create geographic indexes
CREATE INDEX idx_paraderos_ubicacion ON paraderos USING GIST (ubicacion);
CREATE INDEX idx_ubicaciones_tiempo_real_ubicacion ON ubicaciones_tiempo_real USING GIST (ubicacion);

-- Create indexes for frequent searches
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_cedula ON usuarios(cedula);
CREATE INDEX idx_vehiculos_placa ON vehiculos(placa);
CREATE INDEX idx_conductores_licencia ON conductores(licencia_numero);
CREATE INDEX idx_viajes_estado_fecha ON viajes(estado, fecha_hora_inicio);
CREATE INDEX idx_reportes_estado_fecha ON reportes(estado, fecha_reporte);
CREATE INDEX idx_ubicaciones_timestamp ON ubicaciones_tiempo_real(timestamp_gps);

-- Insert seed data
INSERT INTO empresas (nombre, ruc) VALUES ('Bahía del Sur', '12345678901');

-- Insert roles
INSERT INTO roles (nombre, descripcion) VALUES 
('administrador', 'Acceso completo al sistema'),
('conductor', 'Acceso para conductores de vehículos'),
('cliente', 'Acceso para usuarios finales');

-- Insert initial routes
INSERT INTO rutas (empresa_id, nombre, codigo, descripcion) VALUES 
((SELECT id FROM empresas WHERE nombre = 'Bahía del Sur'), 'Ruta 14', '14', 'Ruta principal 14'),
((SELECT id FROM empresas WHERE nombre = 'Bahía del Sur'), 'Ruta D', 'D', 'Ruta secundaria D');

-- Insert sample paraderos
INSERT INTO paraderos (nombre, descripcion, latitud, longitud, ubicacion) VALUES 
('Terminal Terrestre', 'Terminal principal de buses', -2.170042, -79.922359, ST_Point(-79.922359, -2.170042)),
('Plaza Central', 'Centro de la ciudad', -2.169444, -79.921666, ST_Point(-79.921666, -2.169444)),
('Mercado Municipal', 'Paradero cerca del mercado', -2.168888, -79.920833, ST_Point(-79.920833, -2.168888)),
('Universidad', 'Campus universitario', -2.167777, -79.919722, ST_Point(-79.919722, -2.167777));

-- Link paraderos to routes
INSERT INTO rutas_paraderos (ruta_id, paradero_id, orden_secuencia, direccion) VALUES
((SELECT id FROM rutas WHERE codigo = '14'), (SELECT id FROM paraderos WHERE nombre = 'Terminal Terrestre'), 1, 'ida'),
((SELECT id FROM rutas WHERE codigo = '14'), (SELECT id FROM paraderos WHERE nombre = 'Plaza Central'), 2, 'ida'),
((SELECT id FROM rutas WHERE codigo = '14'), (SELECT id FROM paraderos WHERE nombre = 'Mercado Municipal'), 3, 'ida'),
((SELECT id FROM rutas WHERE codigo = '14'), (SELECT id FROM paraderos WHERE nombre = 'Universidad'), 4, 'ida');

INSERT INTO rutas_paraderos (ruta_id, paradero_id, orden_secuencia, direccion) VALUES
((SELECT id FROM rutas WHERE codigo = 'D'), (SELECT id FROM paraderos WHERE nombre = 'Terminal Terrestre'), 1, 'ida'),
((SELECT id FROM rutas WHERE codigo = 'D'), (SELECT id FROM paraderos WHERE nombre = 'Plaza Central'), 2, 'ida');