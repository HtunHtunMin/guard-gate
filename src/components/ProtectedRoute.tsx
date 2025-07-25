import { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { LoginForm } from './LoginForm';

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: string;
}

export function ProtectedRoute({ children, permission }: ProtectedRouteProps) {
  const { isAuthenticated, currentUser, hasPermission } = useAuthStore();

  if (!isAuthenticated || !currentUser) {
    return <LoginForm />;
  }

  if (permission && !hasPermission(currentUser.id, permission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-destructive">403</h1>
          <p className="text-xl text-muted-foreground mb-4">Access Denied</p>
          <p className="text-muted-foreground">
            You don't have permission to access this resource.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}