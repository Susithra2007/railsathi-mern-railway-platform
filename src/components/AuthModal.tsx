import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Train,
  Briefcase,
  Key,
  Sparkles,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'LOGIN' | 'REGISTER' | 'FORGOT';
  initialRole?: 'PASSENGER' | 'ADMIN';
  onLoginSuccess?: (role: 'PASSENGER' | 'ADMIN') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'LOGIN',
  initialRole = 'PASSENGER',
  onLoginSuccess,
}) => {
  const { login, register, forgotPassword } = useAuth();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<'PASSENGER' | 'ADMIN'>(initialRole);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setSelectedRole(initialRole);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialMode, initialRole]);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('Station Superintendent');
  const [adminPasscode, setAdminPasscode] = useState('RAILADMIN2026');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setError(null);
    setSuccessMsg(null);
  };

  const handleModeSwitch = (newMode: 'LOGIN' | 'REGISTER' | 'FORGOT') => {
    setMode(newMode);
    resetForm();
  };

  const handleRoleSwitch = (role: 'PASSENGER' | 'ADMIN') => {
    setSelectedRole(role);
    resetForm();
    if (mode === 'LOGIN') {
      if (role === 'ADMIN') {
        setEmail('admin@rail.in');
        setPassword('admin123');
      } else {
        setEmail('passenger@rail.in');
        setPassword('pass123');
      }
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email.trim(), password);
      setSuccessMsg(`Login successful as ${selectedRole === 'ADMIN' ? 'Railway Admin' : 'Passenger'}!`);
      if (onLoginSuccess) {
        onLoginSuccess(selectedRole);
      }
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials or create a new account.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name as per Government / Railway ID.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (selectedRole === 'ADMIN') {
      if (!adminPasscode.trim()) {
        setError('Admin Authorization Code is required (default: RAILADMIN2026).');
        return;
      }
    } else {
      if (!termsAccepted) {
        setError('Please accept the railway travel terms and conditions.');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      await register(
        name.trim(),
        email.trim(),
        password,
        phone.trim() || (selectedRole === 'ADMIN' ? '+91 98111 22334' : '+91 98765 00000'),
        confirmPassword,
        selectedRole,
        selectedRole === 'ADMIN' ? designation.trim() : undefined,
        selectedRole === 'ADMIN' ? adminPasscode.trim() : undefined
      );

      setSuccessMsg(
        selectedRole === 'ADMIN'
          ? 'Railway Administrator account registered successfully! Admin console unlocked.'
          : 'Passenger account created successfully! Welcome to RailSathi.'
      );

      if (onLoginSuccess) {
        onLoginSuccess(selectedRole);
      }

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. An account with this email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resetPass = selectedRole === 'ADMIN' ? 'admin123' : 'pass123';
      const msg = await forgotPassword(email.trim(), resetPass);
      setSuccessMsg(msg);
      setPassword(resetPass);
      setTimeout(() => {
        setMode('LOGIN');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Password reset request failed.');
    } finally {
      setLoading(false);
    }
  };

  const executeOneClickLogin = async (role: 'PASSENGER' | 'ADMIN') => {
    setSelectedRole(role);
    setLoading(true);
    setError(null);
    try {
      if (role === 'ADMIN') {
        setEmail('admin@rail.in');
        setPassword('admin123');
        await login('admin@rail.in', 'admin123');
      } else {
        setEmail('passenger@rail.in');
        setPassword('pass123');
        await login('passenger@rail.in', 'pass123');
      }
      setSuccessMsg(`Logged in successfully as ${role === 'ADMIN' ? 'Railway Admin' : 'Passenger'}!`);
      if (onLoginSuccess) {
        onLoginSuccess(role);
      }
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try manual sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-6 animate-scale-in">
        {/* Header */}
        <div className={`p-5 text-white flex items-center justify-between border-b ${
          selectedRole === 'ADMIN' ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${
              selectedRole === 'ADMIN' ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'
            }`}>
              {selectedRole === 'ADMIN' ? <ShieldCheck className="w-5 h-5" /> : <Train className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                {mode === 'LOGIN' && (selectedRole === 'ADMIN' ? 'Railway Admin Sign In' : 'Passenger Sign In')}
                {mode === 'REGISTER' && (selectedRole === 'ADMIN' ? 'Register Railway Admin' : 'Register New Passenger')}
                {mode === 'FORGOT' && 'Reset Account Password'}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-semibold ${
                  selectedRole === 'ADMIN' ? 'bg-amber-400 text-slate-950' : 'bg-blue-900 text-blue-200'
                }`}>
                  {selectedRole}
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {selectedRole === 'ADMIN'
                  ? 'Official Administrative & Fleet Control Portal'
                  : 'RailSathi Passenger Portal · Secure Authentication'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Tabs (Passenger vs Railway Admin) */}
        <div className="p-3 bg-slate-100 border-b border-slate-200">
          <div className="text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center justify-between">
            <span>Select Account Type / Role</span>
            <span className="text-[10px] text-slate-400 font-normal">பயணி அல்லது நிர்வாகி</span>
          </div>
          <div className="grid grid-cols-2 gap-2 bg-slate-200/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleRoleSwitch('PASSENGER')}
              className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                selectedRole === 'PASSENGER'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Train className={`w-4 h-4 ${selectedRole === 'PASSENGER' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Passenger (பயணி)</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch('ADMIN')}
              className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                selectedRole === 'ADMIN'
                  ? 'bg-slate-900 text-amber-400 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${selectedRole === 'ADMIN' ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>Railway Admin (நிர்வாகி)</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleModeSwitch('LOGIN')}
            className={`flex-1 py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              mode === 'LOGIN'
                ? 'border-amber-500 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Sign In</span>
            <span className="text-[10px] text-slate-400 font-normal">({selectedRole === 'ADMIN' ? 'Admin' : 'Passenger'})</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('REGISTER')}
            className={`flex-1 py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              mode === 'REGISTER'
                ? 'border-amber-500 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Create New Account</span>
            <span className="text-[10px] text-slate-400 font-normal">({selectedRole === 'ADMIN' ? 'New Admin' : 'New Passenger'})</span>
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {/* Quick 1-Click Demo Testing Buttons */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Instant 1-Click Demo Login</span>
              </span>
              <span className="text-[10px] font-mono text-amber-700">Pre-Configured</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => executeOneClickLogin('ADMIN')}
                disabled={loading}
                className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="text-left leading-tight truncate">
                  <div className="text-xs">1-Click Admin Login</div>
                  <div className="text-[9px] font-mono font-normal text-slate-400">admin@rail.in · admin123</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => executeOneClickLogin('PASSENGER')}
                disabled={loading}
                className="w-full py-2 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
              >
                <Train className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="text-left leading-tight truncate">
                  <div className="text-xs">1-Click Passenger Login</div>
                  <div className="text-[9px] font-mono font-normal text-slate-500">passenger@rail.in · pass123</div>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold">Authentication Error</div>
                <div className="text-[11px] mt-0.5">{error}</div>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold">Success</div>
                <div className="text-[11px] mt-0.5">{successMsg}</div>
              </div>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 flex items-center justify-between">
                  <span>{selectedRole === 'ADMIN' ? 'Admin / Railway Official Email' : 'Passenger Email Address'}</span>
                  {selectedRole === 'ADMIN' && (
                    <span className="text-[10px] text-amber-700 font-mono">Demo: admin@rail.in</span>
                  )}
                  {selectedRole === 'PASSENGER' && (
                    <span className="text-[10px] text-blue-700 font-mono">Demo: passenger@rail.in</span>
                  )}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={selectedRole === 'ADMIN' ? 'e.g. admin@rail.in or official@rail.gov.in' : 'e.g. passenger@rail.in'}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('FORGOT')}
                    className="text-[11px] text-amber-700 hover:text-amber-900 font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={selectedRole === 'ADMIN' ? 'Enter admin password (demo: admin123)' : 'Enter password (demo: pass123)'}
                    className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 px-4 font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 ${
                  selectedRole === 'ADMIN'
                    ? 'bg-slate-900 hover:bg-slate-800 text-amber-400'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950'
                }`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {selectedRole === 'ADMIN' ? <ShieldCheck className="w-4 h-4" /> : <Train className="w-4 h-4" />}
                    <span>Sign In as {selectedRole === 'ADMIN' ? 'Railway Admin' : 'Passenger'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {selectedRole === 'ADMIN'
                    ? 'Creating a Railway Administrator account grants access to train scheduling, simulator broadcast & fare rules.'
                    : 'Passenger account allows instant train booking, PNR tracking, and downloadable tickets.'}
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  {selectedRole === 'ADMIN' ? 'Admin Full Name (as per Railway ID)' : 'Full Passenger Name'}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={selectedRole === 'ADMIN' ? 'e.g. Rajesh Kumar' : 'e.g. Ramesh Varma'}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  {selectedRole === 'ADMIN' ? 'Railway Official / Login Email' : 'Email Address (Unique Login)'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={selectedRole === 'ADMIN' ? 'e.g. admin.chennai@rail.in' : 'e.g. ramesh@gmail.com'}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Mobile Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98450 12345"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500 text-xs"
                    />
                  </div>
                </div>

                {selectedRole === 'ADMIN' ? (
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Official Designation</label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <select
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500 text-xs font-medium"
                      >
                        <option value="Station Superintendent">Station Superintendent</option>
                        <option value="Chief Train Controller">Chief Train Controller</option>
                        <option value="Station Master">Station Master</option>
                        <option value="Commercial Inspector">Commercial Inspector</option>
                        <option value="Senior Operations Manager">Senior Operations Manager</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Preferred Quota</label>
                    <select className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs">
                      <option value="GN">General (GN)</option>
                      <option value="TQ">Tatkal (TQ)</option>
                      <option value="SS">Senior Citizen (SS)</option>
                      <option value="LD">Ladies (LD)</option>
                    </select>
                  </div>
                )}
              </div>

              {selectedRole === 'ADMIN' && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-700">Admin Authorization Passcode</label>
                    <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Pre-verified: RAILADMIN2026</span>
                    </span>
                  </div>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      placeholder="Enter RAILADMIN2026"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:bg-white focus:ring-1 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Use default official authorization code <code>RAILADMIN2026</code> to verify administrative clearance.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Create Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500 text-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500 text-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {selectedRole === 'PASSENGER' && (
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 mt-0.5"
                  />
                  <label htmlFor="terms" className="text-[11px] text-slate-600 leading-tight">
                    I agree to standard Indian Railways reservation terms and carriage conditions.
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 px-4 font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 ${
                  selectedRole === 'ADMIN'
                    ? 'bg-slate-900 hover:bg-slate-800 text-amber-400'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950'
                }`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {selectedRole === 'ADMIN' ? <ShieldCheck className="w-4 h-4" /> : <Train className="w-4 h-4" />}
                    <span>{selectedRole === 'ADMIN' ? 'Complete Railway Admin Registration' : 'Complete Passenger Registration'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'FORGOT' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Registered Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your account email"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500 text-xs"
                    required
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                In this preview platform, submitting will securely re-hash and reset your password to{' '}
                <strong>{selectedRole === 'ADMIN' ? 'admin123' : 'pass123'}</strong> and notify your dashboard.
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleModeSwitch('LOGIN')}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                >
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-lg transition-colors"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}

          {/* Security Notice */}
          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Bcrypt protected authentication. RBAC enforced.</span>
            </span>
            <span className="font-mono text-slate-400">RailSathi v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
