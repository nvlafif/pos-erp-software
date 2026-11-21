import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  ReceiptText,
  Package,
  Store,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '../../features/auth/types/auth.types';
import {
  clearAuthSession,
  getNormalizedRole,
  getStoredUser,
} from '../../features/auth/utils/authStorage';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['OWNER'] },
  { to: '/pos', label: 'Kasir POS', icon: ShoppingCart, roles: ['OWNER', 'KASIR'] },
  { to: '/transactions', label: 'Transaksi', icon: ReceiptText, roles: ['OWNER', 'KASIR'] },
  { to: '/inventory', label: 'Inventaris Gudang', icon: Package, roles: ['OWNER', 'GUDANG'] },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const role = getNormalizedRole();

  const visibleMenus = NAV_ITEMS.filter((item) => role && item.roles.includes(role));

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row">
      {/* Sidebar Gelap */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col shrink-0">
        <div className="h-16 px-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white text-sm truncate">POS &amp; ERP System</p>
            <p className="text-[11px] font-medium text-slate-400">Enterprise Edition</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {visibleMenus.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
          <div className="px-2">
            <p className="text-xs font-semibold text-white truncate">
              {user?.name || user?.email || 'Pengguna'}
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              {role || 'GUEST'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}