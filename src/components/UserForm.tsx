import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Switch } from '@/components/ui/switch';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string | null;
}

interface UserFormData {
  name: string;
  email: string;
  roleId: string;
  isActive: boolean;
}

export function UserForm({ open, onOpenChange, userId }: UserFormProps) {
  const { users, roles, addUser, updateUser } = useAuthStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: {
      name: '',
      email: '',
      roleId: '',
      isActive: true,
    },
  });

  const isEditing = !!userId;
  const existingUser = userId ? users.find(u => u.id === userId) : null;

  useEffect(() => {
    if (existingUser) {
      setValue('name', existingUser.name);
      setValue('email', existingUser.email);
      setValue('roleId', existingUser.roleId);
      setValue('isActive', existingUser.isActive);
    } else {
      reset({
        name: '',
        email: '',
        roleId: '',
        isActive: true,
      });
    }
  }, [existingUser, setValue, reset]);

  const onSubmit = (data: UserFormData) => {
    try {
      if (isEditing && userId) {
        updateUser(userId, data);
        toast({
          title: "User updated",
          description: "The user has been successfully updated.",
        });
      } else {
        addUser({
          ...data,
          teamIds: [],
        });
        toast({
          title: "User created",
          description: "The new user has been successfully created.",
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
          <DialogTitle>{isEditing ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the user information below.' 
              : 'Fill in the details to create a new user account.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter user's full name"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="roleId">Role</Label>
            <Select 
              value={watch('roleId')} 
              onValueChange={(value) => setValue('roleId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roleId && (
              <p className="text-sm text-destructive">{errors.roleId.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={watch('isActive')}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-primary-glow">
              {isEditing ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}