import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { Bug, Mail, Lock, User, Building, Loader2, ArrowRight, ShieldCheck, Sparkles, Hexagon } from 'lucide-react';

// --- THE NEW ENHANCED VECTOR LOGO ---
// --- ULTIMATE CUTE BEE (MEGA-KAWAII CHIBI EDITION) ---
const TopBee = ({ size = 40, animated = true }) => {
  const [isWiggling, setIsWiggling] = useState(false);
  
  useEffect(() => {
    if (!animated) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        setIsWiggling(true);
        setTimeout(() => setIsWiggling(false), 1200);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [animated]);

  return (
    <motion.svg 
      width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"
      animate={animated ? { 
        y: isWiggling ? [0, -12, 0] : [0, -4, 0],
        rotate: isWiggling ? [0, 10, -10, 7, 0] : [0, 3, -3, 0],
        scale: isWiggling ? [1, 1.1, 1] : [1, 1.02, 1],
        filter: ["drop-shadow(0 0 0px rgba(251,191,36,0))", "drop-shadow(0 0 30px rgba(251,191,36,0.6))", "drop-shadow(0 0 0px rgba(251,191,36,0))"]
      } : {}}
      transition={{ duration: isWiggling ? 0.5 : 3.5, repeat: isWiggling ? 0 : Infinity, ease: "easeInOut" }}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id="megaKawaiiFuzzReg" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" />
        </filter>
        <linearGradient id="megaHoneyReg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" /><stop offset="40%" stopColor="#FEF3C7" /><stop offset="80%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <radialGradient id="kawaiiEyeReg" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#4B5563" /><stop offset="60%" stopColor="#111827" /><stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <radialGradient id="deepBlushReg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF85A2" stopOpacity="0.8" /><stop offset="100%" stopColor="#FF85A2" stopOpacity="0" />
        </radialGradient>
      </defs>

      <motion.g animate={animated ? { rotate: [0, 45, 0], opacity: [0.4, 0.7, 0.4] } : {}} transition={{ duration: 0.04, repeat: Infinity }}>
        <path d="M40 40C20 10 0 20 0 40C0 60 20 80 40 60C60 80 80 60 80 40C80 20 60 10 40 40Z" fill="#FDF2F8" fillOpacity="0.5" stroke="#FBCFE8" strokeWidth="1" transform="scale(0.5) translate(40, 20)" />
      </motion.g>

      <motion.g animate={animated ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 2, repeat: Infinity }}>
        <circle cx="75" cy="75" r="30" fill="url(#megaHoneyReg)" filter="url(#megaKawaiiFuzzReg)" />
        <path d="M85 55Q95 55 100 75L95 100Q85 105 75 100" fill="#1F2937" fillOpacity="0.9" />
        <path d="M100 65Q110 70 115 80L108 95Q100 100 92 95" fill="#1F2937" fillOpacity="0.9" />
        <circle cx="102" cy="75" r="2" fill="#000" />
      </motion.g>

      <motion.g animate={animated ? { rotate: isWiggling ? [-8, 8, -8] : [-2, 2] } : {}} transition={{ duration: isWiggling ? 0.3 : 4, repeat: isWiggling ? 4 : Infinity }}>
        <circle cx="40" cy="60" r="35" fill="url(#megaHoneyReg)" filter="url(#megaKawaiiFuzzReg)" />
        <circle cx="40" cy="60" r="32" fill="url(#megaHoneyReg)" fillOpacity="0.2" />
        <circle cx="15" cy="70" r="10" fill="url(#deepBlushReg)" />
        <circle cx="65" cy="70" r="10" fill="url(#deepBlushReg)" />
        <g>
          <circle cx="22" cy="55" r="16" fill="url(#kawaiiEyeReg)" />
          <circle cx="16" cy="48" r="7" fill="white" fillOpacity="0.95" />
          <circle cx="28" cy="60" r="3" fill="white" fillOpacity="0.6" />
          <path d="M10 55Q12 50 14 55" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
          <circle cx="58" cy="55" r="16" fill="url(#kawaiiEyeReg)" />
          <circle cx="52" cy="48" r="7" fill="white" fillOpacity="0.95" />
          <circle cx="64" cy="60" r="3" fill="white" fillOpacity="0.6" />
          <path d="M46 55Q48 50 50 55" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
        </g>
        <path d="M36 75Q38 78 40 75Q42 78 44 75" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <motion.g animate={animated ? { rotate: [-15, 15] } : {}} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} style={{ originX: '40px', originY: '30px' }}>
          <path d="M30 35Q25 10 15 15" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M50 35Q55 10 65 15" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" fill="none" />
          <motion.path animate={animated ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.6, repeat: Infinity }} d="M15 15L17 13L15 11L13 13Z" fill="#FF85A2" />
          <motion.path animate={animated ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} d="M65 15L67 13L65 11L63 13Z" fill="#FF85A2" />
        </motion.g>
      </motion.g>

      <motion.g 
        animate={animated ? { rotateX: [0, -85, 0], scale: [1, 1.1, 1], opacity: [0.9, 0.5, 0.9] } : {}} 
        transition={{ duration: 0.02, repeat: Infinity }}
        style={{ originX: '50px', originY: '50px' }}
      >
        <path d="M50 50C70 10 130 10 130 50C130 90 70 130 50 110C30 130 -30 90 -30 50C-30 10 30 10 50 50Z" fill="#F0F9FF" fillOpacity="0.4" stroke="#BAE6FD" strokeWidth="1" transform="scale(0.6) translate(40, -20)" />
      </motion.g>
    </motion.svg>
  );
};

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', companyName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await register(formData); navigate('/dashboard'); } catch (err) { setError(err.response?.data?.message || 'Initialization failed.'); } finally { setLoading(false); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfdfe] p-6 md:p-10 relative overflow-hidden selection:bg-amber-100 selection:text-amber-600">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-100/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-100/20 rounded-full blur-[120px]" />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-4xl">
        <div className="glass rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl shadow-amber-500/5 border-2 border-white flex flex-col md:flex-row bg-white/80 backdrop-blur-2xl">
          {/* Left Panel */}
          <div className="md:w-5/12 bg-amber-500 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden min-h-[250px]">
            <div className="relative z-10">
              <Link to="/" className="inline-block">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}
                  className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl flex items-center justify-center mb-6 shadow-2xl border-4 border-amber-400/20 hover:scale-110 transition-transform"
                >
                  <TopBee size={40} />
                </motion.div>
              </Link>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-tight mb-4 uppercase">Expand Your <br/>Digital Hive</h1>
              <p className="text-amber-50 font-black uppercase tracking-widest text-[8px] md:text-[10px] opacity-80">Join 10,000+ Enterprises delivering excellence.</p>
            </div>
            <div className="relative z-10 mt-8 md:mt-16 space-y-4 md:space-y-6 hidden sm:block">
              {[ { icon: ShieldCheck, text: 'Sovereign-Grade Security' }, { icon: Sparkles, text: 'Neural AI Integration' } ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform"><item.icon className="w-3.5 h-3.5" /></div>
                  <span className="text-[8px] font-black uppercase tracking-[0.2em]">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel */}
          <div className="md:w-7/12 p-6 md:p-12 bg-white">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="mb-8 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">Initialize Colony</h2>
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-1">Start your 14-day premium hive trial.</p>
                </div>
                <Link to="/" className="text-[10px] font-black text-amber-600 hover:text-amber-700 uppercase tracking-widest flex items-center gap-1.5 transition-colors group">
                  <div className="w-5 h-5 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100"><Hexagon className="w-3 h-3" /></div>
                  Back to Hive
                </Link>
              </div>

              {error && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest overflow-hidden">{error}</motion.div>}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Commander</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-amber-500" />
                    <input name="name" type="text" required value={formData.name} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 ring-amber-50 focus:border-amber-500 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:uppercase placeholder:text-[9px]" placeholder="full name..." />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Colony Domain</label>
                  <div className="relative group">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-amber-500" />
                    <input name="companyName" type="text" required value={formData.companyName} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 ring-amber-50 focus:border-amber-500 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:uppercase placeholder:text-[9px]" placeholder="company name..." />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Neural ID (Email)</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-amber-500" />
                  <input name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 ring-amber-50 focus:border-amber-500 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:uppercase placeholder:text-[9px]" placeholder="enter email..." />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Key</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-amber-500" />
                  <input name="password" type="password" required value={formData.password} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 ring-amber-50 focus:border-amber-500 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:uppercase placeholder:text-[9px]" placeholder="••••••••" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-black py-4 md:py-5 rounded-[1.25rem] shadow-xl shadow-slate-100 hover:bg-amber-500 transition-all flex items-center justify-center gap-3 disabled:opacity-70 group uppercase tracking-widest text-xs">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Hive Profile <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-[9px] uppercase"><span className="bg-white px-4 text-slate-400 font-black tracking-[0.3em]">Neural Link</span></div>
              </div>

              <div className="flex justify-center">
                <GoogleLogin onSuccess={async (cr) => { setLoading(true); try { await googleLogin(cr.credential); navigate('/dashboard'); } catch { setError('Connection failed'); } finally { setLoading(false); } }} onError={() => setError('Google connection failed')} theme="outline" size="large" shape="pill" width="100%" />
              </div>

              <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-widest mt-6">Member already? <Link to="/login" className="text-amber-600 font-black hover:underline ml-1">Sign In</Link></p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
