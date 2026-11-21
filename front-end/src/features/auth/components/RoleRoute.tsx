import { Navigate, Outlet } from 'react-router-dom';
import type { UserRole } from '../types/auth.types';
import {
  getDefaultRouteByRole,
  getNormalizedRole,
  getStoredToken,
} from '../utils/authStorage';

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export default function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const token = getStoredToken();
  const role = getNormalizedRole();

  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={getDefaultRouteByRole(role)} replace />;
  }

  return <Outlet />;
}