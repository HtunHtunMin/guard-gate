import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  roleId: string;
  teamIds: string[];
  createdAt: string;
  isActive: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissionIds: string[];
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  userIds: string[];
  createdAt: string;
}

interface AuthState {
  currentUser: User | null;
  users: User[];
  roles: Role[];
  permissions: Permission[];
  teams: Team[];
  isAuthenticated: boolean;
  
  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // User actions
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Role actions
  addRole: (role: Omit<Role, 'id' | 'createdAt'>) => void;
  updateRole: (id: string, updates: Partial<Role>) => void;
  deleteRole: (id: string) => void;
  
  // Permission actions
  addPermission: (permission: Omit<Permission, 'id'>) => void;
  updatePermission: (id: string, updates: Partial<Permission>) => void;
  deletePermission: (id: string) => void;
  
  // Team actions
  addTeam: (team: Omit<Team, 'id' | 'createdAt'>) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  
  // Helper functions
  getUserPermissions: (userId: string) => Permission[];
  hasPermission: (userId: string, permission: string) => boolean;
}

// Initial data
const initialPermissions: Permission[] = [
  { id: '1', name: 'view_users', description: 'View users', resource: 'users', action: 'view' },
  { id: '2', name: 'create_users', description: 'Create users', resource: 'users', action: 'create' },
  { id: '3', name: 'edit_users', description: 'Edit users', resource: 'users', action: 'edit' },
  { id: '4', name: 'delete_users', description: 'Delete users', resource: 'users', action: 'delete' },
  { id: '5', name: 'view_roles', description: 'View roles', resource: 'roles', action: 'view' },
  { id: '6', name: 'create_roles', description: 'Create roles', resource: 'roles', action: 'create' },
  { id: '7', name: 'edit_roles', description: 'Edit roles', resource: 'roles', action: 'edit' },
  { id: '8', name: 'delete_roles', description: 'Delete roles', resource: 'roles', action: 'delete' },
  { id: '9', name: 'view_teams', description: 'View teams', resource: 'teams', action: 'view' },
  { id: '10', name: 'create_teams', description: 'Create teams', resource: 'teams', action: 'create' },
  { id: '11', name: 'edit_teams', description: 'Edit teams', resource: 'teams', action: 'edit' },
  { id: '12', name: 'delete_teams', description: 'Delete teams', resource: 'teams', action: 'delete' },
  { id: '13', name: 'view_permissions', description: 'View permissions', resource: 'permissions', action: 'view' },
  { id: '14', name: 'manage_permissions', description: 'Manage permissions', resource: 'permissions', action: 'manage' },
];

const initialRoles: Role[] = [
  {
    id: 'superadmin',
    name: 'Super Admin',
    description: 'Full system access',
    permissionIds: initialPermissions.map(p => p.id),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Administrative access',
    permissionIds: ['1', '2', '3', '5', '6', '7', '9', '10', '11'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user',
    name: 'User',
    description: 'Basic user access',
    permissionIds: ['1', '5', '9'],
    createdAt: new Date().toISOString(),
  },
];

const initialUsers: User[] = [
  {
    id: 'superadmin',
    email: 'superadmin@example.com',
    name: 'Super Administrator',
    roleId: 'superadmin',
    teamIds: [],
    createdAt: new Date().toISOString(),
    isActive: true,
  },
];

const initialTeams: Team[] = [
  {
    id: '1',
    name: 'Development Team',
    description: 'Software development team',
    userIds: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Management Team',
    description: 'Management and leadership team',
    userIds: ['superadmin'],
    createdAt: new Date().toISOString(),
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: initialUsers,
      roles: initialRoles,
      permissions: initialPermissions,
      teams: initialTeams,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const users = get().users;
        
        // Simple auth check (in real app, this would be server-side)
        if (email === 'superadmin@example.com' && password === 'test123') {
          const user = users.find(u => u.email === email);
          if (user) {
            set({ currentUser: user, isAuthenticated: true });
            return true;
          }
        }
        
        return false;
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },

      addUser: (userData) => {
        const newUser: User = {
          ...userData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        set(state => ({ users: [...state.users, newUser] }));
      },

      updateUser: (id, updates) => {
        set(state => ({
          users: state.users.map(user => 
            user.id === id ? { ...user, ...updates } : user
          )
        }));
      },

      deleteUser: (id) => {
        set(state => ({
          users: state.users.filter(user => user.id !== id)
        }));
      },

      addRole: (roleData) => {
        const newRole: Role = {
          ...roleData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        set(state => ({ roles: [...state.roles, newRole] }));
      },

      updateRole: (id, updates) => {
        set(state => ({
          roles: state.roles.map(role => 
            role.id === id ? { ...role, ...updates } : role
          )
        }));
      },

      deleteRole: (id) => {
        set(state => ({
          roles: state.roles.filter(role => role.id !== id)
        }));
      },

      addPermission: (permissionData) => {
        const newPermission: Permission = {
          ...permissionData,
          id: Date.now().toString(),
        };
        set(state => ({ permissions: [...state.permissions, newPermission] }));
      },

      updatePermission: (id, updates) => {
        set(state => ({
          permissions: state.permissions.map(permission => 
            permission.id === id ? { ...permission, ...updates } : permission
          )
        }));
      },

      deletePermission: (id) => {
        set(state => ({
          permissions: state.permissions.filter(permission => permission.id !== id)
        }));
      },

      addTeam: (teamData) => {
        const newTeam: Team = {
          ...teamData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        set(state => ({ teams: [...state.teams, newTeam] }));
      },

      updateTeam: (id, updates) => {
        set(state => ({
          teams: state.teams.map(team => 
            team.id === id ? { ...team, ...updates } : team
          )
        }));
      },

      deleteTeam: (id) => {
        set(state => ({
          teams: state.teams.filter(team => team.id !== id)
        }));
      },

      getUserPermissions: (userId) => {
        const user = get().users.find(u => u.id === userId);
        if (!user) return [];
        
        const role = get().roles.find(r => r.id === user.roleId);
        if (!role) return [];
        
        return get().permissions.filter(p => role.permissionIds.includes(p.id));
      },

      hasPermission: (userId, permission) => {
        const userPermissions = get().getUserPermissions(userId);
        return userPermissions.some(p => p.name === permission);
      },
    }),
    {
      name: 'auth-store',
    }
  )
);