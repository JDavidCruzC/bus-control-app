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
          id: string
          logo_url: string | null
          nombre: string
          ruc: string | null
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          direccion?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          nombre: string
          ruc?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          direccion?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          nombre?: string
          ruc?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
          password_hash: string | null
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
          password_hash?: string | null
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
          password_hash?: string | null
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
      [_ in never]: never
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
