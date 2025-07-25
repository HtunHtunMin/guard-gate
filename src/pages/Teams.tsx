import { useState } from 'react';
import { Plus, MoreHorizontal, Edit, Trash2, Users2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/authStore';
import { TeamForm } from '@/components/TeamForm';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';

export default function Teams() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { teams, users, deleteTeam, currentUser, hasPermission } = useAuthStore();

  const canCreate = currentUser && hasPermission(currentUser.id, 'create_teams');
  const canEdit = currentUser && hasPermission(currentUser.id, 'edit_teams');
  const canDelete = currentUser && hasPermission(currentUser.id, 'delete_teams');

  const handleEdit = (teamId: string) => {
    setSelectedTeam(teamId);
    setIsFormOpen(true);
  };

  const handleDelete = (teamId: string) => {
    setSelectedTeam(teamId);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedTeam) {
      deleteTeam(selectedTeam);
      setIsDeleteOpen(false);
      setSelectedTeam(null);
    }
  };

  const getTeamMembers = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return [];
    return users.filter(u => team.userIds.includes(u.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground">Manage teams and their members</p>
        </div>
        {canCreate && (
          <Button
            onClick={() => {
              setSelectedTeam(null);
              setIsFormOpen(true);
            }}
            className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-primary transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Team
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => {
          const members = getTeamMembers(team.id);
          
          return (
            <Card key={team.id} className="shadow-card hover:shadow-hover transition-all duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
                      <Users2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {members.length} member{members.length !== 1 ? 's' : ''}
                      </CardDescription>
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
                          <DropdownMenuItem onClick={() => handleEdit(team.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {canDelete && (
                          <DropdownMenuItem 
                            onClick={() => handleDelete(team.id)}
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
                  <p className="text-sm text-muted-foreground">{team.description}</p>
                  
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Members:</span>
                    {members.length > 0 ? (
                      <div className="space-y-2">
                        {members.slice(0, 3).map((member) => (
                          <div key={member.id} className="flex items-center space-x-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src="" />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {member.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{member.name}</span>
                          </div>
                        ))}
                        {members.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{members.length - 3} more member{members.length - 3 !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No members assigned</div>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(team.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <TeamForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        teamId={selectedTeam}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        title="Delete Team"
        description="Are you sure you want to delete this team? This will remove all members from the team."
      />
    </div>
  );
}