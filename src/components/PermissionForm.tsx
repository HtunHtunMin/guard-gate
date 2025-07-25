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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

interface PermissionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permissionId?: string | null;
}

interface PermissionFormData {
  name: string;
  description: string;
  resource: string;
  action: string;
}

const resources = ['users', 'roles', 'permissions', 'teams'];
const actions = ['view', 'create', 'edit', 'delete', 'manage'];

export function PermissionForm({ open, onOpenChange, permissionId }: PermissionFormProps) {
  const { permissions, addPermission, updatePermission } = useAuthStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PermissionFormData>({
    defaultValues: {
      name: '',
      description: '',
      resource: '',
      action: '',
    },
  });

  const isEditing = !!permissionId;
  const existingPermission = permissionId ? permissions.find(p => p.id === permissionId) : null;

  useEffect(() => {
    if (existingPermission) {
      setValue('name', existingPermission.name);
      setValue('description', existingPermission.description);
      setValue('resource', existingPermission.resource);
      setValue('action', existingPermission.action);
    } else {
      reset({
        name: '',
        description: '',
        resource: '',
        action: '',
      });
    }
  }, [existingPermission, setValue, reset]);

  const onSubmit = (data: PermissionFormData) => {
    try {
      if (isEditing && permissionId) {
        updatePermission(permissionId, data);
        toast({
          title: "Permission updated",
          description: "The permission has been successfully updated.",
        });
      } else {
        addPermission(data);
        toast({
          title: "Permission created",
          description: "The new permission has been successfully created.",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Permission' : 'Add New Permission'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the permission details below.' 
              : 'Fill in the details to create a new permission.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., create_users"
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
              placeholder="Describe what this permission allows"
              {...register('description', { required: 'Description is required' })}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="resource">Resource</Label>
            <Select 
              value={watch('resource')} 
              onValueChange={(value) => setValue('resource', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a resource" />
              </SelectTrigger>
              <SelectContent>
                {resources.map((resource) => (
                  <SelectItem key={resource} value={resource}>
                    {resource.charAt(0).toUpperCase() + resource.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.resource && (
              <p className="text-sm text-destructive">{errors.resource.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="action">Action</Label>
            <Select 
              value={watch('action')} 
              onValueChange={(value) => setValue('action', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an action" />
              </SelectTrigger>
              <SelectContent>
                {actions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.action && (
              <p className="text-sm text-destructive">{errors.action.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-primary-glow">
              {isEditing ? 'Update Permission' : 'Create Permission'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}