import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { Lock, Mail, Store, Loader2 } from 'lucide-react';
import AlertBanner from '../components/ui/AlertBanner';
import { authService } from '../features/auth/api/authService';
import {
  getDefaultRouteByRole,
  getNormalizedRole,
  setAuthSession,
} from '../features/auth/utils/authStorage';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const { token, ...userData } = await authService.login({ email, password });
      setAuthSession(token, userData);

      const role = getNormalizedRole();
      navigate(getDefaultRouteByRole(role), { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setErrorMsg(
        axiosErr.response?.data?.message ||
          'Gagal terhubung ke server. Pastikan backend Spring Boot berjalan di port 8080.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-3 shadow-sm">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">POS & ERP System</h1>
          <p className="text-sm text-slate-500 mt-1">
            Masuk menggunakan akun operasional Anda
          </p>
        </div>

        <AlertBanner variant="error" message={errorMsg} className="mb-5" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kasir@poserp.com"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memverifikasi...
              </>
            ) : (
              'Masuk ke Sistem'
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center mb-2.5">
            Isi cepat kredensial pengujian (RBAC):
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('owner@poserp.com', 'owner123')}
              className="text-xs py-1.5 px-2 rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium transition cursor-pointer"
            >
              Owner
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('gudang@poserp.com', 'gudang123')}
              className="text-xs py-1.5 px-2 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium transition cursor-pointer"
            >
              Gudang
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('kasir@poserp.com', 'kasir123')}
              className="text-xs py-1.5 px-2 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium transition cursor-pointer"
            >
              Kasir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}