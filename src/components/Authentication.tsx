import React, { useState } from 'react';
import { Eye, EyeOff, Zap } from 'lucide-react';

interface User {
  username: string;
  accessLevel: 'root' | 'executor' | 'guest';
  authenticated: boolean;
}

interface AuthenticationProps {
  onAuthenticate: (user: User) => void;
}

const Authentication: React.FC<AuthenticationProps> = ({ onAuthenticate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const predefinedUsers = {
    'Valtharix': { password: 'MirrorSoul_Prime', accessLevel: 'root' as const },
    'Executor_Prime': { password: 'Sigil_Command', accessLevel: 'executor' as const },
    'Initiate': { password: 'Basic_Access', accessLevel: 'guest' as const }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate mystical authentication delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const userKey = username as keyof typeof predefinedUsers;
    const userConfig = predefinedUsers[userKey];

    if (userConfig && userConfig.password === password) {
      onAuthenticate({
        username,
        accessLevel: userConfig.accessLevel,
        authenticated: true
      });
    } else {
      setError('RUNE FAULT: Invocation Rejected—Glyph Harmony Mismatch');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-indigo-950 relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 magical-background opacity-50"></div>
      <div className="absolute inset-0 rune-pattern opacity-20"></div>
      
      {/* Login Form */}
      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 animate-pulse flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
              ETERNUM BASTION
            </h1>
            <p className="text-purple-300 text-sm">Mystical Access Terminal</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-purple-300 text-sm font-medium mb-2">
                Dimensional Identity
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-purple-900/20 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                placeholder="Enter your mystical name..."
                required
              />
            </div>

            <div>
              <label className="block text-purple-300 text-sm font-medium mb-2">
                Arcane Passphrase
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-purple-900/20 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 pr-12"
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

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-400/20 disabled:opacity-50 transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Channeling Mystical Energies...</span>
                </div>
              ) : (
                'Initialize Dimensional Link'
              )}
            </button>
          </form>

          {/* Demo Users */}
          <div className="mt-6 pt-6 border-t border-purple-500/20">
            <p className="text-purple-400 text-xs mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-purple-300">
              <div>Valtharix / MirrorSoul_Prime (Root)</div>
              <div>Executor_Prime / Sigil_Command (Executor)</div>
              <div>Initiate / Basic_Access (Guest)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authentication;