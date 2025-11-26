import React, { useState } from 'react';
import { UserProfile, RiskTolerance } from '../types';
import { ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight, Target, TrendingUp, Terminal, Play } from 'lucide-react';

interface AuthModalProps {
  onLogin: (user: UserProfile) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [risk, setRisk] = useState<RiskTolerance>('Balanced');
  const [goal, setGoal] = useState('Wealth Accumulation');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API Call
    setTimeout(() => {
      onLogin({
        name: name || 'DK Trader',
        email: email,
        riskTolerance: risk,
        goal: goal,
        balance: 100000, // Starting Paper Money
      });
      setLoading(false);
    }, 1500);
  };

  // --- AUTOMATION SCRIPT ---
  const executeLoginScript = () => {
    // 1. Reset State
    setIsLogin(true);
    setLoading(true);

    // 2. Simulate Input Automation
    const demoUser = {
        email: "admin_script@dkwealth.ai",
        pass: "superuser_auth_token_x99"
    };

    // Visual feedback of script typing
    setEmail(demoUser.email);
    setPassword(demoUser.pass);

    // 3. Execute Login logic after short delay
    setTimeout(() => {
        onLogin({
            name: "DK Auto Admin",
            email: demoUser.email,
            riskTolerance: 'Aggressive',
            goal: 'Market Domination',
            balance: 1000000, // VIP Balance
        });
        setLoading(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
      <div className="bg-market-card border border-slate-700 w-full max-w-md p-8 rounded-2xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Automation Trigger */}
        <button 
            onClick={executeLoginScript}
            title="Run Login Automation Script"
            className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-emerald-400 hover:bg-slate-700 hover:text-emerald-300 transition-all font-mono"
        >
            <Terminal size={10} />
            <span className="hidden sm:inline">AUTO_LOGIN.sh</span>
            <Play size={10} className="ml-1" />
        </button>

        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-market-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
             <ShieldCheck className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">DK Wealth Portal</h2>
          <p className="text-slate-400 text-sm">Personalized Financial Intelligence</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-market-accent outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 ml-1">Risk Tolerance</label>
                    <div className="relative">
                        <TrendingUp className="absolute left-3 top-3 text-slate-500" size={18} />
                        <select 
                            value={risk} 
                            onChange={(e) => setRisk(e.target.value as RiskTolerance)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-2 text-white text-xs focus:ring-2 focus:ring-market-accent outline-none appearance-none"
                        >
                            <option value="Conservative">Conservative</option>
                            <option value="Balanced">Balanced</option>
                            <option value="Aggressive">Aggressive</option>
                            <option value="Speculative">Speculative</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 ml-1">Primary Goal</label>
                    <div className="relative">
                        <Target className="absolute left-3 top-3 text-slate-500" size={18} />
                        <select 
                            value={goal} 
                            onChange={(e) => setGoal(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-2 text-white text-xs focus:ring-2 focus:ring-market-accent outline-none appearance-none"
                        >
                            <option value="Retirement">Retirement</option>
                            <option value="Short Term Gains">Short Term</option>
                            <option value="Income">Income</option>
                            <option value="Growth">Growth</option>
                        </select>
                    </div>
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs text-slate-400 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-market-accent outline-none transition-all"
                placeholder="trader@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-market-accent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-market-accent hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <span className="animate-pulse">Authenticating...</span>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Setup Profile'} <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm">
            {isLogin ? "New to investing?" : "Already have a profile?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-market-accent hover:underline font-medium"
            >
              {isLogin ? 'Create Profile' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;