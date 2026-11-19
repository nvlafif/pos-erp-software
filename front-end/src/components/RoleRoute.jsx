import { Navigate, Outlet } from 'react-router-dom';

export function getNormalizedRole() {
  try {
    const rawUser = localStorage.getItem('user');
    if (!rawUser || rawUser === 'undefined') return '';

    const user = JSON.parse(rawUser);
    const payload = user?.data || user;

    let rawRole =
      payload?.role ??
      (Array.isArray(payload?.roles) ? payload.roles[0] : payload?.roles) ??
      (Array.isArray(payload?.authorities) ? payload.authorities[0] : null);

    if (rawRole && typeof rawRole === 'object') {
      rawRole = rawRole.name || rawRole.authority || '';
    }

    return typeof rawRole === 'string'
      ? rawRole.replace(/^ROLE_/, '').toUpperCase()
      : '';
  } catch {
    return '';
  }
}

export function getDefaultRouteByRole(role) {
  switch (role) {
    case 'KASIR':
      return '/pos';
    case 'GUDANG':
      return '/inventory';
    case 'OWNER':
      return '/dashboard';
    default:
      return '/login';
  }
}

export default function RoleRoute({ allowedRoles }) {
  const token = localStorage.getItem('token');
  const role = getNormalizedRole();

  if (!token || !role) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getDefaultRouteByRole(role)} replace />;
  }

  return <Outlet />;
}