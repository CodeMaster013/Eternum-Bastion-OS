import React, { useState } from 'react';
import { Eye, EyeOff, Zap, UserPlus, LogIn, Sparkles, Mail, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  username: string;
  accessLevel: 'root' | 'executor' | 'guest';
  authenticated: boolean;
  email?: string;
}

interface AuthenticationProps {
  onAuthenticate: (user: User) => void;
}

interface UserAccount {
  username: string;
  password: string;
  accessLevel: 'root' | 'executor' | 'guest';
  email: string;
  created: Date;
  lastLogin?: Date;
}

const Authentication: React.FC<AuthenticationProps> = ({ onAuthenticate }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    accessLevel: 'guest' as const
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load existing accounts from localStorage
  const getStoredAccounts = (): UserAccount[] => {
    try {
      const stored = localStorage.getItem('eternum_accounts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Save accounts to localStorage
  const saveAccounts = (accounts: UserAccount[]) => {
    localStorage.setItem('eternum_accounts', JSON.stringify(accounts));
  };

  // Initialize with default accounts if none exist
  React.useEffect(() => {
    const accounts = getStoredAccounts();
    if (accounts.length === 0) {
      const defaultAccounts: UserAccount[] = [
        {
          username: 'Valtharix',
          password: 'MirrorSoul_Prime',
          accessLevel: 'root',
          email: 'sovereign@eternum.bastion',
          created: new Date()
        },
        {
          username: 'Executor_Prime',
          password: 'Sigil_Command',
          accessLevel: 'executor',
          email: 'executor@eternum.bastion',
          created: new Date()
        },
        {
          username: 'Initiate',
          password: 'Basic_Access',
          accessLevel: 'guest',
          email: 'initiate@eternum.bastion',
          created: new Date()
        }
      ];
      saveAccounts(defaultAccounts);
    }
  }, []);

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Dimensional Identity is required');
      return false;
    }

    if (!formData.password) {
      setError('Arcane Passphrase is required');
      return false;
    }

    if (mode === 'signup') {
      if (!formData.email.trim()) {
        setError('Mystical Communication Channel is required');
        return false;
      }

      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError('Invalid mystical communication format');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Arcane Passphrases do not harmonize');
        return false;
      }

      if (formData.password.length < 6) {
        setError('Passphrase must contain at least 6 mystical characters');
        return false;
      }

      // Check if username already exists
      const accounts = getStoredAccounts();
      if (accounts.some(acc => acc.username.toLowerCase() === formData.username.toLowerCase())) {
        setError('This Dimensional Identity already exists in the registry');
        return false;
      }

      // Check if email already exists
      if (accounts.some(acc => acc.email.toLowerCase() === formData.email.toLowerCase())) {
        setError('This communication channel is already bound to another entity');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate mystical processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const accounts = getStoredAccounts();

    if (mode === 'login') {
      // Login logic
      const account = accounts.find(acc => 
        acc.username.toLowerCase() === formData.username.toLowerCase() && 
        acc.password === formData.password
      );

      if (account) {
        // Update last login
        account.lastLogin = new Date();
        saveAccounts(accounts);

        onAuthenticate({
          username: account.username,
          accessLevel: account.accessLevel,
          authenticated: true,
          email: account.email
        });
      } else {
        setError('RUNE FAULT: Invocation Rejected—Glyph Harmony Mismatch');
      }
    } else {
      // Signup logic
      const newAccount: UserAccount = {
        username: formData.username,
        password: formData.password,
        accessLevel: formData.accessLevel,
        email: formData.email,
        created: new Date()
      };

      accounts.push(newAccount);
      saveAccounts(accounts);

      setSuccess('✨ Dimensional Registry Complete! Your mystical identity has been forged in the cosmic archives.');
      
      // Auto-switch to login after successful signup
      setTimeout(() => {
        setMode('login');
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '', email: '' }));
        setSuccess('');
      }, 3000);
    }

    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      accessLevel: 'guest'
    });
    setError('');
    setSuccess('');
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    resetForm();
  };

  const getAccessLevelDescription = (level: string) => {
    switch (level) {
      case 'root': return 'Supreme Mystical Authority - Full bastion control';
      case 'executor': return 'Advanced Practitioner - Ritual and chamber operations';
      case 'guest': return 'Initiate Observer - Basic system queries only';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-indigo-950 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 magical-background opacity-50"></div>
      <div className="absolute inset-0 rune-pattern opacity-20"></div>
      
      {/* Login/Signup Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-md w-full"
      >
        <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 md:p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <motion.div
              className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center"
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity }
              }}
            >
              <Zap className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </motion.div>
            <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
              ETERNUM OS
            </h1>
            <p className="text-purple-300 text-sm">
              {mode === 'login' ? 'Mystical Access Terminal' : 'Dimensional Registry Portal'}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex mb-6 bg-black/30 rounded-lg p-1">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                mode === 'login'
                  ? 'bg-purple-500/30 text-purple-300 border border-purple-400/50'
                  : 'text-purple-400 hover:text-purple-300'
              }`}
            >
              <LogIn size={16} />
              <span>Access Portal</span>
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                mode === 'signup'
                  ? 'bg-purple-500/30 text-purple-300 border border-purple-400/50'
                  : 'text-purple-400 hover:text-purple-300'
              }`}
            >
              <UserPlus size={16} />
              <span>Registry</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Username */}
              <div>
                <label className="block text-purple-300 text-sm font-medium mb-2">
                  Dimensional Identity
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-3 bg-purple-900/20 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-sm md:text-base"
                  placeholder="Enter your mystical name..."
                  required
                />
              </div>

              {/* Email (Signup only) */}
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-purple-300 text-sm font-medium mb-2">
                    Mystical Communication Channel
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-12 pr-4 py-3 bg-purple-900/20 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-sm md:text-base"
                      placeholder="your.essence@mystical.realm"
                      required
                    />
                  </div>
                </motion.div>
              )}

              {/* Access Level (Signup only) */}
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-purple-300 text-sm font-medium mb-2">
                    Mystical Authority Level
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                    <select
                      value={formData.accessLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, accessLevel: e.target.value as any }))}
                      className="w-full pl-12 pr-4 py-3 bg-purple-900/20 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-sm md:text-base appearance-none"
                    >
                      <option value="guest">Initiate (Guest)</option>
                      <option value="executor">Practitioner (Executor)</option>
                    </select>
                  </div>
                  <p className="text-xs text-purple-400 mt-1">
                    {getAccessLevelDescription(formData.accessLevel)}
                  </p>
                </motion.div>
              )}

              {/* Password */}
              <div>
                <label className="block text-purple-300 text-sm font-medium mb-2">
                  Arcane Passphrase
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 bg-purple-900/20 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 pr-12 text-sm md:text-base"
                    placeholder="Speak the words of power..."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Signup only) */}
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-purple-300 text-sm font-medium mb-2">
                    Confirm Arcane Passphrase
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-3 bg-purple-900/20 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 pr-12 text-sm md:text-base"
                      placeholder="Repeat the mystical incantation..."
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success Message */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm"
                  >
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-400/20 disabled:opacity-50 transition-all duration-200 text-sm md:text-base"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>
                      {mode === 'login' ? 'Channeling Mystical Energies...' : 'Forging Dimensional Identity...'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Sparkles size={16} />
                    <span>
                      {mode === 'login' ? 'Initialize Dimensional Link' : 'Register in Cosmic Archives'}
                    </span>
                  </div>
                )}
              </button>
            </motion.form>
          </AnimatePresence>

          {/* Demo Users (Login mode only) */}
          {mode === 'login' && (
            <div className="mt-6 pt-6 border-t border-purple-500/20">
              <p className="text-purple-400 text-xs mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs text-purple-300">
                <div className="break-all">Valtharix / MirrorSoul_Prime (Root)</div>
                <div className="break-all">Executor_Prime / Sigil_Command (Executor)</div>
                <div className="break-all">Initiate / Basic_Access (Guest)</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Authentication;