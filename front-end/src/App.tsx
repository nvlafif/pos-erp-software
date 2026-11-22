import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MainLayout from './components/layout/MainLayout';
import RoleRoute from './features/auth/components/RoleRoute';
import Inventory from './pages/Inventory';
import Dashboard from './pages/Dashboard';
import MasterData from './pages/MasterData';

interface ModuleStubProps {
  title: string;
  description: string;
}

function ModuleStub({ title, description }: ModuleStubProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
    </div>
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
            <Route element={<RoleRoute allowedRoles={['OWNER']} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/master-data" element={<MasterData />} />
            </Route>

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
              <Route path="/inventory" element={<Inventory />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}