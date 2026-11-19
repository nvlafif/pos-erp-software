import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MainLayout from './components/MainLayout';
import RoleRoute, { getDefaultRouteByRole, getNormalizedRole } from './components/RoleRoute';

function ModuleStub({ title, description }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
    </div>
  );
}

function DashboardRouter() {
  const role = getNormalizedRole();
  if (role !== 'OWNER') {
    return <Navigate to={getDefaultRouteByRole(role)} replace />;
  }
  return (
    <ModuleStub
      title="Dashboard Ringkasan Bisnis (Owner)"
      description="Area metrik omzet harian, performa transaksi, dan peringatan stok kritis."
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Rute Terproteksi di dalam MainLayout */}
        <Route element={<RoleRoute allowedRoles={['OWNER', 'GUDANG', 'KASIR']} />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardRouter />} />

            <Route element={<RoleRoute allowedRoles={['OWNER', 'KASIR']} />}>
              <Route
                path="/pos"
                element={
                  <ModuleStub
                    title="Terminal Kasir (Point of Sale)"
                    description="Katalog produk siap jual, keranjang transaksi, dan perhitungan pembayaran."
                  />
                }
              />
              <Route
                path="/transactions"
                element={
                  <ModuleStub
                    title="Riwayat Transaksi"
                    description="Daftar struk penjualan dan detail item per transaksi."
                  />
                }
              />
            </Route>

            <Route element={<RoleRoute allowedRoles={['OWNER', 'GUDANG']} />}>
              <Route
                path="/inventory"
                element={
                  <ModuleStub
                    title="Manajemen Inventaris & Produk"
                    description="Pengelolaan master produk, kategori, harga modal/jual, dan pembaruan stok."
                  />
                }
              />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}