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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

interface TeamFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId?: string | null;
}

interface TeamFormData {
  name: string;
  description: string;
  userIds: string[];
}

export function TeamForm({ open, onOpenChange, teamId }: TeamFormProps) {
  const { teams, users, addTeam, updateTeam } = useAuthStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TeamFormData>({
    defaultValues: {
      name: '',
      description: '',
      userIds: [],
    },
  });

  const isEditing = !!teamId;
  const existingTeam = teamId ? teams.find(t => t.id === teamId) : null;
  const selectedUserIds = watch('userIds') || [];

  useEffect(() => {
    if (existingTeam) {
      setValue('name', existingTeam.name);
      setValue('description', existingTeam.description);
      setValue('userIds', existingTeam.userIds);
    } else {
      reset({
        name: '',
        description: '',
        userIds: [],
      });
    }
  }, [existingTeam, setValue, reset]);

  const onSubmit = (data: TeamFormData) => {
    try {
      if (isEditing && teamId) {
        updateTeam(teamId, data);
        toast({
          title: "Team updated",
          description: "The team has been successfully updated.",
        });
      } else {
        addTeam(data);
        toast({
          title: "Team created",
          description: "The new team has been successfully created.",
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

  const handleUserChange = (userId: string, checked: boolean) => {
    const current = selectedUserIds;
    if (checked) {
      setValue('userIds', [...current, userId]);
    } else {
      setValue('userIds', current.filter(id => id !== userId));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Team' : 'Add New Team'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the team information and members below.' 
              : 'Fill in the details to create a new team.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter team name"
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
                placeholder="Enter team description"
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <Label>Team Members</Label>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted">
                    <Checkbox
                      id={user.id}
                      checked={selectedUserIds.includes(user.id)}
                      onCheckedChange={(checked) => 
                        handleUserChange(user.id, checked as boolean)
                      }
                    />
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Label htmlFor={user.id} className="font-medium cursor-pointer">
                        {user.name}
                      </Label>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
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
              {isEditing ? 'Update Team' : 'Create Team'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}