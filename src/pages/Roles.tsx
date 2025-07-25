import { useState } from 'react';
import { Plus, MoreHorizontal, Edit, Trash2, Shield } from 'lucide-react';
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
import { RoleForm } from '@/components/RoleForm';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';

export default function Roles() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { roles, permissions, users, deleteRole, currentUser, hasPermission } = useAuthStore();

  const canCreate = currentUser && hasPermission(currentUser.id, 'create_roles');
  const canEdit = currentUser && hasPermission(currentUser.id, 'edit_roles');
  const canDelete = currentUser && hasPermission(currentUser.id, 'delete_roles');

  const handleEdit = (roleId: string) => {
    setSelectedRole(roleId);
    setIsFormOpen(true);
  };

  const handleDelete = (roleId: string) => {
    setSelectedRole(roleId);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedRole) {
      deleteRole(selectedRole);
      setIsDeleteOpen(false);
      setSelectedRole(null);
    }
  };

  const getRolePermissions = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return [];
    return permissions.filter(p => role.permissionIds.includes(p.id));
  };

  const getUsersWithRole = (roleId: string) => {
    return users.filter(u => u.roleId === roleId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Roles</h1>
          <p className="text-muted-foreground">Manage user roles and their permissions</p>
        </div>
        {canCreate && (
          <Button
            onClick={() => {
              setSelectedRole(null);
              setIsFormOpen(true);
            }}
            className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-primary transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Role
          </Button>
        )}
      </div>

      <div className="grid gap-6">
        {roles.map((role) => {
          const rolePermissions = getRolePermissions(role.id);
          const userCount = getUsersWithRole(role.id);
          
          return (
            <Card key={role.id} className="shadow-card hover:shadow-hover transition-all duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{role.name}</CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </div>
                  </div>
                  {(canEdit || canDelete) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canEdit && (
                          <DropdownMenuItem onClick={() => handleEdit(role.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {canDelete && role.id !== 'superadmin' && (
                          <DropdownMenuItem 
                            onClick={() => handleDelete(role.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Users assigned:</span>
                    <Badge variant="secondary">{userCount}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Permissions:</span>
                    <div className="flex flex-wrap gap-2">
                      {rolePermissions.map((permission) => (
                        <Badge key={permission.id} variant="outline" className="text-xs">
                          {permission.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(role.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <RoleForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        roleId={selectedRole}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        title="Delete Role"
        description="Are you sure you want to delete this role? Users with this role will need to be reassigned."
      />
    </div>
  );
}