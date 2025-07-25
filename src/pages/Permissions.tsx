import { useState } from 'react';
import { Plus, MoreHorizontal, Edit, Trash2, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { PermissionForm } from '@/components/PermissionForm';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';

export default function Permissions() {
  const [selectedPermission, setSelectedPermission] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { permissions, roles, deletePermission, currentUser, hasPermission } = useAuthStore();

  const canManage = currentUser && hasPermission(currentUser.id, 'manage_permissions');

  const handleEdit = (permissionId: string) => {
    setSelectedPermission(permissionId);
    setIsFormOpen(true);
  };

  const handleDelete = (permissionId: string) => {
    setSelectedPermission(permissionId);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPermission) {
      deletePermission(selectedPermission);
      setIsDeleteOpen(false);
      setSelectedPermission(null);
    }
  };

  const getRolesWithPermission = (permissionId: string) => {
    return roles.filter(r => r.permissionIds.includes(permissionId));
  };

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Permissions</h1>
          <p className="text-muted-foreground">Manage system permissions and access rights</p>
        </div>
        {canManage && (
          <Button
            onClick={() => {
              setSelectedPermission(null);
              setIsFormOpen(true);
            }}
            className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-primary transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Permission
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
          <Card key={resource} className="shadow-card">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl capitalize">{resource}</CardTitle>
                  <CardDescription>
                    Permissions for {resource} management
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Permission</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Assigned Roles</TableHead>
                      {canManage && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resourcePermissions.map((permission) => {
                      const assignedRoles = getRolesWithPermission(permission.id);
                      return (
                        <TableRow key={permission.id}>
                          <TableCell className="font-medium">{permission.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{permission.action}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {permission.description}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {assignedRoles.map((role) => (
                                <Badge key={role.id} variant="secondary" className="text-xs">
                                  {role.name}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          {canManage && (
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEdit(permission.id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDelete(permission.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PermissionForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        permissionId={selectedPermission}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        title="Delete Permission"
        description="Are you sure you want to delete this permission? This will remove it from all roles."
      />
    </div>
  );
}