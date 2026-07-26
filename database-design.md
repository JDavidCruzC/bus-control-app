# Base de Datos - Bahía del Sur Transport System

## Estructura Completa de Tablas

### 1. **empresas**
```sql
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
```

### 2. **roles**
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(50) NOT NULL UNIQUE, -- 'administrador', 'conductor', 'cliente'
  descripcion TEXT,
  permisos JSONB, -- JSON con permisos específicos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. **usuarios**
```sql
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
```

### 4. **rutas**
```sql
CREATE TABLE rutas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id),
  nombre VARCHAR(100) NOT NULL, -- 'Ruta 14', 'Ruta D'
  codigo VARCHAR(10) NOT NULL, -- '14', 'D'
  descripcion TEXT,
  precio DECIMAL(10,2),
  distancia_km DECIMAL(10,2),
  tiempo_estimado_minutos INTEGER,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. **paraderos** (Paraderos de la interfaz)
```sql
CREATE TABLE paraderos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  latitud DECIMAL(10, 8) NOT NULL,
  longitud DECIMAL(11, 8) NOT NULL,
  ubicacion GEOGRAPHY(POINT, 4326), -- Para consultas geográficas eficientes
  direccion TEXT,
  tiene_techado BOOLEAN DEFAULT false,
  tiene_asientos BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. **rutas_paraderos** (Relación many-to-many con orden)
```sql
CREATE TABLE rutas_paraderos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ruta_id UUID REFERENCES rutas(id) ON DELETE CASCADE,
  paradero_id UUID REFERENCES paraderos(id) ON DELETE CASCADE,
  orden_secuencia INTEGER NOT NULL, -- Orden del paradero en la ruta
  direccion VARCHAR(20) CHECK (direccion IN ('ida', 'vuelta', 'ambas')),
  tiempo_llegada_estimado TIME, -- Hora estimada de llegada
  UNIQUE(ruta_id, paradero_id, direccion)
);
```

### 7. **vehiculos** (Combis/Buses)
```sql
CREATE TABLE vehiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id),
  placa VARCHAR(20) NOT NULL UNIQUE,
  modelo VARCHAR(100),
  marca VARCHAR(100),
  año INTEGER,
  capacidad_pasajeros INTEGER,
  numero_interno VARCHAR(20), -- Número interno de la empresa
  color VARCHAR(50),
  tiene_gps BOOLEAN DEFAULT false,
  tiene_aire BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 8. **conductores** (De la interfaz - tabla específica)
```sql
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
```

### 9. **viajes**
```sql
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
```

### 10. **ubicaciones_tiempo_real** (Para el Mapa de la interfaz)
```sql
CREATE TABLE ubicaciones_tiempo_real (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehiculo_id UUID REFERENCES vehiculos(id),
  conductor_id UUID REFERENCES conductores(id),
  viaje_id UUID REFERENCES viajes(id),
  latitud DECIMAL(10, 8) NOT NULL,
  longitud DECIMAL(11, 8) NOT NULL,
  ubicacion GEOGRAPHY(POINT, 4326),
  velocidad DECIMAL(5,2), -- km/h
  direccion_grados INTEGER, -- 0-360 grados
  precision_metros INTEGER,
  timestamp_gps TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 11. **reportes** (Para la sección Reportes de la interfaz)
```sql
CREATE TABLE reportes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(50) NOT NULL, -- 'incidente', 'mantenimiento', 'accidente', 'retraso'
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
```

### 12. **configuraciones** (Para Ajustes de la interfaz)
```sql
CREATE TABLE configuraciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id),
  clave VARCHAR(100) NOT NULL,
  valor TEXT,
  tipo VARCHAR(20) DEFAULT 'string' CHECK (tipo IN ('string', 'number', 'boolean', 'json')),
  descripcion TEXT,
  categoria VARCHAR(50), -- 'general', 'notificaciones', 'gps', 'reportes'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(empresa_id, clave)
);
```

## Políticas RLS (Row Level Security)

### Para Conductores:
- Pueden ver/actualizar solo sus propios datos
- Pueden crear reportes
- Pueden actualizar su ubicación en tiempo real
- Pueden ver las rutas asignadas

### Para Administradores:
- Acceso completo a todas las tablas de su empresa
- Pueden gestionar conductores, rutas, paraderos
- Pueden ver todos los reportes
- Pueden acceder a configuraciones

### Para Clientes:
- Solo lectura de rutas y paraderos
- Solo lectura de ubicaciones en tiempo real
- Pueden crear reportes de usuario

## Índices Importantes

```sql
-- Índices geográficos para consultas de proximidad
CREATE INDEX idx_paraderos_ubicacion ON paraderos USING GIST (ubicacion);
CREATE INDEX idx_ubicaciones_tiempo_real_ubicacion ON ubicaciones_tiempo_real USING GIST (ubicacion);

-- Índices para búsquedas frecuentes
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_cedula ON usuarios(cedula);
CREATE INDEX idx_vehiculos_placa ON vehiculos(placa);
CREATE INDEX idx_conductores_licencia ON conductores(licencia_numero);
CREATE INDEX idx_viajes_estado_fecha ON viajes(estado, fecha_hora_inicio);
CREATE INDEX idx_reportes_estado_fecha ON reportes(estado, fecha_reporte);
CREATE INDEX idx_ubicaciones_timestamp ON ubicaciones_tiempo_real(timestamp_gps);
```

## Datos Semilla

```sql
-- Empresa
INSERT INTO empresas (nombre, ruc) VALUES ('Bahía del Sur', '12345678901');

-- Roles
INSERT INTO roles (nombre, descripcion) VALUES 
('administrador', 'Acceso completo al sistema'),
('conductor', 'Acceso para conductores de vehículos'),
('cliente', 'Acceso para usuarios finales');

-- Rutas iniciales
INSERT INTO rutas (empresa_id, nombre, codigo, descripcion) VALUES 
((SELECT id FROM empresas WHERE nombre = 'Bahía del Sur'), 'Ruta 14', '14', 'Ruta principal 14'),
((SELECT id FROM empresas WHERE nombre = 'Bahía del Sur'), 'Ruta D', 'D', 'Ruta secundaria D');
```

Esta estructura soporta todas las funcionalidades mostradas en la interfaz: Control (Paraderos, Mapa, MIRA), Administración (Paraderos, Conductores, Rutas, Reportes) y Opciones (Ajustes).