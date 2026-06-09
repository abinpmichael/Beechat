import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { 
  MessageSquare, Bot, Zap, Shield, Users, BarChart3, 
  ChevronRight, Globe, Sparkles, CheckCircle2, ArrowRight,
  Hexagon, Heart, Menu, X, MousePointer2, ZapOff,
  BrainCircuit, Rocket, Database, LayoutDashboard,
  Calendar, User, Clock, BookOpen
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';

// --- ULTIMATE CUTE BEE (MEGA-KAWAII CHIBI EDITION) ---
const TopBee = ({ size = 40, animated = true, followsMouse = false, idPrefix: customPrefix = "bee", className = "" }) => {
  const [isWiggling, setIsWiggling] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const reactId = React.useId().replace(/[-:.]/g, '');
  const idPrefix = `${customPrefix}_${reactId}`;
  
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

  useEffect(() => {
    if (!followsMouse) return;
    const handleMove = (e) => setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 10, y: (e.clientY / window.innerHeight - 0.5) * 10 });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [followsMouse]);

  return (
    <motion.svg 
      width={size} 
      height={size} 
      className={`w-full h-full max-w-full max-h-full aspect-square ${className}`}
      viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"
      animate={animated ? { 
        y: isWiggling ? [0, -12, 0] : [0, -4, 0],
        rotate: isWiggling ? [0, 10, -10, 7, 0] : [0, 3, -3, 0],
        scale: isWiggling ? [1, 1.1, 1] : [1, 1.02, 1],
        filter: ["drop-shadow(0 0 0px rgba(251,191,36,0))", "drop-shadow(0 0 30px rgba(251,191,36,0.6))", "drop-shadow(0 0 0px rgba(251,191,36,0))"]
      } : {}}
      transition={{ duration: isWiggling ? 0.5 : 3.5, repeat: isWiggling ? 0 : Infinity, ease: "easeInOut" }}
      style={{ 
        width: typeof size === 'number' ? `${size}px` : '100%', 
        height: typeof size === 'number' ? `${size}px` : '100%', 
        maxWidth: typeof size === 'number' ? `${size}px` : '100%',
        maxHeight: typeof size === 'number' ? `${size}px` : '100%',
        overflow: 'visible', 
        display: 'block', 
        flexShrink: 0 
      }}
    >
      <defs>
        <filter id={`fuzz${idPrefix}`} x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" />
        </filter>
        <linearGradient id={`honey${idPrefix}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" /><stop offset="40%" stopColor="#FEF3C7" /><stop offset="80%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <radialGradient id={`eye${idPrefix}`} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#4B5563" /><stop offset="60%" stopColor="#111827" /><stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <radialGradient id={`blush${idPrefix}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF85A2" stopOpacity="0.8" /><stop offset="100%" stopColor="#FF85A2" stopOpacity="0" />
        </radialGradient>
      </defs>

      <motion.g animate={animated ? { rotate: [0, 45, 0], opacity: [0.4, 0.7, 0.4] } : {}} transition={{ duration: 0.04, repeat: Infinity }}>
        <path d="M40 40C20 10 0 20 0 40C0 60 20 80 40 60C60 80 80 60 80 40C80 20 60 10 40 40Z" fill="#FDF2F8" fillOpacity="0.5" stroke="#FBCFE8" strokeWidth="1" transform="scale(0.5) translate(40, 20)" />
      </motion.g>

      <motion.g animate={animated ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 2, repeat: Infinity }}>
        <circle cx="75" cy="75" r="30" fill={`url(#honey${idPrefix})`} />
        <path d="M85 55Q95 55 100 75L95 100Q85 105 75 100" fill="#1F2937" fillOpacity="0.9" />
        <path d="M100 65Q110 70 115 80L108 95Q100 100 92 95" fill="#1F2937" fillOpacity="0.9" />
        <circle cx="102" cy="75" r="2" fill="#000" />
      </motion.g>

      <motion.g 
        animate={animated ? { rotate: isWiggling ? [-8, 8, -8] : [-2, 2] } : {}} 
        transition={{ duration: isWiggling ? 0.3 : 4, repeat: isWiggling ? 4 : Infinity }}
        style={{ transformOrigin: '33% 50%' }}
      >
        <circle cx="40" cy="60" r="35" fill={`url(#honey${idPrefix})`} />
        <circle cx="40" cy="60" r="32" fill={`url(#honey${idPrefix})`} fillOpacity="0.2" />
        <circle cx="15" cy="70" r="10" fill={`url(#blush${idPrefix})`} />
        <circle cx="65" cy="70" r="10" fill={`url(#blush${idPrefix})`} />
        <g transform={`translate(${mousePos.x}, ${mousePos.y})`}>
          <circle cx="22" cy="55" r="16" fill={`url(#eye${idPrefix})`} />
          <circle cx="16" cy="48" r="7" fill="white" fillOpacity="0.95" />
          <circle cx="28" cy="60" r="3" fill="white" fillOpacity="0.6" />
          <circle cx="58" cy="55" r="16" fill={`url(#eye${idPrefix})`} />
          <circle cx="52" cy="48" r="7" fill="white" fillOpacity="0.95" />
          <circle cx="64" cy="60" r="3" fill="white" fillOpacity="0.6" />
        </g>
        <path d="M36 75Q38 78 40 75Q42 78 44 75" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <motion.g animate={animated ? { rotate: [-15, 15] } : {}} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: '33% 25%' }}>
          <path d="M30 35Q25 10 15 15" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M50 35Q55 10 65 15" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" fill="none" />
          <motion.path animate={animated ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.6, repeat: Infinity }} d="M15 15L17 13L15 11L13 13Z" fill="#FF85A2" />
          <motion.path animate={animated ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} d="M65 15L67 13L65 11L63 13Z" fill="#FF85A2" />
        </motion.g>
      </motion.g>

      <motion.g 
        animate={animated ? { rotateX: [0, -85, 0], scale: [1, 1.1, 1], opacity: [0.9, 0.5, 0.9] } : {}} 
        transition={{ duration: 0.02, repeat: Infinity }}
        style={{ transformOrigin: '42% 42%' }}
      >
        <path d="M50 50C70 10 130 10 130 50C130 90 70 130 50 110C30 130 -30 90 -30 50C-30 10 30 10 50 50Z" fill="#F0F9FF" fillOpacity="0.4" stroke="#BAE6FD" strokeWidth="1" transform="scale(0.6) translate(40, -20)" />
      </motion.g>
    </motion.svg>
  );
};

const SideBee = TopBee;

const PollenParticles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    {[...Array(30)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ 
          x: Math.random() * 100 + "%", 
          y: Math.random() * 100 + "%", 
          opacity: Math.random() * 0.3,
          scale: Math.random() * 0.5 + 0.5
        }}
        animate={{ 
          y: [null, "-=150px", "+=80px"],
          x: [null, "+=50px", "-=50px"],
          opacity: [0.2, 0.6, 0.2]
        }}
        transition={{ 
          duration: 15 + Math.random() * 25, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute w-1.5 h-1.5 bg-amber-400 rounded-full blur-[1.5px]"
      />
    ))}
  </div>
);

const FloatingHoneyDrops = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ x: Math.random() * 100 + "%", y: -100, opacity: 0 }}
        animate={{ 
          y: ['0vh', '110vh'],
          opacity: [0, 0.4, 0.6, 0.4, 0],
          scale: [0.8, 1.2, 0.8]
        }}
        transition={{ 
          duration: 10 + Math.random() * 15, 
          repeat: Infinity, 
          ease: "linear",
          delay: Math.random() * 10
        }}
        className="absolute w-4 h-6 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full blur-[4px]"
      />
    ))}
  </div>
);

const CursorBee = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      setTrail(p => [...p.slice(-12), { x: e.clientX, y: e.clientY, id: Math.random() + Date.now() }]);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {trail.map((t, i) => (
        <motion.div key={t.id}
          className="fixed w-1.5 h-1.5 bg-amber-400 rounded-full pointer-events-none z-[9998] blur-[1px]"
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: 0, scale: 0, x: t.x, y: t.y }}
          transition={{ duration: 0.8 }}
        />
      ))}
      <motion.div 
        className="fixed pointer-events-none z-[9999] hidden lg:block"
        animate={{ x: mousePos.x - 20, y: mousePos.y - 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 120, mass: 0.5 }}
      >
        <TopBee size={45} followsMouse={true} />
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2">
           <div className="px-3 py-1 bg-slate-900/90 backdrop-blur-md text-[8px] font-black text-amber-500 uppercase tracking-[0.3em] rounded-full shadow-2xl border border-amber-500/30 whitespace-nowrap">
              Empire Guide
           </div>
        </div>
      </motion.div>
    </>
  );
};

// --- HEXAGONAL CELL DECORATION (Enhanced with glow) ---
const HoneyCell = ({ size = 100, x = 0, y = 0, delay = 0, opacity = 0.1, depth = 1, glow = false }) => {
  const { scrollY } = useScroll();
  const yOffset = useTransform(scrollY, [0, 1000], [0, 200 * depth]);
  const springY = useSpring(yOffset, { stiffness: 50, damping: 20 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: -30 }}
      animate={{ opacity, scale: 1, rotate: 0 }}
      transition={{ duration: 1.5, delay, ease: "easeOut" }}
      className="absolute pointer-events-none"
      style={{ 
        left: `${x}%`, top: `${y}%`, 
        width: isMobile ? size * 0.6 : size, 
        height: isMobile ? size * 0.6 : size, 
        y: isMobile ? 0 : springY 
      }}
    >
      {glow && <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 3, repeat: Infinity, delay }} className="absolute inset-0 bg-amber-400/20 rounded-full blur-3xl" />}
      <Hexagon className="w-full h-full text-amber-500/20 fill-amber-500/5 stroke-[0.5]" />
      <motion.div animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.08, 1] }} transition={{ duration: 4, repeat: Infinity, delay }} className="absolute inset-0 flex items-center justify-center">
        <Hexagon className="w-1/2 h-1/2 text-amber-400/30 fill-amber-400/10 stroke-[0.3]" />
      </motion.div>
    </motion.div>
  );
};

// --- FULL ANIMATED HONEYCOMB GRID ---
const AnimatedHoneycombGrid = () => {
  const cellData = [
    { emoji: '🐝', label: 'Live Agents', color: 'amber' },
    { emoji: '🍯', label: 'Honey CRM', color: 'yellow' },
    { emoji: '🧠', label: 'Neural AI', color: 'amber' },
    { emoji: '⚡', label: 'Instant Reply', color: 'yellow' },
    { emoji: '🌐', label: 'Multi-Domain', color: 'amber' },
    { emoji: '👑', label: 'Queen Mode', color: 'yellow' },
    { emoji: '📊', label: 'Analytics', color: 'amber' },
    { emoji: '🔒', label: 'Secure Hive', color: 'yellow' },
    { emoji: '🌸', label: 'Pollen Trail', color: 'amber' },
    { emoji: '🏠', label: 'Colony Hub', color: 'yellow' },
    { emoji: '💬', label: 'Hex Chat', color: 'amber' },
    { emoji: '🚀', label: 'Warp Speed', color: 'yellow' },
  ];

  return (
    <div className="relative py-20 md:py-28 overflow-hidden bg-slate-950">
      {/* Honeycomb tile bg */}
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='104' viewBox='0 0 60 104' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 17.32v34.64L30 69.28 0 51.96V17.32L30 0zM30 103.92l30-17.32v-34.64L30 34.64 0 51.96v34.64l30 17.32z' fill='%23f59e0b' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 104px'
      }} />
      {/* Amber radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(251,191,36,0.12)_0%,transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 text-[10px] font-black uppercase tracking-widest mb-6">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
              <Hexagon className="w-3 h-3 fill-amber-400/30" />
            </motion.div>
            Live Hive Grid
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Everything in <span className="text-amber-400">One Cell.</span></h2>
          <p className="text-slate-400 mt-3 text-sm font-medium max-w-md mx-auto">Each hexagonal cell powers a critical part of your support empire.</p>
        </motion.div>

        {/* Hexagonal grid — offset rows */}
        <div className="flex flex-col items-center gap-0">
          {[cellData.slice(0,3), cellData.slice(3,7), cellData.slice(7,10), cellData.slice(10,12)].map((row, rowIdx) => (
            <div key={rowIdx} className={`flex gap-3 md:gap-4 ${rowIdx % 2 === 1 ? 'ml-16 md:ml-24' : ''}`}>
              {row.map((cell, cellIdx) => (
                <motion.div
                  key={cellIdx}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: (rowIdx * row.length + cellIdx) * 0.07, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.12, zIndex: 10 }}
                  className="relative group cursor-pointer"
                  style={{ width: 110, height: 124 }}
                >
                  {/* Hex SVG */}
                  <svg viewBox="0 0 110 124" className="absolute inset-0 w-full h-full">
                    <path d="M55 4 L104 30 L104 94 L55 120 L6 94 L6 30 Z" fill="rgba(30,41,59,0.9)" stroke="rgba(251,191,36,0.15)" strokeWidth="1.5" className="group-hover:fill-amber-500/10 group-hover:stroke-amber-400/60 transition-all duration-300" />
                  </svg>
                  {/* Glow on hover */}
                  <motion.div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)' }} />
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <span className="text-2xl group-hover:scale-125 transition-transform duration-300">{cell.emoji}</span>
                    <span className="text-[8px] font-black text-slate-400 group-hover:text-amber-400 uppercase tracking-widest transition-colors duration-200 text-center px-2 leading-tight">{cell.label}</span>
                  </div>
                  {/* Pulse ring */}
                  <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0, 0.3, 0] }} transition={{ duration: 3, repeat: Infinity, delay: (rowIdx * 4 + cellIdx) * 0.4 }} className="absolute inset-0" >
                    <svg viewBox="0 0 110 124" className="w-full h-full">
                      <path d="M55 4 L104 30 L104 94 L55 120 L6 94 L6 30 Z" fill="none" stroke="rgba(251,191,36,0.5)" strokeWidth="2" />
                    </svg>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-16">
          <a href="/register" className="inline-flex items-center gap-3 bg-amber-500 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-wider hover:bg-white hover:text-amber-500 transition-all duration-300 shadow-xl shadow-amber-500/30">
            <Hexagon className="w-5 h-5 fill-white/20" /> Claim Your Cell
          </a>
        </motion.div>
      </div>
    </div>
  );
};

const HoneycombBackground = () => {
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 2000], [0, -150]);
  
  return (
    <motion.div style={{ y: yParallax }} className="absolute inset-0 -z-20 pointer-events-none bg-white">
      <PollenParticles />
      <FloatingHoneyDrops />
      {/* Dense honeycomb tile */}
      <div className="absolute inset-0 opacity-[0.07]" style={{ 
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='104' viewBox='0 0 60 104' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 17.32v34.64L30 69.28 0 51.96V17.32L30 0zM30 103.92l30-17.32v-34.64L30 34.64 0 51.96v34.64l30 17.32z' fill='%23f59e0b' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 104px'
      }} />
      {/* Animated shifting glows */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,#f59e0b_0%,transparent_65%)]" 
      />
      <motion.div 
        animate={{ 
          x: ['-10%', '10%', '-10%'],
          y: ['-10%', '10%', '-10%']
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-amber-300/10 rounded-full blur-[120px]" 
      />
      <motion.div 
        animate={{ 
          x: ['10%', '-10%', '10%'],
          y: ['10%', '-10%', '10%']
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-amber-400/10 rounded-full blur-[100px]" 
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-amber-50/10 to-white/0" />
      <HoneyCell size={420} x={-8} y={2} delay={0.2} opacity={0.12} depth={0.2} glow />
      <HoneyCell size={320} x={78} y={8} delay={0.4} opacity={0.16} depth={0.5} glow />
      <HoneyCell size={560} x={12} y={42} delay={0.6} opacity={0.08} depth={0.3} />
      <HoneyCell size={270} x={68} y={62} delay={0.8} opacity={0.13} depth={0.8} />
      <HoneyCell size={220} x={38} y={12} delay={1.0} opacity={0.07} depth={0.4} glow />
      <HoneyCell size={180} x={55} y={80} delay={1.2} opacity={0.09} depth={0.6} />
    </motion.div>
  );
};

// Scrolling bee-facts marquee
const BeeFactStrip = () => {
  const facts = [
    '🐝 A bee visits 50-100 flowers per trip',
    '🍯 Honey never expires — found in 3000yr old tombs',
    '🏠 A hive has 60,000 bees at peak summer',
    '⚡ Bees communicate through waggle dances',
    '🌸 One bee produces 1/12 tsp honey in its lifetime',
    '👑 A queen bee can lay 2,000 eggs per day',
    '🐝 Bees can recognize human faces',
  ];
  const repeated = [...facts, ...facts];
  return (
    <div className="overflow-hidden bg-amber-500 py-3 relative">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-amber-500 to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-amber-500 to-transparent z-10" />
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="flex gap-10 whitespace-nowrap"
      >
        {repeated.map((fact, i) => (
          <span key={i} className="text-white text-xs font-black uppercase tracking-widest flex-shrink-0 flex items-center gap-2">
            <Hexagon className="w-3 h-3 fill-white/30 text-white inline-block flex-shrink-0" />
            {fact}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

const BrandLogo = ({ size = 'md', light = false }) => (
  <a href="/" className="flex items-center gap-2.5 md:gap-4 group cursor-pointer text-decoration-none">
    <div 
      className="bg-white flex items-center justify-center shadow-xl md:shadow-2xl border-2 border-amber-100 group-hover:scale-105 transition-all duration-500 relative shrink-0 overflow-hidden rounded-2xl md:rounded-[1.75rem]"
      style={{ 
        width: size === 'sm' ? '36px' : (size === 'lg' ? '54px' : '46px'), 
        height: size === 'sm' ? '36px' : (size === 'lg' ? '54px' : '46px'),
        minWidth: size === 'sm' ? '36px' : (size === 'lg' ? '54px' : '46px'), 
        minHeight: size === 'sm' ? '36px' : (size === 'lg' ? '54px' : '46px'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box'
      }}
    >
       <div className="w-full h-full flex items-center justify-center p-1 md:p-1.5" style={{ boxSizing: 'border-box', maxWidth: '100%', maxHeight: '100%' }}>
          <TopBee size="100%" />
       </div>
       <div className="absolute inset-0 bg-amber-400/5 blur-xl rounded-full group-hover:bg-amber-400/10 transition-all pointer-events-none" />
    </div>
    <div className="flex flex-col justify-center">
      <span className={`
        ${size === 'sm' ? 'text-base md:text-lg' : size === 'lg' ? 'text-2xl md:text-4xl' : 'text-xl md:text-3xl'} 
        font-black tracking-tight md:tracking-tighter uppercase leading-none ${light ? 'text-white' : 'text-slate-900'}
      `}>
        BEE<span className="text-amber-500">CHAT</span>
      </span>
      <span className={`text-[6px] md:text-[8px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] ${light ? 'text-white/40' : 'text-slate-400'} mt-0.5 md:mt-1`}>The Hive Intelligence</span>
    </div>
  </a>
);

const FlyingBee = ({ delay = 0, customPath, scale = 1, type = "top" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 1, 0],
      scale: [0.5 * scale, 1.2 * scale, 1.2 * scale, 0.5 * scale],
      x: customPath?.x || [0, 200, 400, 200, 0],
      y: customPath?.y || [0, -100, 100, 0],
      rotate: type === 'top' ? [0, 30, -30, 0] : [0, 0, 0]
    }}
    transition={{ duration: 15, repeat: Infinity, delay, ease: "easeInOut" }}
    className="absolute pointer-events-none z-50 hidden md:block"
  >
    <div className="relative">
       {type === 'top' ? <TopBee size={60 * scale} /> : <SideBee size={60 * scale} />}
       <div className="absolute inset-0 bg-amber-400/10 blur-2xl rounded-full -z-10" />
    </div>
  </motion.div>
);

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 50], ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.9)"]);
  const navBorder = useTransform(scrollY, [0, 50], ["rgba(241, 245, 249, 0)", "rgba(241, 245, 249, 1)"]);

  return (
    <motion.nav 
      style={{ backgroundColor: navBg, borderBottomColor: navBorder }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl border-b transition-colors"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 md:h-32 flex items-center justify-between">
        <BrandLogo size="lg" />
        <div className="hidden lg:flex items-center gap-10 xl:gap-16">
          {['Features', 'Benefits', 'Pricing', 'Blog', 'Contact'].map(link => {
            const isBlog = link === 'Blog';
            return (
              <a 
                key={link} 
                href={isBlog ? '/blog' : `#${link.toLowerCase()}`} 
                className="group text-[10px] font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-[0.4em] relative"
              >
                {link}
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300" />
              </a>
            );
          })}
          <a href="/integrations" className="group text-[10px] font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-[0.4em] relative">
            Integrations
            <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300" />
          </a>
        </div>
        <div className="hidden lg:flex items-center gap-6 xl:gap-10">
          <a href="/login" className="text-[10px] font-black text-slate-900 hover:text-amber-500 transition-colors uppercase tracking-[0.4em]">Login</a>
          <a href="/register" className="bg-slate-900 text-white px-8 xl:px-12 py-4 xl:py-5 rounded-2xl md:rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-amber-500 hover:scale-105 transition-all">Join Hive</a>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-3 bg-slate-900 rounded-2xl text-white shadow-xl">
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="lg:hidden bg-white border-t border-slate-100 overflow-hidden shadow-2xl"
          >
             <div className="p-10 flex flex-col gap-8">
                {['Features', 'Benefits', 'Pricing', 'Blog', 'Contact'].map(link => {
                  const isBlog = link === 'Blog';
                  return (
                    <a 
                      key={link} 
                      href={isBlog ? '/blog' : `#${link.toLowerCase()}`} 
                      onClick={() => setIsOpen(false)} 
                      className="text-xl font-black text-slate-900 uppercase tracking-widest hover:text-amber-500 transition-colors"
                    >
                      {link}
                    </a>
                  );
                })}
                <a href="/integrations" onClick={() => setIsOpen(false)} className="text-xl font-black text-slate-900 uppercase tracking-widest hover:text-amber-500 transition-colors">Integrations</a>
                <div className="h-px bg-slate-100" />
                <a href="/login" className="text-xl font-black text-amber-600 uppercase tracking-widest">Member Login</a>
                <a href="/register" className="bg-slate-900 text-white p-6 rounded-3xl text-center font-black text-lg uppercase tracking-widest shadow-xl">Join Hive</a>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const Hero = () => (
  <section className="pt-32 md:pt-48 pb-20 md:pb-24 overflow-hidden relative">
    <HoneycombBackground />
    
    <FlyingBee delay={0} customPath={{ x: ['-20vw', '40vw', '110vw'], y: ['10vh', '-5vh', '30vh'] }} scale={1} type="top" />
    <FlyingBee delay={5} customPath={{ x: ['110vw', '20vw', '-20vw'], y: ['40vh', '5vh', '20vh'] }} scale={0.8} type="side" />
    <FlyingBee delay={10} customPath={{ x: ['-10vw', '60vw', '115vw'], y: ['60vh', '25vh', '50vh'] }} scale={0.6} type="top" />
    
    <div className="max-w-7xl mx-auto px-6 md:px-10 text-center space-y-10 md:space-y-16 relative z-10">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-3 px-6 md:px-10 py-3 md:py-4 bg-white/80 backdrop-blur-xl rounded-full text-amber-600 text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] shadow-2xl border-2 border-amber-100"
      >
        <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
          <Hexagon className="w-4 h-4 md:w-5 md:h-5 text-amber-500 fill-amber-500/20" />
        </motion.div>
        Hive Protocol Active
      </motion.div>

      <div className="relative inline-block">
        <motion.h1 initial="hidden" animate="visible" variants={{
          visible: { transition: { staggerChildren: 0.1 } }
        }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl font-black text-slate-900 tracking-tighter leading-[1.1] md:leading-[0.9] uppercase relative z-10"
        >
          {["Own", "Your", "Digital", "Cell."].map((word, i) => (
            <motion.span 
              key={i} 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className={`inline-block mr-4 ${word === 'Cell.' ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400 bg-[length:200%_auto] animate-gradient-flow' : ''}`}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>
        <motion.div 
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-6 -right-10 md:-top-10 md:-right-20 opacity-20 blur-sm pointer-events-none -z-10"
        >
           <Hexagon className="w-24 h-24 md:w-40 md:h-40 text-amber-500 fill-amber-500/10 stroke-[2]" />
        </motion.div>
      </div>

      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="max-w-3xl mx-auto text-base sm:text-lg md:text-2xl lg:text-3xl text-slate-400 font-bold leading-relaxed tracking-tight px-4"
      >
        The world's most <span className="text-slate-900">adorable</span> and <span className="text-amber-500 underline decoration-amber-500/30 decoration-4 md:decoration-8 underline-offset-4">powerful</span> neural chat colony for modern empires.
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6"
      >
        <div className="relative group">
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -inset-4 bg-amber-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          />
          <a href="/register" className="group relative w-full sm:w-auto bg-slate-900 text-white px-10 md:px-16 py-5 md:py-8 rounded-[2rem] md:rounded-[3rem] font-black text-xl md:text-3xl shadow-3xl hover:bg-amber-500 transition-all duration-500 flex items-center justify-center gap-4 md:gap-6 uppercase tracking-tighter overflow-hidden">
            <span className="relative z-10">Claim Your Spot</span>
            <ArrowRight className="w-6 h-6 md:w-10 md:h-10 relative z-10 group-hover:translate-x-2 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </motion.div>

      <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { emoji: '🍯', label: 'Honey-Fast AI', sub: '< 0.3s response' },
          { emoji: '🐝', label: 'Smart Agents', sub: 'Never misses a buzz' },
          { emoji: '🏠', label: 'Hive Dashboard', sub: 'All cells in one view' },
          { emoji: '👑', label: 'Queen Support', sub: '24/7 royal care' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-amber-100 shadow-sm hover:shadow-md hover:border-amber-300 transition-all"
          >
            <span className="text-2xl">{item.emoji}</span>
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest text-center">{item.label}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center hidden sm:block">{item.sub}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// --- HONEY DRIP SVG DIVIDER ---
const HoneyDrip = ({ flip = false }) => (
  <div className={`w-full overflow-hidden leading-none ${flip ? 'rotate-180' : ''}`} style={{ lineHeight: 0 }}>
    <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-12 md:h-20">
      <path d="M0,0 L0,40 Q60,80 120,40 Q180,0 240,40 Q300,80 360,40 Q420,0 480,40 Q540,80 600,40 Q660,0 720,40 Q780,80 840,40 Q900,0 960,40 Q1020,80 1080,40 Q1140,0 1200,40 Q1260,80 1320,40 Q1380,0 1440,40 L1440,0 Z" fill="#f59e0b" fillOpacity="0.08" />
      <path d="M0,20 Q80,60 160,20 Q240,-20 320,20 Q400,60 480,20 Q560,-20 640,20 Q720,60 800,20 Q880,-20 960,20 Q1040,60 1120,20 Q1200,-20 1280,20 Q1360,60 1440,20 L1440,80 L0,80 Z" fill="#fef3c7" fillOpacity="0.4" />
    </svg>
  </div>
);

// --- LIVE STATS COUNTER STRIP ---
const LiveStats = () => {
  const stats = [
    { value: '2,400+', label: 'Active Hives', emoji: '🏠' },
    { value: '1.2M+', label: 'Chats Handled', emoji: '💬' },
    { value: '99.9%', label: 'Uptime', emoji: '⚡' },
    { value: '< 0.3s', label: 'AI Response', emoji: '🧠' },
    { value: '60k+', label: 'Happy Bees', emoji: '🐝' },
  ];
  return (
    <div className="bg-slate-900 py-10 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='52' viewBox='0 0 30 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 0l15 8.66v17.32L15 34.64 0 25.98V8.66L15 0z' fill='%23f59e0b' fill-rule='evenodd'/%3E%3C/svg%3E")`, backgroundSize: '30px 52px' }} />
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center py-4 px-6 gap-2">
            <span className="text-2xl">{s.emoji}</span>
            <span className="text-2xl md:text-3xl font-black text-amber-400 tracking-tight">{s.value}</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">{s.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// --- NEURAL GUIDE (TUTORIAL / DOCUMENTATION) ---
const TutorialSection = () => {
  const steps = [
    { 
      title: 'Initialize Cell', 
      desc: 'Register your colony and get your unique Hive API key in seconds.',
      icon: Database,
      color: 'bg-amber-100 text-amber-600',
      tag: 'Step 01'
    },
    { 
      title: 'Neural Training', 
      desc: 'Upload PDFs or URLs. Our bees learn your business logic instantly.',
      icon: BrainCircuit,
      color: 'bg-rose-100 text-rose-600',
      tag: 'Step 02'
    },
    { 
      title: 'Deploy Swarm', 
      desc: 'Copy-paste one line of code to activate the chat on your website.',
      icon: Rocket,
      color: 'bg-blue-100 text-blue-600',
      tag: 'Step 03'
    },
    { 
      title: 'Royal Oversight', 
      desc: 'Watch real-time analytics and take over chats from the Queen Console.',
      icon: LayoutDashboard,
      color: 'bg-emerald-100 text-emerald-600',
      tag: 'Step 04'
    },
  ];

  return (
    <section id="guide" className="py-24 md:py-32 bg-slate-50/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:items-center">
          {/* Left: Text & Steps */}
          <div className="lg:w-1/2 space-y-12">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
                <Sparkles className="w-3 h-3 text-amber-500" /> Neural Integration Guide
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight uppercase">
                From Zero to <span className="text-amber-500">Empire</span> <br /> In 5 Minutes.
              </h2>
            </div>

            <div className="space-y-6">
              {steps.map((s, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-6 group"
                >
                  <div className={`w-14 h-14 shrink-0 rounded-2xl ${s.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <s.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{s.tag}</span>
                    <h4 className="text-xl font-black text-slate-900 mb-1">{s.title}</h4>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-sm">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Code Integration Card */}
          <div className="lg:w-1/2 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              className="bg-slate-900 rounded-[2.5rem] p-1 shadow-3xl shadow-amber-500/10 overflow-hidden"
            >
              <div className="bg-slate-800/50 px-8 py-4 flex items-center justify-between border-b border-slate-700/50">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/30" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/30" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/30" />
                </div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-3 h-3" /> index.html
                </div>
              </div>
              <div className="p-8 md:p-10 font-mono text-sm leading-relaxed overflow-x-auto no-scrollbar">
                <pre className="text-slate-400">
                  <code>
                    {`<!-- BeeChat Neural Integration -->\n`}
                    <span className="text-amber-500">{`<script `}</span>
                    <span className="text-slate-300">{`src="https://beechat.pro/widget.js"`}</span>
                    <span className="text-amber-500">{`></script>`}</span>
                    {`\n\n`}
                    <span className="text-amber-500">{`<script>`}</span>
                    {`\n  window.`}
                    <span className="text-emerald-400">BeeChat</span>
                    {`.`}
                    <span className="text-blue-400">init</span>
                    {`({\n    apiKey: `}
                    <span className="text-rose-400">"YOUR_HIVE_KEY"</span>
                    {`,\n    theme: `}
                    <span className="text-rose-400">"honey-dark"</span>
                    {`\n  });\n`}
                    <span className="text-amber-500">{`</script>`}</span>
                  </code>
                </pre>
              </div>
              <div className="bg-slate-800/30 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <TopBee size={24} />
                   </div>
                   <div className="text-[9px] font-black text-white uppercase tracking-widest">Widget Active</div>
                </div>
                <button className="bg-amber-500 hover:bg-amber-400 text-white text-[10px] font-black px-6 py-3 rounded-xl uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20 active:scale-95">
                  Copy Swarm Code
                </button>
              </div>
            </motion.div>

            {/* Decoration Bee */}
            <motion.div 
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -right-10 bg-white p-6 rounded-3xl shadow-2xl border border-amber-100 z-20"
            >
              <div className="flex items-center gap-3">
                 <TopBee size={32} />
                 <div className="pr-4">
                    <p className="text-[10px] font-black text-slate-900 uppercase">Pro Tip</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Installation takes <span className="text-amber-500">60s</span></p>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, color, emoji }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      whileHover={{ scale: 1.05 }}
      className="bg-white p-8 md:p-10 rounded-3xl border-2 border-amber-50 hover:border-amber-200 hover:shadow-xl transition-all duration-400 group relative overflow-hidden"
    >
      <div style={{ transform: "translateZ(50px)" }} className="relative z-10">
        {/* Honeycomb corner */}
        <div className="absolute -top-16 -right-16 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-500">
          <Hexagon className="w-32 h-32 text-amber-500 fill-amber-500" />
        </div>
        {/* Top emoji badge */}
        <div className="text-3xl mb-4">{emoji}</div>
        <div className={`w-12 h-12 md:w-16 md:h-16 ${color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-400`}>
          <Icon className="w-6 h-6 md:w-8 md:h-8" />
        </div>
        <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 tracking-tight">{title}</h3>
        <p className="text-slate-500 font-medium leading-relaxed text-sm md:text-base">{desc}</p>
      </div>
      {/* Honey drip bottom line */}
      <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600 group-hover:w-full transition-all duration-500 rounded-full" />
    </motion.div>
  );
};

const BlogSection = ({ posts, onPostClick }) => {
  if (!posts || posts.length === 0) return null;
  const displayedPosts = posts.slice(0, 3);

  return (
    <section id="blog" className="py-20 md:py-28 bg-slate-50 relative overflow-hidden">
      {/* Honeycomb background pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='70' viewBox='0 0 40 70' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l20 11.55v23.1L20 46.2 0 34.65V11.55L20 0z' fill='%23f59e0b' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        backgroundSize: '40px 70px'
      }} />
      
      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-600 text-[10px] font-black uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Bee News & Insights
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            The Honeycomb <span className="text-amber-500">Chronicles.</span>
          </h2>
          <p className="text-slate-500 mt-3 text-sm font-semibold max-w-md mx-auto">
            Stay up to date with the latest buzz, neural updates, and tips on building your chat empire.
          </p>
        </motion.div>

        {/* Blog Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedPosts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-[2.5rem] border-2 border-amber-50 hover:border-amber-200 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer"
              onClick={() => onPostClick(post)}
            >
              {/* Image Header */}
              <div className="h-56 relative overflow-hidden bg-amber-50">
                {post.image_url ? (
                  <img 
                    src={post.image_url} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-400/20 to-amber-600/30 flex items-center justify-center relative">
                    <Hexagon className="w-16 h-16 text-amber-500/40 animate-pulse stroke-[1]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl">🐝</span>
                    </div>
                  </div>
                )}
                {/* Honeycomb float decoration */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-amber-600 uppercase tracking-widest border border-amber-100 flex items-center gap-1 shadow-sm">
                  <BookOpen className="w-3 h-3 text-amber-500" />
                  Read Post
                </div>
              </div>

              {/* Card Body */}
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-4">
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

                <h3 className="text-xl font-black text-slate-900 group-hover:text-amber-500 transition-colors duration-200 line-clamp-2 leading-snug mb-3">
                  {post.title}
                </h3>
                
                <p className="text-slate-500 text-sm font-semibold leading-relaxed line-clamp-3 mb-6">
                  {post.summary}
                </p>

                {/* Card Footer */}
                <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest group-hover:text-amber-500 transition-colors flex items-center gap-2">
                    Open Article
                    <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {posts.length > 3 && (
          <div className="mt-16 text-center">
            <a 
              href="/blog" 
              className="inline-flex items-center gap-3 px-8 py-4.5 bg-slate-950 hover:bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Explore All Articles
              <ChevronRight className="w-4 h-4 text-amber-500" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

const ContactSection = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await axios.post(`${API_BASE_URL}/contact.php`, formData);
      if (res.data.success) {
        setStatus({ type: 'success', message: res.data.message || 'Message sent successfully!' });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus({ type: 'error', message: res.data.error || 'Failed to send message.' });
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.error || 'An error occurred. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 md:py-28 bg-slate-950 text-white relative overflow-hidden">
      {/* Background honeycomb */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='70' viewBox='0 0 40 70' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l20 11.55v23.1L20 46.2 0 34.65V11.55L20 0z' fill='%23f59e0b' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        backgroundSize: '40px 70px'
      }} />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Left Column */}
        <div className="lg:col-span-5 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[10px] font-black uppercase tracking-widest">
              <MessageSquare className="w-3 h-3 text-amber-500" />
              Get In Touch
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
              Connect with <br />
              the <span className="text-amber-500">Hive.</span>
            </h2>
            <p className="text-slate-400 text-sm font-semibold leading-relaxed">
              Have questions about subscription cells, custom AI agent deployments, or enterprise capabilities? Drop us a line and the swarm will respond.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-slate-900/50 border border-white/5 backdrop-blur-md rounded-3xl space-y-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center font-bold">✉️</div>
              <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Official Support</div>
                <div className="text-sm font-bold">info@beechat.online</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 bg-slate-900/35 border border-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-2xl relative"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-950 border border-white/5 focus:border-amber-500/50 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-white"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-950 border border-white/5 focus:border-amber-500/50 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-white"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-950 border border-white/5 focus:border-amber-500/50 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-white"
                  placeholder="What is your inquiry about?"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message</label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-950 border border-white/5 focus:border-amber-500/50 rounded-2xl font-semibold text-sm focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-white resize-none"
                  placeholder="Tell us details about your project..."
                />
              </div>

              {status.message && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-2xl text-xs font-bold ${
                    status.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                  }`}
                >
                  {status.message}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-white hover:bg-amber-500 text-slate-950 hover:text-white disabled:opacity-50 text-sm font-black uppercase tracking-wider rounded-2xl transition-all duration-300 transform active:scale-95 shadow-xl shadow-amber-500/5 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Send Message ⚡
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const LandingPage = () => {
  const { postSlug } = useParams();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [platformSettings, setPlatformSettings] = useState({});
  const [blogPosts, setBlogPosts] = useState([]);
  const [activePost, setActivePost] = useState(null);
  const [legalModal, setLegalModal] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, sRes, bRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/superadmin.php?action=get_plans`),
          axios.get(`${API_BASE_URL}/settings.php`),
          axios.get(`${API_BASE_URL}/blog.php`)
        ]);
        if (pRes.data && Array.isArray(pRes.data)) setPlans(pRes.data);
        if (sRes.data) setPlatformSettings(sRes.data);
        if (bRes.data && Array.isArray(bRes.data)) setBlogPosts(bRes.data);
      } catch (err) {
        console.error(err);
        setPlans([
          { id: 1, name: 'Free', price: 0, max_websites: 1, ai_enabled: 0 },
          { id: 2, name: 'Starter', price: 19, max_websites: 3, ai_enabled: 1 },
          { id: 3, name: 'Pro', price: 49, max_websites: 10, ai_enabled: 1 },
          { id: 4, name: 'Enterprise', price: 99, max_websites: 9999, ai_enabled: 1 }
        ]);
        setBlogPosts([]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const slug = postSlug || new URLSearchParams(window.location.search).get('post');
    if (slug) {
      axios.get(`${API_BASE_URL}/blog.php?slug=${slug}`)
        .then(res => {
          if (res.data) {
            setActivePost(res.data);
          } else {
            setActivePost(null);
          }
        })
        .catch(err => {
          console.error("Failed to fetch deep-linked post:", err);
          setActivePost(null);
        });
    } else {
      setActivePost(null);
    }
  }, [postSlug]);

  useEffect(() => {
    if (activePost) {
      const originalTitle = document.title;
      const originalDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const originalCanonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
      
      const newTitle = activePost.seo_title || `${activePost.title} | BeeChat`;
      const newDesc = activePost.seo_description || activePost.summary;
      
      document.title = newTitle;
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', newDesc);

      // Dynamically set canonical URL for the active blog post page
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.rel = 'canonical';
        document.head.appendChild(linkCanonical);
      }
      let canonicalBase = 'https://www.beechat.online';
      if (originalCanonical) {
        canonicalBase = originalCanonical.split('/blog/')[0].replace(/\/+$/, '');
      } else {
        canonicalBase = window.location.origin;
      }
      linkCanonical.setAttribute('href', `${canonicalBase}/blog/${activePost.slug}`);
      
      return () => {
        document.title = originalTitle;
        if (originalDesc) {
          const currentMeta = document.querySelector('meta[name="description"]');
          if (currentMeta) currentMeta.setAttribute('content', originalDesc);
        } else {
          const currentMeta = document.querySelector('meta[name="description"]');
          if (currentMeta) currentMeta.remove();
        }

        // Restore original canonical URL
        const currentCanonical = document.querySelector('link[rel="canonical"]');
        if (originalCanonical) {
          if (currentCanonical) currentCanonical.setAttribute('href', originalCanonical);
        } else {
          if (currentCanonical) currentCanonical.remove();
        }
      };
    }
  }, [activePost]);

  const handleClosePost = () => {
    setActivePost(null);
    navigate('/');
  };

  const handleOpenPost = (post) => {
    setActivePost(post);
    navigate(`/blog/${post.slug}`);
  };

  return (
    <div className="min-h-screen bg-white selection:bg-amber-100 selection:text-amber-600 relative overflow-hidden">
      <CursorBee />
      <Nav />
      <main>
        <Hero />
        <LiveStats />
        <BeeFactStrip />
        
        <motion.section 
          id="benefits" 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="py-20 md:py-32 bg-slate-900 rounded-[3rem] md:rounded-[6rem] mx-6 md:mx-10 relative overflow-hidden border-[12px] md:border-[24px] border-white shadow-4xl"
        >
          <div className="absolute inset-0 opacity-[0.05]" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='104' viewBox='0 0 60 104' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 17.32v34.64L30 69.28 0 51.96V17.32L30 0zM30 103.92l30-17.32v-34.64L30 34.64 0 51.96v34.64l30 17.32z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '120px 208px'
          }} />
          <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
              <div className="flex-1 space-y-8">
                <div className="flex items-center gap-3">
                  <Hexagon className="w-6 h-6 text-amber-400 fill-amber-500/30" />
                  <span className="text-amber-400 text-[10px] font-black uppercase tracking-[0.5em]">Hive Protocol</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter leading-tight">
                  Build Your <span className="text-amber-400">Colony</span> Faster.
                </h2>
                <p className="text-slate-400 font-semibold text-sm md:text-base leading-relaxed max-w-sm">
                  Every feature built like a honeycomb — interlocking, efficient, and impossible to break.
                </p>
                <div className="grid grid-cols-1 gap-5">
                  {[
                    { icon: Zap, title: "Neural Sync", desc: "Real-time AI across all your touchpoints." },
                    { icon: Shield, title: "Hex Command", desc: "Modular dashboard built for elite agent efficiency." },
                    { icon: Globe, title: "Colony Scale", desc: "Expand to unlimited cells with zero friction." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 group items-start p-4 rounded-2xl hover:bg-white/5 transition-all">
                      <div className="flex-shrink-0 w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform border border-amber-500/20">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-white uppercase tracking-tight">{item.title}</h4>
                        <p className="text-slate-400 font-medium text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  {[
                    { icon: Zap, label: "Instant Setup", value: "< 5 min", color: "text-amber-400" },
                    { icon: Shield, label: "Uptime", value: "99.9%", color: "text-emerald-400" },
                    { icon: BarChart3, label: "Avg Response", value: "0.3s", color: "text-sky-400" },
                    { icon: Globe, label: "Global Cells", value: "10k+", color: "text-purple-400" },
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl p-5 md:p-8 flex flex-col gap-4 hover:bg-white/10 transition-all"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
                      </div>
                      <div>
                        <p className={`text-2xl md:text-3xl font-black tracking-tighter ${stat.color}`}>{stat.value}</p>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6 p-5 md:p-8 bg-amber-500/10 border border-amber-500/20 rounded-2xl md:rounded-3xl flex items-center gap-4">
                  <div className="flex -space-x-2 flex-shrink-0">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-slate-900 flex items-center justify-center">
                        <Hexagon className="w-4 h-4 text-white fill-white/20" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-white font-black text-sm">Join 2,400+ hives</p>
                    <p className="text-slate-400 text-xs">Already buzzing on BeeChat</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section 
          id="features" 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-20 md:py-28 relative overflow-hidden"
        >
          {/* Features section honeycomb tile bg */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='70' viewBox='0 0 40 70' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l20 11.55v23.1L20 46.2 0 34.65V11.55L20 0z' fill='%23f59e0b' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '40px 70px'
          }} />
          <div className="max-w-7xl mx-auto px-6 md:px-10 text-center">
            <div className="relative inline-block mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none relative z-10">The Hive Core.</h2>
              <div className="absolute -bottom-3 left-0 w-full h-3 bg-amber-500/20 -z-10" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              <FeatureCard icon={Bot} emoji="🧠" title="Neural Mind" desc="Self-evolving AI that learns your business in hours, not months." color="bg-amber-50 text-amber-600" />
              <FeatureCard icon={MessageSquare} emoji="⚡" title="Hex Flow" desc="Lightning-fast messaging built for elite hive support teams." color="bg-slate-900 text-white" />
              <FeatureCard icon={Users} emoji="🐝" title="Colony Sync" desc="One dashboard. Every bee. Every conversation. Zero chaos." color="bg-amber-100 text-amber-700" />
            </div>
          </div>
        </motion.section>

        {/* === NEURAL GUIDE / TUTORIAL === */}
        <TutorialSection />

        {/* === JOIN THE HIVE CTA === */}
        <HoneyDrip />
        <div className="py-20 bg-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='104' viewBox='0 0 60 104' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 17.32v34.64L30 69.28 0 51.96V17.32L30 0zM30 103.92l30-17.32v-34.64L30 34.64 0 51.96v34.64l30 17.32z' fill='%23f59e0b' fill-rule='evenodd'/%3E%3C/svg%3E")`, backgroundSize: '60px 104px' }} />
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="space-y-8">
              <div className="flex justify-center">
                <motion.div animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }}>
                  <TopBee size={80} idPrefix="cta" />
                </motion.div>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Your Hive is <span className="text-amber-500">Waiting.</span>
              </h2>
              <p className="text-slate-400 font-medium text-base md:text-lg max-w-xl mx-auto leading-relaxed">
                Set up your AI-powered chat colony in under 5 minutes. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="/register" className="group w-full sm:w-auto bg-amber-500 text-white px-10 py-5 rounded-2xl font-black text-base shadow-xl shadow-amber-200 hover:bg-slate-900 transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-wider">
                  <Hexagon className="w-5 h-5 fill-white/20" /> Start Free — No Card Needed
                </a>
                <a href="/login" className="w-full sm:w-auto border-2 border-slate-200 text-slate-600 px-10 py-5 rounded-2xl font-black text-base hover:border-amber-400 hover:text-amber-500 transition-all duration-300 uppercase tracking-wider text-center">
                  Already a Member?
                </a>
              </div>
            </motion.div>
          </div>
        </div>
        <HoneyDrip flip={true} />

        {/* === LIVE ANIMATED HONEYCOMB GRID === */}
        <AnimatedHoneycombGrid />

        {/* === BLOG CHRONICLES SECTION === */}
        <BlogSection posts={blogPosts} onPostClick={handleOpenPost} />

        <motion.section 
          id="pricing" 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-20 md:py-28 bg-amber-500 text-white rounded-[3rem] md:rounded-[7rem] mx-6 md:mx-10 mb-20 relative overflow-hidden shadow-4xl border-[12px] md:border-[24px] border-white"
        >
          {/* Animated honeycomb bg in pricing */}
          <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='104' viewBox='0 0 60 104' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 17.32v34.64L30 69.28 0 51.96V17.32L30 0zM30 103.92l30-17.32v-34.64L30 34.64 0 51.96v34.64l30 17.32z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              backgroundSize: '60px 104px'
            }}
          />
          {/* Large corner cells */}
          <div className="absolute top-0 right-0 p-10 opacity-15 pointer-events-none">
            <Hexagon className="w-64 h-64 text-white stroke-[1]" />
          </div>
          <div className="absolute bottom-0 left-0 p-10 opacity-10 pointer-events-none">
            <Hexagon className="w-48 h-48 text-white stroke-[1]" />
          </div>
          <div className="max-w-7xl mx-auto px-6 md:px-10 text-center relative z-10">
            <div className="mb-12 space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}>
                    <Hexagon className="w-5 h-5 md:w-7 md:h-7 text-white/40 fill-white/10" />
                  </motion.div>
                ))}
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Choose Your <span className="text-slate-900">Cell.</span></h2>
              <p className="text-amber-100/80 font-semibold text-sm md:text-base">Scale your hive with precision — one cell at a time.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 text-left">
              {plans.map((plan, idx) => (
                <motion.div key={plan.id}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="bg-white rounded-[2rem] p-8 flex flex-col group relative overflow-hidden border-4 border-white/50 shadow-2xl"
                >
                  <div className="absolute -top-6 -right-6 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity">
                    <Hexagon className="w-28 h-28 text-slate-900 fill-slate-900" />
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${idx === 1 ? 'bg-amber-500' : 'bg-slate-100'}`}>
                      <Hexagon className={`w-5 h-5 ${idx === 1 ? 'text-white fill-white/20' : 'text-amber-500 fill-amber-500/10'}`} />
                    </div>
                    <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">{plan.name}</h4>
                  </div>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black text-slate-900">${Number(plan.price).toFixed(2)}</span>
                    <span className="text-slate-400 font-bold text-sm">/mo</span>
                  </div>
                  <div className="space-y-3 mb-8 flex-1 text-sm font-medium text-slate-500">
                    <div className="flex items-center gap-3"><Hexagon className="w-4 h-4 text-amber-500 fill-amber-500/15 flex-shrink-0" />{plan.max_websites} Active Cells</div>
                    <div className="flex items-center gap-3"><Hexagon className="w-4 h-4 text-amber-500 fill-amber-500/15 flex-shrink-0" />Neural AI {plan.ai_enabled ? 'Enabled' : 'Disabled'}</div>
                    <div className="flex items-center gap-3"><Hexagon className="w-4 h-4 text-amber-500 fill-amber-500/15 flex-shrink-0" />24/7 Hive Support</div>
                  </div>
                  <a href="/register" className={`w-full py-4 rounded-2xl font-black text-center text-sm transition-all duration-300 uppercase tracking-wider ${idx === 1 ? 'bg-amber-500 text-white hover:bg-slate-900' : 'bg-slate-900 text-white hover:bg-amber-500'}`}>
                    Join Cell
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* === PUBLIC CONTACT INQUIRY FORM === */}
        <ContactSection />
      </main>

      <footer className="py-16 md:py-24 border-t-4 border-amber-100 bg-slate-50/50 rounded-t-[3rem] md:rounded-t-[6rem] relative overflow-hidden">
        {/* Footer honeycomb tiles */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='70' viewBox='0 0 40 70' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l20 11.55v23.1L20 46.2 0 34.65V11.55L20 0z' fill='%23f59e0b' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 70px'
        }} />
        <div className="absolute bottom-0 left-0 p-10 opacity-10 pointer-events-none">
           <Hexagon className="w-48 h-48 text-amber-500 stroke-[2]" />
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
           <Hexagon className="w-64 h-64 text-amber-500 stroke-[1]" />
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <BrandLogo size="lg" />
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">
             <a href={platformSettings.help_center_url || "/help"} className="hover:text-amber-500 transition-all relative group">Support</a>
             <a href={`mailto:${platformSettings.support_email}`} className="hover:text-amber-500 transition-all relative group">Email</a>
             {platformSettings.support_phone && <a href={`tel:${platformSettings.support_phone}`} className="hover:text-amber-500 transition-all relative group">Call</a>}
             {platformSettings.support_whatsapp && <a href={platformSettings.support_whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-all relative group">Chat</a>}
             <button onClick={() => setLegalModal('privacy')} className="hover:text-amber-500 transition-all relative group text-left focus:outline-none">Privacy</button>
             <button onClick={() => setLegalModal('terms')} className="hover:text-amber-500 transition-all relative group text-left focus:outline-none">Terms</button>
          </div>
          <div className="flex flex-col items-center md:items-end gap-4 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">
            <span className="opacity-50">Colony Secured 🐝</span>
            <div className="flex items-center gap-3">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
                <Hexagon className="w-7 h-7 text-amber-500" />
              </motion.div>
              <Heart className="w-7 h-7 text-rose-500 fill-rose-500 animate-pulse" />
            </div>
          </div>
        </div>
      </footer>

      {/* Blog Post Detail Overlay */}
      <AnimatePresence>
        {activePost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
            onClick={handleClosePost}
          >
            <motion.div
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-4xl max-h-[85vh] bg-white rounded-[2.5rem] shadow-2xl border border-amber-100 overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header/Image */}
              <div className="relative h-64 md:h-80 w-full bg-amber-50 shrink-0 overflow-hidden">
                {activePost.image_url ? (
                  <img 
                    src={activePost.image_url} 
                    alt={activePost.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-400/20 to-amber-600/30 flex items-center justify-center">
                    <Hexagon className="w-24 h-24 text-amber-500/30 animate-pulse stroke-[1]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl">🐝</span>
                    </div>
                  </div>
                )}
                {/* Glassmorphic Dark Overlay for Close button */}
                <button 
                  onClick={handleClosePost}
                  className="absolute top-6 right-6 p-3 bg-slate-900/90 text-white rounded-2xl hover:bg-amber-500 hover:scale-105 transition-all shadow-xl z-10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content Scrollable Area */}
              <div className="p-8 md:p-12 overflow-y-auto flex-1 blog-content animate-fade-in">
                {/* Metadata */}
                <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                  <span className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full text-amber-600 border border-amber-100/50">
                    <User className="w-3 h-3 text-amber-500" />
                    {activePost.author || 'Bee Chat Team'}
                  </span>
                  <span className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full text-amber-600 border border-amber-100/50">
                    <Calendar className="w-3 h-3 text-amber-500" />
                    {new Date(activePost.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-6">
                  {activePost.title}
                </h1>

                {/* Divider */}
                <div className="h-1 w-20 bg-amber-500 rounded-full mb-8" />

                {/* HTML Content */}
                <div 
                  className="prose prose-amber max-w-none text-slate-600 font-medium text-base leading-relaxed space-y-6"
                  dangerouslySetInnerHTML={{ __html: activePost.content }}
                />
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <TopBee size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-900 uppercase">BeeChat Colony Hub</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">The Hive Intelligence</p>
                  </div>
                </div>
                <button 
                  onClick={handleClosePost}
                  className="bg-slate-900 hover:bg-amber-500 text-white text-[10px] font-black px-8 py-3 rounded-xl uppercase tracking-widest transition-all shadow-md"
                >
                  Close Reader
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {legalModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLegalModal(null)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
             <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }} className="relative w-full max-w-3xl h-[70vh] bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-amber-100/20">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                   <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">
                      {legalModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                   </h3>
                   <button onClick={() => setLegalModal(null)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all">
                      <X className="w-5 h-5" />
                   </button>
                </div>
                <div className="flex-1 overflow-y-auto p-10 font-bold text-slate-500 text-sm leading-relaxed whitespace-pre-wrap custom-scrollbar" dangerouslySetInnerHTML={{ __html: legalModal === 'privacy' ? (platformSettings.privacy_policy || 'Our privacy policy is being updated. Please check back later.') : (platformSettings.terms_of_service || 'Our terms of service are being updated. Please check back later.') }} />
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
