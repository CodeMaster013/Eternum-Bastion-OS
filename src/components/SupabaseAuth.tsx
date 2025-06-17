import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Zap, UserPlus, LogIn, Sparkles, Mail, Shield } from 'lucide-react';
import { DatabaseService } from '../lib/supabase';

interface User {
  id: string;
  username: string;
  email: string;
  accessLevel: 'root' | 'executor' | 'guest';
  authenticated: boolean;
}

interface SupabaseAuthProps {
  onAuthenticate: (user: User) => void;
}

const SupabaseAuth: React.FC<SupabaseAuthProps> = ({ onAuthenticate }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    accessLevel: 'guest' as const
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const user = await DatabaseService.getCurrentUser();
      if (user && user.user_metadata) {
        onAuthenticate({
          id: user.id,
          username: user.user_metadata.username || user.email?.split('@')[0] || 'Unknown',
          email: user.email || '',
          accessLevel: user.user_metadata.access_level || 'guest',
          authenticated: true
        });
      }
    } catch (error) {
      console.log('No existing session');
    }
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Mystical Communication Channel is required');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Invalid mystical communication format');
      return false;
    }

    if (!formData.password) {
      setError('Arcane Passphrase is required');
      return false;
    }

    if (mode === 'signup') {
      if (!formData.username.trim()) {
        setError('Dimensional Identity is required');
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
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { user } = await DatabaseService.signIn(formData.email, formData.password);
        
        if (user) {
          onAuthenticate({
            id: user.id,
            username: user.user_metadata?.username || user.email?.split('@')[0] || 'Unknown',
            email: user.email || '',
            accessLevel: user.user_metadata?.access_level || 'guest',
            authenticated: true
          });
        }
      } else {
        const { user } = await DatabaseService.signUp(
          formData.email, 
          formData.password, 
          formData.username
        );

        if (user) {
          setSuccess('✨ Dimensional Registry Complete! Please check your email to verify your account.');
          setTimeout(() => {
            setMode('login');
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            setSuccess('');
          }, 3000);
        }
      }
    } catch (error: any) {
      setError(`RUNE FAULT: ${error.message || 'Unknown mystical disturbance'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
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
              {mode === 'login' ? 'Dimensional Access Portal' : 'Mystical Registry Portal'}
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
              {/* Username (Signup only) */}
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
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
                </motion.div>
              )}

              {/* Email */}
              <div>
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
              </div>

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

          {/* Demo Info */}
          <div className="mt-6 pt-6 border-t border-purple-500/20">
            <p className="text-purple-400 text-xs mb-2">Database Integration:</p>
            <div className="space-y-1 text-xs text-purple-300">
              <div>• Real-time soul registry and transformations</div>
              <div>• Persistent spell crafting and prophecies</div>
              <div>• Synchronized energy management</div>
              <div>• Cross-dimensional data sharing</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SupabaseAuth;