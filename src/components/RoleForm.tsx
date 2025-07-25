import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

interface RoleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleId?: string | null;
}

interface RoleFormData {
  name: string;
  description: string;
  permissionIds: string[];
}

export function RoleForm({ open, onOpenChange, roleId }: RoleFormProps) {
  const { roles, permissions, addRole, updateRole } = useAuthStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RoleFormData>({
    defaultValues: {
      name: '',
      description: '',
      permissionIds: [],
    },
  });

  const isEditing = !!roleId;
  const existingRole = roleId ? roles.find(r => r.id === roleId) : null;
  const selectedPermissions = watch('permissionIds') || [];

  useEffect(() => {
    if (existingRole) {
      setValue('name', existingRole.name);
      setValue('description', existingRole.description);
      setValue('permissionIds', existingRole.permissionIds);
    } else {
      reset({
        name: '',
        description: '',
        permissionIds: [],
      });
    }
  }, [existingRole, setValue, reset]);

  const onSubmit = (data: RoleFormData) => {
    try {
      if (isEditing && roleId) {
        updateRole(roleId, data);
        toast({
          title: "Role updated",
          description: "The role has been successfully updated.",
        });
      } else {
        addRole(data);
        toast({
          title: "Role created",
          description: "The new role has been successfully created.",
        });
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    }
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    const current = selectedPermissions;
    if (checked) {
      setValue('permissionIds', [...current, permissionId]);
    } else {
      setValue('permissionIds', current.filter(id => id !== permissionId));
    }
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Role' : 'Add New Role'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the role information and permissions below.' 
              : 'Fill in the details to create a new role.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter role name"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter role description"
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <Label>Permissions</Label>
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                  <div key={resource} className="space-y-2">
                    <h4 className="font-medium text-sm capitalize text-primary">
                      {resource}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 ml-4">
                      {resourcePermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(permission.id, checked as boolean)
                            }
                          />
                          <Label htmlFor={permission.id} className="text-sm">
                            {permission.description}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-primary-glow">
              {isEditing ? 'Update Role' : 'Create Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}