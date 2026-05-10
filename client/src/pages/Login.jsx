import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { Bug, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials or connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfdfe] p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/50 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-100/50 border border-white">
          <div className="premium-gradient p-10 text-center text-white relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl mb-6 shadow-xl relative z-10"
            >
              <img src="/logo.png" className="w-16 h-16 object-contain" alt="Logo" />
            </motion.div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">Welcome Back</h1>
            <p className="text-indigo-100 font-medium opacity-90">Sign in to manage your colony</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-10 space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                {error}
              </motion.div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-700"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                <a href="#" className="text-xs font-bold text-indigo-600 hover:underline">Forgot?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-700"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full premium-gradient hover:opacity-90 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 disabled:opacity-70 group"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-400 font-black tracking-widest">Or continue with</span></div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  setLoading(true);
                  try {
                    await googleLogin(credentialResponse.credential);
                    navigate('/dashboard');
                  } catch (err) {
                    setError('Google Login failed. Please try again.');
                  } finally {
                    setLoading(false);
                  }
                }}
                onError={() => setError('Google Login failed.')}
                useOneTap
                theme="outline"
                size="large"
                shape="pill"
                width="100%"
              />
            </div>

            <p className="text-center text-slate-400 text-sm font-bold mt-8">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 font-black hover:underline decoration-2 underline-offset-4">
                Join the colony
              </Link>
            </p>
          </form>
        </div>
        <p className="text-center text-slate-400 text-[10px] mt-8 font-black uppercase tracking-[0.2em]">
          Powered by Bee Chat Intelligence
        </p>
      </motion.div>
    </div>
  );
}
