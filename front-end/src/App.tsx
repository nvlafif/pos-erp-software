import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MainLayout from './components/layout/MainLayout';
import RoleRoute from './features/auth/components/RoleRoute';
import Inventory from './pages/Inventory';
import Dashboard from './pages/Dashboard';
import MasterData from './pages/MasterData';
import Pos from './pages/Pos';
import Transactions from './pages/Transactions';

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
              <Route path="/pos" element={<Pos />} />
              <Route path="/transactions" element={<Transactions />} />
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