export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      buses_simulados: {
        Row: {
          activo: boolean | null
          created_at: string | null
          id: string
          latitud_actual: number
          longitud_actual: number
          nombre_simulado: string
          progreso_ruta: number | null
          proximo_paradero_id: string | null
          ruta_id: string
          tiempo_estimado_llegada: number | null
          updated_at: string | null
          vehiculo_id: string | null
          velocidad_actual: number | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          id?: string
          latitud_actual: number
          longitud_actual: number
          nombre_simulado: string
          progreso_ruta?: number | null
          proximo_paradero_id?: string | null
          ruta_id: string
          tiempo_estimado_llegada?: number | null
          updated_at?: string | null
          vehiculo_id?: string | null
          velocidad_actual?: number | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          id?: string
          latitud_actual?: number
          longitud_actual?: number
          nombre_simulado?: string
          progreso_ruta?: number | null
          proximo_paradero_id?: string | null
          ruta_id?: string
          tiempo_estimado_llegada?: number | null
          updated_at?: string | null
          vehiculo_id?: string | null
          velocidad_actual?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "buses_simulados_proximo_paradero_id_fkey"
            columns: ["proximo_paradero_id"]
            isOneToOne: false
            referencedRelation: "paraderos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buses_simulados_ruta_id_fkey"
            columns: ["ruta_id"]
            isOneToOne: false
            referencedRelation: "rutas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buses_simulados_vehiculo_id_fkey"
            columns: ["vehiculo_id"]
            isOneToOne: false
            referencedRelation: "vehiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          activo: boolean | null
          apellido: string | null
          cedula: string | null
          created_at: string | null
          email: string
          fecha_registro: string | null
          id: string
          nombre: string
          telefono: string | null
          ultimo_login: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          apellido?: string | null
          cedula?: string | null
          created_at?: string | null
          email: string
          fecha_registro?: string | null
          id?: string
          nombre: string
          telefono?: string | null
          ultimo_login?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          apellido?: string | null
          cedula?: string | null
          created_at?: string | null
          email?: string
          fecha_registro?: string | null
          id?: string
          nombre?: string
          telefono?: string | null
          ultimo_login?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      conductores: {
        Row: {
          activo: boolean | null
          calificacion_promedio: number | null
          created_at: string | null
          experiencia_años: number | null
          id: string
          licencia_numero: string
          licencia_vencimiento: string | null
          total_viajes: number | null
          updated_at: string | null
          usuario_id: string | null
          vehiculo_id: string | null
        }
        Insert: {
          activo?: boolean | null
          calificacion_promedio?: number | null
          created_at?: string | null
          experiencia_años?: number | null
          id?: string
          licencia_numero: string
          licencia_vencimiento?: string | null
          total_viajes?: number | null
          updated_at?: string | null
          usuario_id?: string | null
          vehiculo_id?: string | null
        }
        Update: {
          activo?: boolean | null
          calificacion_promedio?: number | null
          created_at?: string | null
          experiencia_años?: number | null
          id?: string
          licencia_numero?: string
          licencia_vencimiento?: string | null
          total_viajes?: number | null
          updated_at?: string | null
          usuario_id?: string | null
          vehiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conductores_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conductores_vehiculo_id_fkey"
            columns: ["vehiculo_id"]
            isOneToOne: false
            referencedRelation: "vehiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      conductors: {
        Row: {
          apellido: string
          created_at: string
          estado: string | null
          id: string
          nombre: string
          placa: string
          telefono: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          apellido: string
          created_at?: string
          estado?: string | null
          id?: string
          nombre: string
          placa: string
          telefono?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          apellido?: string
          created_at?: string
          estado?: string | null
          id?: string
          nombre?: string
          placa?: string
          telefono?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      configuraciones: {
        Row: {
          categoria: string | null
          clave: string
          created_at: string | null
          descripcion: string | null
          empresa_id: string | null
          id: string
          tipo: string | null
          updated_at: string | null
          valor: string | null
        }
        Insert: {
          categoria?: string | null
          clave: string
          created_at?: string | null
          descripcion?: string | null
          empresa_id?: string | null
          id?: string
          tipo?: string | null
          updated_at?: string | null
          valor?: string | null
        }
        Update: {
          categoria?: string | null
          clave?: string
          created_at?: string | null
          descripcion?: string | null
          empresa_id?: string | null
          id?: string
          tipo?: string | null
          updated_at?: string | null
          valor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "configuraciones_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      desvios: {
        Row: {
          comentarios_validacion: string | null
          conductor_id: string
          created_at: string | null
          descripcion_detallada: string | null
          estado_validacion: string | null
          evidencia_url: string[] | null
          fecha_validacion: string | null
          id: string
          latitud: number
          longitud: number
          motivo: string
          recorrido_id: string
          updated_at: string | null
          validado_por: string | null
        }
        Insert: {
          comentarios_validacion?: string | null
          conductor_id: string
          created_at?: string | null
          descripcion_detallada?: string | null
          estado_validacion?: string | null
          evidencia_url?: string[] | null
          fecha_validacion?: string | null
          id?: string
          latitud: number
          longitud: number
          motivo: string
          recorrido_id: string
          updated_at?: string | null
          validado_por?: string | null
        }
        Update: {
          comentarios_validacion?: string | null
          conductor_id?: string
          created_at?: string | null
          descripcion_detallada?: string | null
          estado_validacion?: string | null
          evidencia_url?: string[] | null
          fecha_validacion?: string | null
          id?: string
          latitud?: number
          longitud?: number
          motivo?: string
          recorrido_id?: string
          updated_at?: string | null
          validado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "desvios_conductor_id_fkey"
            columns: ["conductor_id"]
            isOneToOne: false
            referencedRelation: "conductores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "desvios_recorrido_id_fkey"
            columns: ["recorrido_id"]
            isOneToOne: false
            referencedRelation: "recorridos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "desvios_validado_por_fkey"
            columns: ["validado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          activo: boolean | null
          created_at: string | null
          direccion: string | null
          email: string | null
          estado_membresia: string | null
          fecha_vencimiento_membresia: string | null
          id: string
          logo_url: string | null
          nombre: string
          ruc: string | null
          telefono: string | null
          tipo_plan: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          direccion?: string | null
          email?: string | null
          estado_membresia?: string | null
          fecha_vencimiento_membresia?: string | null
          id?: string
          logo_url?: string | null
          nombre: string
          ruc?: string | null
          telefono?: string | null
          tipo_plan?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          direccion?: string | null
          email?: string | null
          estado_membresia?: string | null
          fecha_vencimiento_membresia?: string | null
          id?: string
          logo_url?: string | null
          nombre?: string
          ruc?: string | null
          telefono?: string | null
          tipo_plan?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      membresias: {
        Row: {
          auto_renovacion: boolean | null
          created_at: string | null
          empresa_id: string | null
          estado: string | null
          fecha_fin: string
          fecha_inicio: string
          id: string
          precio: number
          tipo_plan: string
          updated_at: string | null
        }
        Insert: {
          auto_renovacion?: boolean | null
          created_at?: string | null
          empresa_id?: string | null
          estado?: string | null
          fecha_fin: string
          fecha_inicio?: string
          id?: string
          precio: number
          tipo_plan: string
          updated_at?: string | null
        }
        Update: {
          auto_renovacion?: boolean | null
          created_at?: string | null
          empresa_id?: string | null
          estado?: string | null
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          precio?: number
          tipo_plan?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membresias_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos: {
        Row: {
          created_at: string | null
          descripcion: string | null
          empresa_id: string | null
          estado: string | null
          fecha_pago: string | null
          id: string
          membresia_id: string | null
          metodo_pago: string | null
          monto: number
          referencia_pago: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          empresa_id?: string | null
          estado?: string | null
          fecha_pago?: string | null
          id?: string
          membresia_id?: string | null
          metodo_pago?: string | null
          monto: number
          referencia_pago?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          empresa_id?: string | null
          estado?: string | null
          fecha_pago?: string | null
          id?: string
          membresia_id?: string | null
          metodo_pago?: string | null
          monto?: number
          referencia_pago?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_membresia_id_fkey"
            columns: ["membresia_id"]
            isOneToOne: false
            referencedRelation: "membresias"
            referencedColumns: ["id"]
          },
        ]
      }
      paraderos: {
        Row: {
          activo: boolean | null
          created_at: string | null
          descripcion: string | null
          direccion: string | null
          empresa_id: string
          id: string
          latitud: number
          longitud: number
          nombre: string
          tiene_asientos: boolean | null
          tiene_techado: boolean | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          direccion?: string | null
          empresa_id: string
          id?: string
          latitud: number
          longitud: number
          nombre: string
          tiene_asientos?: boolean | null
          tiene_techado?: boolean | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          direccion?: string | null
          empresa_id?: string
          id?: string
          latitud?: number
          longitud?: number
          nombre?: string
          tiene_asientos?: boolean | null
          tiene_techado?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paraderos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action_count: number | null
          action_type: string
          created_at: string | null
          id: string
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          action_count?: number | null
          action_type: string
          created_at?: string | null
          id?: string
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          action_count?: number | null
          action_type?: string
          created_at?: string | null
          id?: string
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      recorridos: {
        Row: {
          conductor_id: string
          created_at: string | null
          distancia_recorrida_km: number | null
          estado: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          geom_recorrido: unknown
          id: string
          paraderos_visitados: Json | null
          ruta_id: string
          tiene_desvio: boolean | null
          updated_at: string | null
          vehiculo_id: string
          viaje_id: string | null
        }
        Insert: {
          conductor_id: string
          created_at?: string | null
          distancia_recorrida_km?: number | null
          estado?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          geom_recorrido?: unknown
          id?: string
          paraderos_visitados?: Json | null
          ruta_id: string
          tiene_desvio?: boolean | null
          updated_at?: string | null
          vehiculo_id: string
          viaje_id?: string | null
        }
        Update: {
          conductor_id?: string
          created_at?: string | null
          distancia_recorrida_km?: number | null
          estado?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          geom_recorrido?: unknown
          id?: string
          paraderos_visitados?: Json | null
          ruta_id?: string
          tiene_desvio?: boolean | null
          updated_at?: string | null
          vehiculo_id?: string
          viaje_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recorridos_conductor_id_fkey"
            columns: ["conductor_id"]
            isOneToOne: false
            referencedRelation: "conductores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recorridos_ruta_id_fkey"
            columns: ["ruta_id"]
            isOneToOne: false
            referencedRelation: "rutas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recorridos_vehiculo_id_fkey"
            columns: ["vehiculo_id"]
            isOneToOne: false
            referencedRelation: "vehiculos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recorridos_viaje_id_fkey"
            columns: ["viaje_id"]
            isOneToOne: false
            referencedRelation: "viajes"
            referencedColumns: ["id"]
          },
        ]
      }
      reportes: {
        Row: {
          conductor_id: string | null
          created_at: string | null
          descripcion: string | null
          estado: string | null
          fecha_reporte: string | null
          fecha_resolucion: string | null
          id: string
          paradero_id: string | null
          prioridad: string | null
          resuelto_por: string | null
          tipo: string
          titulo: string
          ubicacion_lat: number | null
          ubicacion_lng: number | null
          updated_at: string | null
          vehiculo_id: string | null
          viaje_id: string | null
        }
        Insert: {
          conductor_id?: string | null
          created_at?: string | null
          descripcion?: string | null
          estado?: string | null
          fecha_reporte?: string | null
          fecha_resolucion?: string | null
          id?: string
          paradero_id?: string | null
          prioridad?: string | null
          resuelto_por?: string | null
          tipo: string
          titulo: string
          ubicacion_lat?: number | null
          ubicacion_lng?: number | null
          updated_at?: string | null
          vehiculo_id?: string | null
          viaje_id?: string | null
        }
        Update: {
          conductor_id?: string | null
          created_at?: string | null
          descripcion?: string | null
          estado?: string | null
          fecha_reporte?: string | null
          fecha_resolucion?: string | null
          id?: string
          paradero_id?: string | null
          prioridad?: string | null
          resuelto_por?: string | null
          tipo?: string
          titulo?: string
          ubicacion_lat?: number | null
          ubicacion_lng?: number | null
          updated_at?: string | null
          vehiculo_id?: string | null
          viaje_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reportes_conductor_id_fkey"
            columns: ["conductor_id"]
            isOneToOne: false
            referencedRelation: "conductores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_paradero_id_fkey"
            columns: ["paradero_id"]
            isOneToOne: false
            referencedRelation: "paraderos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_resuelto_por_fkey"
            columns: ["resuelto_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_vehiculo_id_fkey"
            columns: ["vehiculo_id"]
            isOneToOne: false
            referencedRelation: "vehiculos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_viaje_id_fkey"
            columns: ["viaje_id"]
            isOneToOne: false
            referencedRelation: "viajes"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          descripcion: string | null
          id: string
          nombre: string
          permisos: Json | null
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre: string
          permisos?: Json | null
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre?: string
          permisos?: Json | null
        }
        Relationships: []
      }
      rutas: {
        Row: {
          activo: boolean | null
          codigo: string
          created_at: string | null
          descripcion: string | null
          distancia_km: number | null
          empresa_id: string | null
          id: string
          nombre: string
          precio: number | null
          tiempo_estimado_minutos: number | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          codigo: string
          created_at?: string | null
          descripcion?: string | null
          distancia_km?: number | null
          empresa_id?: string | null
          id?: string
          nombre: string
          precio?: number | null
          tiempo_estimado_minutos?: number | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          codigo?: string
          created_at?: string | null
          descripcion?: string | null
          distancia_km?: number | null
          empresa_id?: string | null
          id?: string
          nombre?: string
          precio?: number | null
          tiempo_estimado_minutos?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rutas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      rutas_geometria: {
        Row: {
          created_at: string | null
          geom: unknown
          id: string
          ruta_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          geom: unknown
          id?: string
          ruta_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          geom?: unknown
          id?: string
          ruta_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rutas_geometria_ruta_id_fkey"
            columns: ["ruta_id"]
            isOneToOne: true
            referencedRelation: "rutas"
            referencedColumns: ["id"]
          },
        ]
      }
      rutas_paraderos: {
        Row: {
          direccion: string | null
          id: string
          orden_secuencia: number
          paradero_id: string | null
          ruta_id: string | null
          tiempo_llegada_estimado: string | null
        }
        Insert: {
          direccion?: string | null
          id?: string
          orden_secuencia: number
          paradero_id?: string | null
          ruta_id?: string | null
          tiempo_llegada_estimado?: string | null
        }
        Update: {
          direccion?: string | null
          id?: string
          orden_secuencia?: number
          paradero_id?: string | null
          ruta_id?: string | null
          tiempo_llegada_estimado?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rutas_paraderos_paradero_id_fkey"
            columns: ["paradero_id"]
            isOneToOne: false
            referencedRelation: "paraderos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rutas_paraderos_ruta_id_fkey"
            columns: ["ruta_id"]
            isOneToOne: false
            referencedRelation: "rutas"
            referencedColumns: ["id"]
          },
        ]
      }
      rutas_publicas: {
        Row: {
          fecha_publicacion: string | null
          publicado_por: string | null
          ruta_id: string
          visible_publico: boolean | null
        }
        Insert: {
          fecha_publicacion?: string | null
          publicado_por?: string | null
          ruta_id: string
          visible_publico?: boolean | null
        }
        Update: {
          fecha_publicacion?: string | null
          publicado_por?: string | null
          ruta_id?: string
          visible_publico?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "rutas_publicas_publicado_por_fkey"
            columns: ["publicado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rutas_publicas_ruta_id_fkey"
            columns: ["ruta_id"]
            isOneToOne: true
            referencedRelation: "rutas"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      ubicaciones_tiempo_real: {
        Row: {
          conductor_id: string | null
          created_at: string | null
          direccion_grados: number | null
          id: string
          latitud: number
          longitud: number
          precision_metros: number | null
          timestamp_gps: string | null
          vehiculo_id: string | null
          velocidad: number | null
          viaje_id: string | null
        }
        Insert: {
          conductor_id?: string | null
          created_at?: string | null
          direccion_grados?: number | null
          id?: string
          latitud: number
          longitud: number
          precision_metros?: number | null
          timestamp_gps?: string | null
          vehiculo_id?: string | null
          velocidad?: number | null
          viaje_id?: string | null
        }
        Update: {
          conductor_id?: string | null
          created_at?: string | null
          direccion_grados?: number | null
          id?: string
          latitud?: number
          longitud?: number
          precision_metros?: number | null
          timestamp_gps?: string | null
          vehiculo_id?: string | null
          velocidad?: number | null
          viaje_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ubicaciones_tiempo_real_conductor_id_fkey"
            columns: ["conductor_id"]
            isOneToOne: false
            referencedRelation: "conductores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ubicaciones_tiempo_real_vehiculo_id_fkey"
            columns: ["vehiculo_id"]
            isOneToOne: false
            referencedRelation: "vehiculos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ubicaciones_tiempo_real_viaje_id_fkey"
            columns: ["viaje_id"]
            isOneToOne: false
            referencedRelation: "viajes"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          activo: boolean | null
          apellido: string | null
          cedula: string | null
          created_at: string | null
          email: string | null
          empresa_id: string | null
          id: string
          nombre: string
          rol_id: string | null
          telefono: string | null
          ultimo_login: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          apellido?: string | null
          cedula?: string | null
          created_at?: string | null
          email?: string | null
          empresa_id?: string | null
          id?: string
          nombre: string
          rol_id?: string | null
          telefono?: string | null
          ultimo_login?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          apellido?: string | null
          cedula?: string | null
          created_at?: string | null
          email?: string | null
          empresa_id?: string | null
          id?: string
          nombre?: string
          rol_id?: string | null
          telefono?: string | null
          ultimo_login?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_rol_id_fkey"
            columns: ["rol_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehiculos: {
        Row: {
          activo: boolean | null
          año: number | null
          capacidad_pasajeros: number | null
          color: string | null
          created_at: string | null
          empresa_id: string | null
          id: string
          marca: string | null
          modelo: string | null
          numero_interno: string | null
          placa: string
          tiene_aire: boolean | null
          tiene_gps: boolean | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          año?: number | null
          capacidad_pasajeros?: number | null
          color?: string | null
          created_at?: string | null
          empresa_id?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          numero_interno?: string | null
          placa: string
          tiene_aire?: boolean | null
          tiene_gps?: boolean | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          año?: number | null
          capacidad_pasajeros?: number | null
          color?: string | null
          created_at?: string | null
          empresa_id?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          numero_interno?: string | null
          placa?: string
          tiene_aire?: boolean | null
          tiene_gps?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehiculos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      viajes: {
        Row: {
          conductor_id: string | null
          created_at: string | null
          direccion: string | null
          estado: string | null
          fecha_hora_fin: string | null
          fecha_hora_inicio: string | null
          id: string
          observaciones: string | null
          pasajeros_subidos: number | null
          ruta_id: string | null
          updated_at: string | null
          vehiculo_id: string | null
        }
        Insert: {
          conductor_id?: string | null
          created_at?: string | null
          direccion?: string | null
          estado?: string | null
          fecha_hora_fin?: string | null
          fecha_hora_inicio?: string | null
          id?: string
          observaciones?: string | null
          pasajeros_subidos?: number | null
          ruta_id?: string | null
          updated_at?: string | null
          vehiculo_id?: string | null
        }
        Update: {
          conductor_id?: string | null
          created_at?: string | null
          direccion?: string | null
          estado?: string | null
          fecha_hora_fin?: string | null
          fecha_hora_inicio?: string | null
          id?: string
          observaciones?: string | null
          pasajeros_subidos?: number | null
          ruta_id?: string | null
          updated_at?: string | null
          vehiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "viajes_conductor_id_fkey"
            columns: ["conductor_id"]
            isOneToOne: false
            referencedRelation: "conductores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viajes_ruta_id_fkey"
            columns: ["ruta_id"]
            isOneToOne: false
            referencedRelation: "rutas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viajes_vehiculo_id_fkey"
            columns: ["vehiculo_id"]
            isOneToOne: false
            referencedRelation: "vehiculos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      authenticate_conductor: {
        Args: { password_input: string; placa_input: string }
        Returns: {
          conductor_id: string
          message: string
          success: boolean
          user_id: string
        }[]
      }
      can_view_employee_pii: { Args: never; Returns: boolean }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
      dropgeometrytable:
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_conductor_email_by_placa: {
        Args: { placa_input: string }
        Returns: {
          apellido: string
          conductor_id: string
          email: string
          nombre: string
          user_id: string
        }[]
      }
      get_current_user_empresa_id: { Args: never; Returns: string }
      get_current_user_role: { Args: never; Returns: string }
      gettransactionid: { Args: never; Returns: unknown }
      longtransactionsenabled: { Args: never; Returns: boolean }
      populate_geometry_columns:
        | { Args: { use_typmod?: boolean }; Returns: string }
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      setup_admin_user: {
        Args: { email_param: string; user_id_param: string }
        Returns: undefined
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_askml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geom: unknown }; Returns: number }
        | { Args: { geog: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
