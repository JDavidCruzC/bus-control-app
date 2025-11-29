import { useState } from "react";
import { useUsuarios } from "@/hooks/useUsuarios";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UsuarioDialog } from "@/components/empresa/UsuarioDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Plus, 
  Users,
  UserCheck,
  UserX,
  Filter,
  Edit,
  Phone,
  Mail,
  Calendar,
  Shield,
  CheckCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function GestionUsuarios() {
  const { usuarios, loading, updateUsuario, refetch } = useUsuarios();
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [rolFilter, setRolFilter] = useState("todos");
  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<any>(null);

  const filteredUsuarios = usuarios.filter(usuario => {
    const matchesSearch = usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRol = rolFilter === "todos" || usuario.rol?.nombre === rolFilter;
    const matchesEstado = estadoFilter === "todos" || 
                         (estadoFilter === "activo" && usuario.activo) ||
                         (estadoFilter === "inactivo" && !usuario.activo);
    return matchesSearch && matchesRol && matchesEstado;
  });

  const roles = [...new Set(usuarios.map(u => u.rol?.nombre).filter(Boolean))];

  const toggleEstado = async (id: string, activo: boolean) => {
    await updateUsuario(id, { activo: !activo });
  };

  const handleEdit = (usuario: any) => {
    setSelectedUsuario(usuario);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUsuario(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getInitials = (nombre: string, apellido?: string) => {
    return `${nombre[0]}${apellido?.[0] || ''}`.toUpperCase();
  };

  const handleConfirmarEmail = async (usuario: any) => {
    try {
      const { data, error } = await supabase.rpc('confirmar_email_usuario', {
        usuario_id_input: usuario.id
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string };
      
      if (result.success) {
        toast({
          title: "Éxito",
          description: result.message
        });
        refetch();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error al confirmar email:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo confirmar el email",
        variant: "destructive"
      });
    }
  };

  const getRoleColor = (roleName?: string) => {
    switch (roleName) {
      case 'gerente':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
      case 'administrador':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'conductor':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'cobrador':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  // Solo gerentes pueden ver esta sección
  if (userRole !== 'gerente') {
    return (
      <div className="p-6 text-center">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Acceso Restringido</h3>
        <p className="text-muted-foreground">
          Solo los gerentes tienen acceso a la gestión de usuarios.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra los usuarios y roles de tu empresa
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <UsuarioDialog 
        open={dialogOpen} 
        onOpenChange={handleCloseDialog}
        usuario={selectedUsuario}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{usuarios.length}</p>
                <p className="text-muted-foreground text-sm">Total Usuarios</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {usuarios.filter(u => u.activo).length}
                </p>
                <p className="text-muted-foreground text-sm">Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <UserX className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {usuarios.filter(u => !u.activo).length}
                </p>
                <p className="text-muted-foreground text-sm">Inactivos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {usuarios.filter(u => u.rol?.nombre === 'gerente').length}
                </p>
                <p className="text-muted-foreground text-sm">Gerentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={rolFilter} onValueChange={setRolFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los roles</SelectItem>
                  {roles.map(rol => (
                    <SelectItem key={rol} value={rol}>{rol}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="activo">Activos</SelectItem>
                  <SelectItem value="inactivo">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Código/Placa</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Email Confirmado</TableHead>
                <TableHead>Último Login</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(usuario.nombre, usuario.apellido)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{usuario.nombre} {usuario.apellido}</p>
                        <p className="text-sm text-muted-foreground">{usuario.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {usuario.codigo_usuario || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(usuario.rol?.nombre)}>
                      {usuario.rol?.nombre || 'Sin rol'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {usuario.email && (
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {usuario.email}
                        </div>
                      )}
                      {usuario.telefono && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {usuario.telefono}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {usuario.email ? (
                      <div className="flex items-center gap-2">
                        <Badge variant={usuario.email_confirmed ? "default" : "secondary"}>
                          {usuario.email_confirmed ? "Confirmado" : "Pendiente"}
                        </Badge>
                        {!usuario.email_confirmed && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConfirmarEmail(usuario)}
                            title="Confirmar email manualmente"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(usuario.ultimo_login)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={usuario.activo ? "default" : "secondary"}>
                      {usuario.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(usuario)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant={usuario.activo ? "destructive" : "default"}
                        size="sm"
                        onClick={() => toggleEstado(usuario.id, usuario.activo)}
                      >
                        {usuario.activo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredUsuarios.length === 0 && (
            <div className="py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron usuarios</h3>
              <p className="text-muted-foreground">
                {searchTerm || rolFilter !== "todos" || estadoFilter !== "todos"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza agregando usuarios al sistema"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
