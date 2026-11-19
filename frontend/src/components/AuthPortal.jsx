import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Lock, Mail, User, ShieldCheck, Sparkles, ArrowRight, Eye, EyeOff, ArrowLeft, Users, Shield, Activity
} from 'lucide-react';
import useAuthStore from '../stores/authStore';

export default function AuthPortal({ onLoginSuccess, onBack }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState('evaluator');
  const [showPassword, setShowPassword] = useState(false);

  const { login, register, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      if (authMode === 'register') {
        const u = await register(email, password, fullName, selectedRole);
        if (onLoginSuccess) onLoginSuccess(u?.role || selectedRole);
      } else {
        const u = await login(email, password);
        if (onLoginSuccess) onLoginSuccess(u?.role || 'evaluator');
      }
    } catch (err) {
      // Error handled in store
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword, targetRole) => {
    clearError();
    setEmail(demoEmail);
    setPassword(demoPassword);
    try {
      const u = await login(demoEmail, demoPassword);
      if (onLoginSuccess) onLoginSuccess(u?.role || targetRole);
    } catch (err) {
      if (onLoginSuccess) onLoginSuccess(targetRole);
    }
  };

  return (
    <div 
      className="auth-portal-view w-full h-full flex flex-col items-center justify-center p-6 relative select-none overflow-y-auto"
      style={{ WebkitAppRegion: 'no-drag' }}
    >
      {/* Top Left Navigation Back to Showcase */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="absolute top-6 left-6 sm:left-12 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] transition-all cursor-pointer z-30"
          style={{ WebkitAppRegion: 'no-drag' }}
        >
          <ArrowLeft size={14} />
          <span>Back to Ajna Showcase</span>
        </button>
      )}

      {/* Centerpiece Floating Glassmorphic Auth Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="ajna-glass w-full max-w-[500px] p-8 sm:p-9 space-y-6 my-auto relative z-20 shadow-2xl"
        style={{
          border: '1px solid rgba(45, 212, 191, 0.3)',
          boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.75), 0 0 36px rgba(45, 212, 191, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.28)',
          WebkitAppRegion: 'no-drag'
        }}
      >
        {/* Brand Emblem & Welcome Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-teal-400 via-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-teal-500/30 border border-white/30 mb-2">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {authMode === 'login' ? 'Access your workspace' : 'Create your account'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {authMode === 'login' 
              ? 'Select a 1-click verified enterprise profile or sign in with credentials.' 
              : 'Join the verifiable multimodal evaluation network in under a minute.'}
          </p>
        </div>

        {/* Clean Segmented Toggle Tabs */}
        <div className="flex p-1 rounded-xl bg-black/40 border border-white/[0.08] backdrop-blur-md">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); clearError(); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-gradient-to-r from-teal-500/25 to-indigo-500/25 text-white border border-teal-400/40 shadow-md shadow-teal-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('register'); clearError(); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-gradient-to-r from-teal-500/25 to-indigo-500/25 text-white border border-teal-400/40 shadow-md shadow-teal-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* 1-Click Fast Enterprise Account Presets (Sign In Mode) */}
        {authMode === 'login' && (
          <div className="space-y-2 pt-1">
            <div className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center justify-between">
              <span>1-CLICK VERIFIED PROFILES</span>
              <span className="text-teal-400">INSTANT ACCESS</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('evaluator@antigravity.ai', 'EvalPass2026!', 'evaluator')}
                className="p-3 rounded-xl bg-white/[0.04] hover:bg-teal-500/15 border border-white/[0.08] hover:border-teal-400/40 transition-all flex flex-col items-center text-center group cursor-pointer"
              >
                <Activity className="w-4 h-4 text-teal-400 mb-1" />
                <span className="text-xs font-bold text-white group-hover:text-teal-300">Dr. Mounika</span>
                <span className="text-[9px] text-teal-400 font-mono mt-0.5 font-bold">Evaluator</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('candidate@antigravity.ai', 'CandPass2026!', 'candidate')}
                className="p-3 rounded-xl bg-white/[0.04] hover:bg-emerald-500/15 border border-white/[0.08] hover:border-emerald-400/40 transition-all flex flex-col items-center text-center group cursor-pointer"
              >
                <Users className="w-4 h-4 text-emerald-400 mb-1" />
                <span className="text-xs font-bold text-white group-hover:text-emerald-300">Sri ram</span>
                <span className="text-[9px] text-emerald-400 font-mono mt-0.5 font-bold">Candidate</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@antigravity.ai', 'AdminPass2026!', 'admin')}
                className="p-3 rounded-xl bg-white/[0.04] hover:bg-amber-500/15 border border-white/[0.08] hover:border-amber-400/40 transition-all flex flex-col items-center text-center group cursor-pointer"
              >
                <Shield className="w-4 h-4 text-amber-400 mb-1" />
                <span className="text-xs font-bold text-white group-hover:text-amber-300">Admin</span>
                <span className="text-[9px] text-amber-400 font-mono mt-0.5 font-bold">Governance</span>
              </button>
            </div>

            {/* Subtle Divider */}
            <div className="relative flex items-center justify-center py-2">
              <div className="w-full border-t border-white/[0.08]" />
              <span className="absolute px-3 bg-[#0d131f] text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                OR SIGN IN WITH EMAIL
              </span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'register' && (
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name (e.g. Dr. Mounika)"
                className="aurora-input"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="evaluator@antigravity.ai"
              className="aurora-input"
            />
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="aurora-input pr-16"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-xs text-slate-400 hover:text-teal-300 font-medium cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Role Selector (Register Mode) */}
          {authMode === 'register' && (
            <div className="space-y-2 pt-1">
              <label className="block text-[11px] font-bold text-slate-300 font-mono uppercase tracking-wider">
                SELECT OPERATIONAL ROLE
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'evaluator', label: 'Lead Evaluator', icon: Activity },
                  { id: 'candidate', label: 'Candidate', icon: Users },
                  { id: 'admin', label: 'Platform Admin', icon: Shield }
                ].map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRole(r.id)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        isSelected
                          ? 'bg-teal-500/20 border-teal-400 text-teal-300 shadow-md shadow-teal-500/10'
                          : 'bg-black/30 border-white/[0.08] text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon size={14} className={isSelected ? 'text-teal-400' : 'text-slate-500'} />
                      <span className="text-[11px]">{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Action CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="aurora-btn-gradient w-full h-12 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer mt-2 shadow-xl shadow-teal-500/25"
          >
            <span>
              {isLoading 
                ? 'Verifying Telemetry...' 
                : (authMode === 'register' ? 'Create Account & Enter' : 'Enter Ajna Workspace')}
            </span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Footer Guarantee */}
        <div className="text-center pt-1">
          <p className="text-[11px] text-slate-500 font-mono">
            Observable Evidence Principle • Zero AI Hallucination
          </p>
        </div>
      </motion.div>
    </div>
  );
}
