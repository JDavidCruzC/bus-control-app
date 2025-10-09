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
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
          id?: string
          latitud?: number
          longitud?: number
          nombre?: string
          tiene_asientos?: boolean | null
          tiene_techado?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
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
      [_ in never]: never
    }
    Functions: {
      authenticate_conductor: {
        Args: { password_input: string; placa_input: string }
        Returns: {
          conductor_id: string
          message: string
          success: boolean
          user_id: string
        }[]
      }
      can_view_employee_pii: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
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
      get_current_user_empresa_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      setup_admin_user: {
        Args: { email_param: string; user_id_param: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
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
