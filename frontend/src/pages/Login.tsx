import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/services';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      login({ ...res.data, token: res.data.token });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] px-4">
      <div className="w-full max-w-[440px]">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-10 py-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-[#eef0f5] rounded-2xl flex items-center justify-center mb-5">
              <GraduationCap className="text-[#6b7a99]" size={28} />
            </div>
            <h1 className="text-[1.75rem] font-bold text-gray-900 tracking-tight">School MS</h1>
            <p className="text-[#8a94a6] mt-1 text-sm">Sign in to your account</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition text-sm bg-white"
                placeholder="admin@school.com"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-widest">
                  Password
                </label>
                <button type="button" className="text-xs text-[#8a94a6] hover:text-gray-600 transition">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition text-sm bg-white pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                  rememberMe ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
                }`}
              >
                {rememberMe && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span className="text-sm text-gray-500 group-hover:text-gray-700 transition">
                Remember me for 30 days
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-semibold text-sm hover:bg-gray-800 transition disabled:opacity-50 mt-2 tracking-wide"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-[#8a94a6] mt-7">
            Not an administrator?{' '}
            <span className="font-bold text-gray-700 cursor-pointer hover:text-gray-900 transition">
              Contact IT Support
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
