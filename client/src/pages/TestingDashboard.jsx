import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle2, XCircle, Clock, Server, Terminal, Play, RotateCw } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function TestingDashboard() {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState({ passed: 0, failed: 0, apiLatency: 0, socketLatency: 0, health: 'Pending' });
  const [logs, setLogs] = useState(["[SYSTEM] Automated Testing Suite Connected to API"]);

  const fetchTests = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/tests.php?action=list`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTestResults(Array.isArray(res.data) ? res.data : []);
      
      // Update aggregate metrics
      if (res.data.length > 0) {
        const passed = res.data.filter(t => t.status === 'passed').length;
        const failed = res.data.filter(t => t.status !== 'passed').length;
        const avgLat = Math.round(res.data.reduce((acc, t) => acc + t.latency_ms, 0) / res.data.length);
        setMetrics(prev => ({
          ...prev,
          passed,
          failed,
          apiLatency: avgLat,
          health: failed > 0 ? 'Critical' : 'Optimal'
        }));
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchTests();
    const t = setInterval(fetchTests, 10000);
    return () => clearInterval(t);
  }, []);

  const runTests = async (type) => {
    setIsRunning(true);
    setLogs(prev => [...prev, `[TRIGGER] Running real-time ${type} diagnostics...`]);
    try {
      const res = await axios.get(`${API_BASE_URL}/tests.php?action=run&type=${type}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchTests();
      setLogs(prev => [...prev, `[SUCCESS] ${res.data.results.length} tests executed successfully.`]);
    } catch (err) {
      setLogs(prev => [...prev, `[ERROR] Testing suite failed to execute.`]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Automated Testing Center</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">CI/CD Pipeline Monitor</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => runTests('API')} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-amber-500 transition-all">
            <Play className="w-4 h-4" /> Run API Tests
          </button>
          <button onClick={() => runTests('E2E')} className="px-6 py-3 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-900 transition-all">
            <Play className="w-4 h-4" /> Run E2E Tests
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div className="glass p-6 rounded-3xl border border-white shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center"><CheckCircle2 className="w-6 h-6" /></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Passed</p><p className="text-2xl font-black text-slate-900">{metrics.passed}</p></div>
        </motion.div>
        <motion.div className="glass p-6 rounded-3xl border border-white shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center"><XCircle className="w-6 h-6" /></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Failed</p><p className="text-2xl font-black text-slate-900">{metrics.failed}</p></div>
        </motion.div>
        <motion.div className="glass p-6 rounded-3xl border border-white shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center"><Clock className="w-6 h-6" /></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">API Latency</p><p className="text-2xl font-black text-slate-900">{metrics.apiLatency}ms</p></div>
        </motion.div>
        <motion.div className="glass p-6 rounded-3xl border border-white shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center"><Activity className="w-6 h-6" /></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Socket Latency</p><p className="text-2xl font-black text-slate-900">{metrics.socketLatency}ms</p></div>
        </motion.div>
        <motion.div className="glass p-6 rounded-3xl border border-white shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center"><Server className="w-6 h-6" /></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Server Health</p><p className="text-2xl font-black text-emerald-500">{metrics.health}</p></div>
        </motion.div>
      </div>

      <div className="glass p-8 rounded-[3rem] border border-white shadow-xl overflow-hidden">
         <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-6 flex items-center gap-3">
            <Activity className="w-6 h-6 text-amber-500" /> Real-Time Health Check
         </h3>
         <table className="w-full text-left">
            <thead>
               <tr className="border-b border-slate-50">
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnostic Test</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Latency</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Report</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {testResults.map((test, i) => (
                  <tr key={i} className="group hover:bg-slate-50/50 transition-all">
                     <td className="py-4 font-bold text-slate-900 text-sm">{test.test_name}</td>
                     <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${test.status === 'passed' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                           {test.status}
                        </span>
                     </td>
                     <td className="py-4 text-xs font-mono text-slate-400">{test.latency_ms}ms</td>
                     <td className="py-4 text-xs text-slate-500 font-medium">{test.message}</td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      <div className="glass p-8 rounded-[3rem] border border-white shadow-xl bg-slate-900 text-green-400 font-mono text-xs overflow-hidden relative">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4 text-white font-sans">
           <Terminal className="w-5 h-5 text-amber-500" /> <span className="font-black uppercase tracking-widest text-[10px]">Live Test Console</span>
           {isRunning && <RotateCw className="w-4 h-4 ml-auto animate-spin text-amber-500" />}
        </div>
        <div className="space-y-2 h-64 overflow-y-auto">
          {logs.map((log, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="opacity-80">
              <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span> {log}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
