import { Navigate, Outlet } from 'react-router-dom';

export function getNormalizedRole() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user?.role ? user.role.replace('ROLE_', '') : '';
}

export function getDefaultRouteByRole(role) {
  switch (role) {
    case 'KASIR':
      return '/pos';
    case 'GUDANG':
      return '/inventory';
    case 'OWNER':
    default:
      return '/dashboard';
  }
}

export default function RoleRoute({ allowedRoles }) {
  const token = localStorage.getItem('token');
  const role = getNormalizedRole();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getDefaultRouteByRole(role)} replace />;
  }

  return <Outlet />;
}