import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  LogOut,
  Store,
  UserCircle,
} from 'lucide-react';
import { getNormalizedRole } from './RoleRoute';

const MENU_ITEMS = [
  {
    label: 'Dashboard & Laporan',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: ['OWNER'],
  },
  {
    label: 'Terminal Kasir (POS)',
    path: '/pos',
    icon: ShoppingCart,
    roles: ['OWNER', 'KASIR'],
  },
  {
    label: 'Inventaris & Produk',
    path: '/inventory',
    icon: Package,
    roles: ['OWNER', 'GUDANG'],
  },
  {
    label: 'Riwayat Transaksi',
    path: '/transactions',
    icon: Receipt,
    roles: ['OWNER', 'KASIR'],
  },
];

const ROLE_BADGE_STYLES = {
  OWNER: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  GUDANG: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  KASIR: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

export default function MainLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = getNormalizedRole();

  const visibleMenus = MENU_ITEMS.filter((item) => item.roles.includes(role));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0">
        {/* Brand */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm leading-tight">POS & ERP</h1>
            <p className="text-[11px] text-slate-400">Enterprise System</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {visibleMenus.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5">
            <UserCircle className="w-8 h-8 text-slate-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {user.name || user.email}
              </p>
              <span
                className={`inline-block mt-0.5 px-2 py-0.2 rounded text-[10px] font-semibold border ${
                  ROLE_BADGE_STYLES[role] || 'bg-slate-700 text-slate-300'
                }`}
              >
                {role}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Keluar dari Sesi
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}