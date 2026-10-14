import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'LOGIN' | 'REGISTER' | 'FORGOT';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'LOGIN',
}) => {
  const { login, register, forgotPassword } = useAuth();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>(initialMode);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialMode]);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name as per Government ID.');
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
    if (!termsAccepted) {
      setError('Please accept the railway travel terms and conditions.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register(name.trim(), email.trim(), password, phone.trim(), confirmPassword);
      setSuccessMsg('Account created successfully! Welcome to RailSathi.');
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
      const msg = await forgotPassword(email.trim(), 'pass123');
      setSuccessMsg(msg);
      setPassword('pass123');
      setTimeout(() => {
        setMode('LOGIN');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Password reset request failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoPassenger = () => {
    setEmail('passenger@rail.in');
    setPassword('pass123');
    setError(null);
  };

  const fillDemoAdmin = () => {
    setEmail('admin@rail.in');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold">
              {mode === 'LOGIN' && 'Passenger Sign In'}
              {mode === 'REGISTER' && 'Register New Passenger'}
              {mode === 'FORGOT' && 'Reset Account Password'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              RailSathi Digital Railway Platform · Secure Authentication
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleModeSwitch('LOGIN')}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              mode === 'LOGIN'
                ? 'border-amber-500 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('REGISTER')}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              mode === 'REGISTER'
                ? 'border-amber-500 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Create New Account
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. passenger@rail.in"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium"
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
                    placeholder="Enter account password"
                    className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium"
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
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In to RailSathi</span>}
              </button>

              {/* Demo autofill shortcuts */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-[11px] font-semibold text-slate-500">Quick Demo Testing Accounts:</div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={fillDemoPassenger}
                    className="flex-1 py-1 px-2 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-medium transition-colors truncate"
                  >
                    Demo Passenger
                  </button>
                  <button
                    type="button"
                    onClick={fillDemoAdmin}
                    className="flex-1 py-1 px-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-[11px] font-medium transition-colors truncate"
                  >
                    Demo Admin
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Full Passenger Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Varma"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Email Address (Unique Login)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ramesh@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Mobile Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98450 12345"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Create Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
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
                      className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Complete Passenger Registration</span>}
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
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                In this preview platform, submitting will securely re-hash and reset your password to <strong>pass123</strong> and notify your dashboard.
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
          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Passwords hashed with bcryptjs. Roles: Passenger &amp; Admin (Protected).</span>
          </div>
        </div>
      </div>
    </div>
  );
};
