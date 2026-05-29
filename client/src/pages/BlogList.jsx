import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Sparkles, Hexagon, BookOpen, User, Calendar, ChevronRight, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../config';

// Unified animated Brand Logo (matching other marketing pages)
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
      } : {}}
      transition={{ duration: isWiggling ? 0.5 : 3.5, repeat: isWiggling ? 0 : Infinity, ease: "easeInOut" }}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id="honeyFuzzBlog" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" />
        </filter>
        <linearGradient id="honeyGradBlog" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" /><stop offset="40%" stopColor="#FEF3C7" /><stop offset="80%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <radialGradient id="eyeGradBlog" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#4B5563" /><stop offset="60%" stopColor="#111827" /><stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <radialGradient id="blushGradBlog" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF85A2" stopOpacity="0.8" /><stop offset="100%" stopColor="#FF85A2" stopOpacity="0" />
        </radialGradient>
      </defs>

      <motion.g animate={{ rotate: [0, 45, 0], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 0.04, repeat: Infinity }}>
        <path d="M40 40C20 10 0 20 0 40C0 60 20 80 40 60C60 80 80 60 80 40C80 20 60 10 40 40Z" fill="#FDF2F8" fillOpacity="0.5" stroke="#FBCFE8" strokeWidth="1" transform="scale(0.5) translate(40, 20)" />
      </motion.g>

      <motion.g animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
        <circle cx="75" cy="75" r="30" fill="url(#honeyGradBlog)" filter="url(#honeyFuzzBlog)" />
        <path d="M85 55Q95 55 100 75L95 100Q85 105 75 100" fill="#1F2937" fillOpacity="0.9" />
        <path d="M100 65Q110 70 115 80L108 95Q100 100 92 95" fill="#1F2937" fillOpacity="0.9" />
        <circle cx="102" cy="75" r="2" fill="#000" />
      </motion.g>

      <motion.g animate={{ rotate: isWiggling ? [-8, 8, -8] : [-2, 2] }} transition={{ duration: isWiggling ? 0.3 : 4, repeat: isWiggling ? 4 : Infinity }} style={{ transformOrigin: '33% 50%' }}>
        <circle cx="40" cy="60" r="35" fill="url(#honeyGradBlog)" filter="url(#honeyFuzzBlog)" />
        <circle cx="40" cy="60" r="32" fill="url(#honeyGradBlog)" fillOpacity="0.2" />
        <circle cx="15" cy="70" r="10" fill="url(#blushGradBlog)" />
        <circle cx="65" cy="70" r="10" fill="url(#blushGradBlog)" />
        <g>
          <circle cx="22" cy="55" r="16" fill="url(#eyeGradBlog)" />
          <circle cx="16" cy="48" r="7" fill="white" fillOpacity="0.95" />
          <circle cx="28" cy="60" r="3" fill="white" fillOpacity="0.6" />
          <circle cx="58" cy="55" r="16" fill="url(#eyeGradBlog)" />
          <circle cx="52" cy="48" r="7" fill="white" fillOpacity="0.95" />
          <circle cx="64" cy="60" r="3" fill="white" fillOpacity="0.6" />
        </g>
        <path d="M36 75Q38 78 40 75Q42 78 44 75" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <motion.g animate={{ rotate: [-15, 15] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: '33% 25%' }}>
          <path d="M30 35Q25 10 15 15" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M50 35Q55 10 65 15" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" fill="none" />
          <motion.path animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity }} d="M15 15L17 13L15 11L13 13Z" fill="#FF85A2" />
          <motion.path animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} d="M65 15L67 13L65 11L63 13Z" fill="#FF85A2" />
        </motion.g>
      </motion.g>

      <motion.g animate={{ rotateX: [0, -85, 0], scale: [1, 1.1, 1], opacity: [0.9, 0.5, 0.9] }} transition={{ duration: 0.02, repeat: Infinity }} style={{ transformOrigin: '42% 42%' }}>
        <path d="M45 45C60 0 115 -5 120 40C125 85 85 95 45 45Z" fill="#F0F9FF" fillOpacity="0.3" stroke="#BAE6FD" strokeOpacity="0.4" strokeWidth="0.8" />
      </motion.g>
    </motion.svg>
  );
};

const BrandLogo = ({ size = 'md', light = false }) => (
  <a href="/" className="flex items-center gap-2.5 md:gap-4 group cursor-pointer text-decoration-none">
    <div 
      className="bg-white flex items-center justify-center shadow-xl border-2 border-amber-100 group-hover:scale-105 transition-all duration-500 relative shrink-0 overflow-hidden rounded-2xl"
      style={{ 
        width: size === 'sm' ? '36px' : (size === 'lg' ? '54px' : '46px'), 
        height: size === 'sm' ? '36px' : (size === 'lg' ? '54px' : '46px'),
        minWidth: size === 'sm' ? '36px' : (size === 'lg' ? '54px' : '46px'), 
        minHeight: size === 'sm' ? '36px' : (size === 'lg' ? '54px' : '46px'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
       <div className="w-full h-full flex items-center justify-center p-1" style={{ maxWidth: '100%', maxHeight: '100%' }}>
          <TopBee size="100%" />
       </div>
    </div>
    <div className="flex flex-col justify-center text-left">
      <span className={`
        ${size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl'} 
        font-black tracking-tight uppercase leading-none ${light ? 'text-white' : 'text-slate-900'}
      `}>
        BEE<span className="text-amber-500">CHAT</span>
      </span>
      <span className={`text-[6px] md:text-[8px] font-black uppercase tracking-[0.2em] ${light ? 'text-white/40' : 'text-slate-400'} mt-0.5`}>The Hive Intelligence</span>
    </div>
  </a>
);

export default function BlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/blog.php`)
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          setPosts(res.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-amber-500/30 overflow-hidden relative pb-32">
      {/* Background Honeycomb Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[50%] -left-[20%] w-[100%] h-[150%] bg-[conic-gradient(from_0deg_at_50%_50%,rgba(245,158,11,0.04)_0deg,rgba(0,0,0,0)_180deg,rgba(245,158,11,0.04)_360deg)] opacity-70"
        />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-amber-500/30 rounded-full blur-[150px] opacity-10 pointer-events-none" />
      </div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <BrandLogo size="sm" light={true} />
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm font-bold text-slate-350 hover:text-white uppercase tracking-wider transition-all flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Home
          </a>
          <a href="/register" className="px-5 py-2.5 bg-white text-slate-900 text-sm font-black uppercase tracking-wider rounded-xl hover:bg-amber-500 hover:text-white transition-all transform hover:scale-105">
            Start Free
          </a>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="pt-32 pb-16 px-6 md:px-12 text-center max-w-4xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[10px] font-black uppercase tracking-widest mb-6"
        >
          <Sparkles className="w-3 h-3" />
          Bee Chronicles
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none mb-6"
        >
          The Complete <span className="text-amber-500">Hive Mind.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-base md:text-lg font-semibold max-w-xl mx-auto leading-relaxed"
        >
          Explore all our insights, tutorials, neural AI updates, and customer success tactics to build your live chat empire.
        </motion.p>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        {loading ? (
          <div className="flex justify-center py-32">
            <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 border border-white/5 rounded-[2.5rem] backdrop-blur-md">
            <span className="text-4xl block mb-4">🐝</span>
            <p className="text-slate-400 font-bold">No articles published yet. The hive is drafting...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.5 }}
                whileHover={{ y: -6 }}
                className="bg-slate-900/30 border-2 border-white/5 hover:border-amber-500/30 shadow-lg hover:shadow-2xl hover:bg-slate-900/50 backdrop-blur-sm rounded-[2.5rem] transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                {/* Image */}
                <div className="h-52 relative overflow-hidden bg-slate-950">
                  {post.image_url ? (
                    <img 
                      src={post.image_url} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-500/10 to-amber-700/20 flex items-center justify-center relative">
                      <Hexagon className="w-16 h-16 text-amber-500/20 animate-pulse stroke-[1]" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl">🐝</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-amber-500 uppercase tracking-widest border border-white/5 flex items-center gap-1 shadow-sm">
                    <BookOpen className="w-3 h-3" />
                    Read
                  </div>
                </div>

                {/* Body */}
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-wider mb-4">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-amber-500" />
                      {post.author || 'Bee Chat Team'}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-500" />
                      {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="text-lg md:text-xl font-black text-white group-hover:text-amber-500 transition-colors duration-200 line-clamp-2 leading-snug mb-3">
                    {post.title}
                  </h3>
                  
                  <p className="text-slate-400 text-sm font-semibold leading-relaxed line-clamp-3 mb-6">
                    {post.summary}
                  </p>

                  <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest group-hover:text-amber-500 transition-colors flex items-center gap-2">
                      Read Article
                      <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
