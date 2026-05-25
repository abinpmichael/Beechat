import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, Sliders, 
  RotateCcw, Sparkles, Target, FileText, Copy, Check, Info, HelpCircle
} from 'lucide-react';

const DEFAULT_SCENES = [
  {
    id: 1,
    title: 'Support Costs Stinging Your Business?',
    script: "Tired of bloated customer support bills eating away your startup's profits?",
    duration: 5000,
    visualType: 'hook'
  },
  {
    id: 2,
    title: 'Meet Bee Chat Pro 🐝',
    script: 'Meet Bee Chat Pro. The premium, affordable AI customer support widget.',
    duration: 7000,
    visualType: 'intro'
  },
  {
    id: 3,
    title: '24/7 AI Autopilot',
    script: 'Train your AI assistant on your documentation in seconds to answer eighty percent of support queries instantly.',
    duration: 6000,
    visualType: 'autopilot',
    chatData: {
      user: 'Is there a free trial?',
      bot: 'Yes! Sign up today on beechat.online to claim your 14-day premium trial cell! 🍯'
    }
  },
  {
    id: 4,
    title: 'Real-Time Agent Handover',
    script: 'And when complex issues arise? Handover to live human agents seamlessly in real time.',
    duration: 6000,
    visualType: 'handover'
  },
  {
    id: 5,
    title: 'BEE CHAT PRO: Scale Your Support Hive',
    script: 'Get premium chat, AI bots, and tickets starting at a fraction of the cost. Start your free trial today at bee chat dot online!',
    duration: 6000,
    visualType: 'outro'
  }
];

export default function VideoAdSimulator({ embedded = false }) {
  const [scenes, setScenes] = useState(DEFAULT_SCENES);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoiceIdx, setSelectedVoiceIdx] = useState(0);
  const [speechRate, setSpeechRate] = useState(1.05);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeSettingsTab, setActiveSettingsTab] = useState('editor');

  const synthRef = useRef(window.speechSynthesis);
  const playTimeoutRef = useRef(null);
  const currentUtteranceRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedOffsetRef = useRef(0);
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  const requestRef = useRef(null);

  // Soundwave states
  const [soundwaveHeights, setSoundwaveHeights] = useState(new Array(15).fill(4));
  const waveIntervalRef = useRef(null);

  const totalDuration = scenes.reduce((acc, s) => acc + s.duration, 0);

  // Load available speech synthesis voices
  useEffect(() => {
    const loadVoices = () => {
      if (!synthRef.current) return;
      const allVoices = synthRef.current.getVoices();
      const englishVoices = allVoices.filter(v => v.lang.toLowerCase().includes('en'));
      setVoices(englishVoices.length > 0 ? englishVoices : allVoices);
    };

    loadVoices();
    if (synthRef.current && synthRef.current.onvoiceschanged !== undefined) {
      synthRef.current.onvoiceschanged = loadVoices;
    }

    return () => {
      if (synthRef.current) synthRef.current.cancel();
      clearTimeout(playTimeoutRef.current);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Control the soundwave animation during speech
  useEffect(() => {
    if (isPlaying) {
      waveIntervalRef.current = setInterval(() => {
        setSoundwaveHeights(prev => 
          prev.map(() => Math.floor(Math.random() * 26) + 4)
        );
      }, 100);
    } else {
      clearInterval(waveIntervalRef.current);
      setSoundwaveHeights(new Array(15).fill(4));
    }
    return () => clearInterval(waveIntervalRef.current);
  }, [isPlaying]);

  // Synchronized timelines via requestAnimationFrame
  const updateProgress = () => {
    if (!isPlaying || startTimeRef.current === null) return;
    
    const now = Date.now();
    const elapsed = now - startTimeRef.current + elapsedOffsetRef.current;
    
    if (elapsed >= totalDuration) {
      // Loop or stop
      handleReset();
      return;
    }

    // Determine current scene based on elapsed time
    let acc = 0;
    let targetIdx = 0;
    for (let i = 0; i < scenes.length; i++) {
      acc += scenes[i].duration;
      if (elapsed < acc) {
        targetIdx = i;
        break;
      }
    }

    setProgressBarWidth((elapsed / totalDuration) * 100);

    if (targetIdx !== currentIdx) {
      setCurrentIdx(targetIdx);
      speakVoice(scenes[targetIdx].script);
    }

    requestRef.current = requestAnimationFrame(updateProgress);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(updateProgress);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, currentIdx, scenes]);

  const speakVoice = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (voices[selectedVoiceIdx]) {
      utterance.voice = voices[selectedVoiceIdx];
    }
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    
    utterance.onend = () => {
      // Hold soundwaves still once speech ends
      clearInterval(waveIntervalRef.current);
      setSoundwaveHeights(new Array(15).fill(4));
    };

    currentUtteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      // Pause
      setIsPlaying(false);
      if (synthRef.current) synthRef.current.cancel();
      cancelAnimationFrame(requestRef.current);
      
      // Save current elapsed offset
      if (startTimeRef.current !== null) {
        elapsedOffsetRef.current += Date.now() - startTimeRef.current;
      }
    } else {
      // Play
      setIsPlaying(true);
      startTimeRef.current = Date.now();
      
      // Speak current scene
      speakVoice(scenes[currentIdx].script);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    if (synthRef.current) synthRef.current.cancel();
    cancelAnimationFrame(requestRef.current);
    setCurrentIdx(0);
    setProgressBarWidth(0);
    elapsedOffsetRef.current = 0;
    startTimeRef.current = null;
  };

  const handleNext = () => {
    if (currentIdx < scenes.length - 1) {
      const nextIdx = currentIdx + 1;
      let precedingSum = scenes.slice(0, nextIdx).reduce((acc, s) => acc + s.duration, 0);
      elapsedOffsetRef.current = precedingSum;
      startTimeRef.current = Date.now();
      setCurrentIdx(nextIdx);
      setProgressBarWidth((precedingSum / totalDuration) * 100);
      if (isPlaying) {
        speakVoice(scenes[nextIdx].script);
      }
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      const prevIdx = currentIdx - 1;
      let precedingSum = scenes.slice(0, prevIdx).reduce((acc, s) => acc + s.duration, 0);
      elapsedOffsetRef.current = precedingSum;
      startTimeRef.current = Date.now();
      setCurrentIdx(prevIdx);
      setProgressBarWidth((precedingSum / totalDuration) * 100);
      if (isPlaying) {
        speakVoice(scenes[prevIdx].script);
      }
    }
  };

  const handleTimelineSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = clickX / rect.width;
    const targetTime = pct * totalDuration;

    let acc = 0;
    let targetIdx = 0;
    for (let i = 0; i < scenes.length; i++) {
      acc += scenes[i].duration;
      if (targetTime <= acc) {
        targetIdx = i;
        break;
      }
    }

    elapsedOffsetRef.current = targetTime;
    startTimeRef.current = Date.now();
    setCurrentIdx(targetIdx);
    setProgressBarWidth(pct * 100);
    
    if (isPlaying) {
      speakVoice(scenes[targetIdx].script);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const updateSceneField = (index, field, value) => {
    const updated = [...scenes];
    if (field === 'duration') {
      updated[index][field] = Math.max(1000, parseInt(value) || 1000);
    } else {
      updated[index][field] = value;
    }
    setScenes(updated);
  };

  const resetToDefaults = () => {
    setScenes(JSON.parse(JSON.stringify(DEFAULT_SCENES)));
    handleReset();
  };

  // Scene visual rendering logic
  const renderVisuals = () => {
    const activeScene = scenes[currentIdx];

    switch (activeScene.visualType) {
      case 'hook':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-red-950 via-slate-900 to-slate-950">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm glass p-6 rounded-[2rem] border border-red-500/20 shadow-2xl relative overflow-hidden bg-slate-900/60"
            >
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-500 px-2.5 py-1 bg-red-500/10 rounded-full border border-red-500/20">Critical Alert</span>
                <span className="text-slate-500 text-[10px] font-bold">LIVETIME BILLING</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-black text-slate-300 mb-1">
                    <span>CUSTOMER SUPPORT FEES</span>
                    <span className="text-red-500">+350% STING</span>
                  </div>
                  <div className="h-4 bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <motion.div 
                      initial={{ width: "20%" }}
                      animate={{ width: "95%" }}
                      transition={{ duration: 3.5 }}
                      className="h-full bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <div className="w-10 h-10 bg-red-500/15 rounded-xl flex items-center justify-center text-red-500">😭</div>
                  <p className="text-[11px] text-slate-400 font-bold leading-snug">Bloated agent billing modules, offline chats, and idle hourly slots stinging profits.</p>
                </div>
              </div>
            </motion.div>
          </div>
        );

      case 'intro':
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full h-full p-4 flex items-center justify-center"
            >
              <img 
                src="/video_ad_storyboard.png" 
                alt="Bee Chat Pro Mascot and interface representation"
                className="w-full h-full object-contain rounded-2xl shadow-inner border border-white/5 bg-slate-950/40"
              />
            </motion.div>
          </div>
        );

      case 'autopilot':
        const chatData = activeScene.chatData || DEFAULT_SCENES[2].chatData;
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-100 flex flex-col h-[280px]">
              {/* Widget Header */}
              <div className="bg-slate-900 p-4 flex items-center gap-3 text-white">
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-lg">🐝</div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider">Bee Autopilot</h4>
                  <p className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" /> Active
                  </p>
                </div>
              </div>
              {/* Widget Body */}
              <div className="p-4 flex-1 flex flex-col justify-end gap-3 bg-slate-50 text-left font-sans">
                {/* User Bubble */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-200 text-slate-800 p-3 rounded-2xl rounded-bl-none text-xs font-semibold max-w-[80%]"
                >
                  {chatData.user}
                </motion.div>

                {/* Bot Typing / Bubble */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5 }}
                  className="bg-amber-500 text-white p-3 rounded-2xl rounded-br-none text-xs font-bold max-w-[85%] ml-auto"
                >
                  {chatData.bot}
                </motion.div>
              </div>
            </div>
          </div>
        );

      case 'handover':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md bg-slate-950 rounded-2xl border border-white/10 shadow-2xl overflow-hidden font-mono text-left"
            >
              <div className="bg-slate-900 px-4 py-2 border-b border-white/5 flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-[10px] text-slate-500 font-bold ml-auto tracking-widest uppercase">SOCKET_LIVESTAGE</span>
              </div>
              <div className="p-5 text-[11px] space-y-2 text-slate-400">
                <p className="text-slate-600">// Handover Sequence Initiated</p>
                <p>&gt; Initializing real-time websocket handshakes...</p>
                <p className="text-yellow-500 font-bold animate-pulse">&gt; WARNING: Escalated question detected in cell #318</p>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                  className="text-emerald-400 font-bold"
                >
                  &gt; CONNECTED: Support Agent 'Queen Bee' has joined the room.
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.8 }}
                  className="text-slate-300"
                >
                  &gt; "Hello! Let me review your custom integration setup..."
                </motion.p>
              </div>
            </motion.div>
          </div>
        );

      case 'outro':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-amber-950 via-slate-950 to-black text-center relative overflow-hidden">
            {/* Background glowing gradient */}
            <div className="absolute w-[200px] h-[200px] bg-amber-500/20 blur-[80px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10" />
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-6 z-10"
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl animate-bounce">🐝</span>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-white">
                  BEE CHAT <span className="text-amber-500">PRO</span>
                </h2>
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Scale Your Support Hive Seamlessly</p>
              
              <div className="pt-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{ 
                    boxShadow: ["0 0 0px rgba(245,158,11,0)", "0 0 20px rgba(245,158,11,0.6)", "0 0 0px rgba(245,158,11,0)"]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="px-8 py-4 bg-amber-500 text-white font-black uppercase text-sm tracking-wider rounded-2xl shadow-xl"
                  onClick={() => window.open('https://www.beechat.online', '_blank')}
                >
                  Start Free Trial
                </motion.button>
              </div>
              
              <p className="font-mono text-xs text-amber-500 font-bold pt-2">www.beechat.online</p>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`w-full min-h-screen text-slate-100 flex flex-col bg-slate-950 ${embedded ? 'p-0' : 'p-6 md:p-10'}`}>
      
      {!embedded && (
        <div className="max-w-7xl mx-auto w-full mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase text-white flex items-center gap-3">
              <span className="text-amber-500">🎬</span> Video Ad Hub
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">
              Google Video Ads Campaign Simulator & Customizer for Bee Chat Pro
            </p>
          </div>
          <button 
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 border border-white/10 hover:border-amber-500/50 rounded-2xl text-xs font-bold transition-all uppercase tracking-wider text-slate-300 hover:text-white"
          >
            <RotateCcw className="w-4 h-4" /> Reset Storyboard
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: PLAYER */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/60 border border-white/5 rounded-[2.5rem] p-4 md:p-6 shadow-2xl relative overflow-hidden">
            {/* Inner Glow Border */}
            <div className="absolute inset-0 border border-white/10 rounded-[2.5rem] pointer-events-none -z-10" />

            {/* Video Canvas viewport */}
            <div className="relative aspect-video w-full bg-black rounded-[2rem] overflow-hidden shadow-inner border border-white/5">
              {renderVisuals()}
              
              {/* Scene on-screen text subtitle bar */}
              <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
                <span className="px-4 py-1.5 rounded-full bg-black/60 border border-white/10 text-[11px] font-black text-amber-500 tracking-wider uppercase backdrop-blur-md">
                  SCENE {currentIdx + 1}/{scenes.length}
                </span>
                <span className="px-4 py-1.5 rounded-full bg-black/60 border border-white/10 text-[10px] font-bold text-slate-400 tracking-wider uppercase backdrop-blur-md">
                  {Math.round(scenes[currentIdx].duration / 1000)}s
                </span>
              </div>

              {/* Glowing subtitle banner */}
              <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-center">
                <div className="px-6 py-3 rounded-2xl bg-black/75 border border-white/10 text-center backdrop-blur-md shadow-2xl max-w-[85%]">
                  <p className="text-xs md:text-sm font-black text-white leading-snug tracking-wide uppercase">
                    {scenes[currentIdx].title}
                  </p>
                </div>
              </div>
            </div>

            {/* Timelines and controls */}
            <div className="mt-6 space-y-5">
              {/* Dynamic waveform visualizer */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-slate-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">VOICEOVER STREAM</span>
                </div>
                {/* Visualizer Wave */}
                <div className="flex items-end gap-[3px] h-6 px-3 py-1 bg-black/20 rounded-full">
                  {soundwaveHeights.map((h, i) => (
                    <motion.div 
                      key={i} 
                      animate={{ height: h }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                      className="w-[2px] bg-amber-500 rounded-full" 
                    />
                  ))}
                </div>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1.5">
                <div 
                  className="h-2 bg-slate-800 rounded-full cursor-pointer relative overflow-hidden"
                  onClick={handleTimelineSeek}
                >
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-75"
                    style={{ width: `${progressBarWidth}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-500">
                  <span>{((totalDuration * (progressBarWidth / 100)) / 1000).toFixed(1)}s</span>
                  <span>{(totalDuration / 1000).toFixed(1)}s</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handlePrev}
                    disabled={currentIdx === 0}
                    className="p-3 bg-slate-850 hover:bg-slate-800 rounded-full border border-white/5 text-slate-400 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handlePlayPause}
                    className="p-5 bg-white text-slate-950 hover:bg-amber-500 hover:text-white rounded-full shadow-lg transition-all transform hover:scale-105"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>
                  <button 
                    onClick={handleNext}
                    disabled={currentIdx === scenes.length - 1}
                    className="p-3 bg-slate-850 hover:bg-slate-800 rounded-full border border-white/5 text-slate-400 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Voice Selection */}
                <div className="flex items-center gap-3 flex-1 max-w-[280px]">
                  <Sliders className="w-4 h-4 text-slate-500 shrink-0" />
                  <select 
                    value={selectedVoiceIdx}
                    onChange={(e) => setSelectedVoiceIdx(parseInt(e.target.value))}
                    className="w-full bg-slate-850 border border-white/10 text-white rounded-xl py-2 px-3 text-[11px] font-bold outline-none focus:border-amber-500 tracking-wider uppercase"
                  >
                    {voices.map((v, i) => (
                      <option key={i} value={i}>{v.name} ({v.lang})</option>
                    ))}
                    {voices.length === 0 && <option value={0}>Default Browser Voice</option>}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Voice Tuning sliders */}
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black tracking-widest text-slate-400 uppercase">
                <span>Speech Speed</span>
                <span className="text-amber-500">{speechRate}x</span>
              </div>
              <input 
                type="range" min="0.6" max="1.8" step="0.05"
                value={speechRate} onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 rounded-lg appearance-none h-1"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black tracking-widest text-slate-400 uppercase">
                <span>Voice Pitch</span>
                <span className="text-amber-500">{speechPitch}</span>
              </div>
              <input 
                type="range" min="0.5" max="1.5" step="0.05"
                value={speechPitch} onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 rounded-lg appearance-none h-1"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: EDITOR & GOOGLE ADS CONFIG */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex gap-2 p-1.5 bg-slate-900 border border-white/5 rounded-2xl">
            <button 
              onClick={() => setActiveSettingsTab('editor')}
              className={`flex-1 py-3 text-center rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeSettingsTab === 'editor' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Storyboard Editor
            </button>
            <button 
              onClick={() => setActiveSettingsTab('ads')}
              className={`flex-1 py-3 text-center rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeSettingsTab === 'ads' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <Target className="w-3.5 h-3.5" /> Google Ads Helper
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeSettingsTab === 'editor' ? (
              <motion.div 
                key="editor"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-5"
              >
                <div className="bg-slate-900/60 border border-white/5 rounded-[2rem] p-6 space-y-5">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Info className="w-4 h-4 text-amber-500" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">Configure scene text overlays and voiceover logs</p>
                  </div>

                  <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                    {scenes.map((scene, idx) => (
                      <div 
                        key={scene.id} 
                        className={`p-4 rounded-2xl border transition-all ${currentIdx === idx ? 'bg-amber-500/5 border-amber-500/30' : 'bg-slate-950/40 border-white/5'}`}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${currentIdx === idx ? 'text-amber-500' : 'text-slate-500'}`}>
                            Scene {idx + 1} - {scene.visualType.toUpperCase()}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-slate-500">Duration (ms)</span>
                            <input 
                              type="number"
                              value={scene.duration}
                              onChange={(e) => updateSceneField(idx, 'duration', e.target.value)}
                              className="w-16 bg-slate-900 border border-white/10 rounded-lg px-2 py-0.5 text-center text-xs text-white font-bold outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Overlay Title</label>
                            <input 
                              type="text"
                              value={scene.title}
                              onChange={(e) => updateSceneField(idx, 'title', e.target.value)}
                              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-semibold outline-none focus:border-amber-500"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Voiceover Script</label>
                            <textarea 
                              value={scene.script}
                              onChange={(e) => updateSceneField(idx, 'script', e.target.value)}
                              rows="2"
                              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-semibold outline-none focus:border-amber-500 resize-none leading-relaxed"
                            />
                          </div>

                          {scene.visualType === 'autopilot' && (
                            <div className="grid grid-cols-2 gap-3 pt-1">
                              <div>
                                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Client Query</label>
                                <input 
                                  type="text"
                                  value={scene.chatData?.user || ''}
                                  onChange={(e) => updateSceneField(idx, 'chatData', { ...scene.chatData, user: e.target.value })}
                                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-white outline-none focus:border-amber-500"
                                />
                              </div>
                              <div>
                                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Bot Reply</label>
                                <input 
                                  type="text"
                                  value={scene.chatData?.bot || ''}
                                  onChange={(e) => updateSceneField(idx, 'chatData', { ...scene.chatData, bot: e.target.value })}
                                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-white outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="ads"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-5"
              >
                <div className="bg-slate-900/60 border border-white/5 rounded-[2rem] p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                      <Target className="w-4 h-4 text-amber-500" /> Google Ads Configurations
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      Optimized parameters to configure your campaigns in Google Ads
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        title: 'Audience Segments & Demographics',
                        value: 'In-Market: Customer Service Software, Live Chat Software, Web Design & Development.\nAffinity: Startups & Entrepreneurs, Technology & Business Professionals.\nDemographics: Ages 22–45.'
                      },
                      {
                        title: 'Keyword Strategy',
                        value: 'intercom alternative, affordable customer support bot, best live chat widget, website chatbot software'
                      },
                      {
                        title: 'Headline Strategy',
                        value: 'Short Headline (15 Char): Bee Chat Pro\nLong Headline (90 Char): Affordable AI Support Chat & Live Agent Handover for Startups'
                      },
                      {
                        title: 'Ad Description Copy',
                        value: 'Train AI on your docs in seconds. Automate FAQs & route complex chats to live agents.'
                      }
                    ].map((item, index) => (
                      <div key={index} className="bg-slate-950/60 border border-white/5 rounded-2xl p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{item.title}</span>
                          <button 
                            onClick={() => copyToClipboard(item.value, index)}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
                            title="Copy setup content"
                          >
                            {copiedIndex === index ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <pre className="font-mono text-[10px] text-slate-400 whitespace-pre-wrap leading-relaxed">
                          {item.value}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
