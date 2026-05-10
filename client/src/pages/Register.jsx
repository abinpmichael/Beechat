import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { Bug, Mail, Lock, User, Building, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfdfe] p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/40 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <div className="glass rounded-[3rem] overflow-hidden shadow-2xl shadow-indigo-100/50 border border-white flex flex-col md:flex-row">
          {/* Left Panel - Branding */}
          <div className="md:w-5/12 premium-gradient p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="relative">
              <motion.div 
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-xl"
              >
                <img src="/logo.png" className="w-14 h-14 object-contain" alt="Logo" />
              </motion.div>
              <h1 className="text-4xl font-black tracking-tighter leading-tight mb-4">Start Your <br/>Digital Colony</h1>
              <p className="text-indigo-100 font-medium opacity-80">Join 10,000+ businesses delivering exceptional support.</p>
            </div>
            
            <div className="relative mt-12 space-y-6">
              {[
                { icon: ShieldCheck, text: 'Enterprise-grade security' },
                { icon: Loader2, text: 'Real-time AI assistance' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="md:w-7/12 p-10 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h2>
                <p className="text-slate-400 text-sm font-bold">No credit card required to start.</p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold mb-6 overflow-hidden"
                >
                  {error}
                </motion.div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      name="name"
                      type="text"
                      required
                      className="w-full pl-10 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-sm text-slate-700"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Company</label>
                  <div className="relative group">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      name="companyName"
                      type="text"
                      required
                      className="w-full pl-10 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-sm text-slate-700"
                      placeholder="Honey Inc."
                      value={formData.companyName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Work Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-sm text-slate-700"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Choose Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-sm text-slate-700"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full premium-gradient text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-200 hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-70 group"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    Create My Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-4 text-slate-400 font-black tracking-widest">Quick Start</span></div>
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    setLoading(true);
                    try {
                      await googleLogin(credentialResponse.credential);
                      navigate('/dashboard');
                    } catch (err) {
                      setError('Google Signup failed. Please try again.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  onError={() => setError('Google Signup failed.')}
                  useOneTap
                  theme="outline"
                  size="large"
                  shape="pill"
                  width="100%"
                />
              </div>

              <p className="text-center text-slate-400 text-xs font-bold mt-6">
                Already member of a colony?{' '}
                <Link to="/login" className="text-indigo-600 font-black hover:underline underline-offset-4 decoration-2">
                  Sign In
                </Link>
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
