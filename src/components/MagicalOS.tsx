import React, { useState, useEffect } from 'react';
import Terminal from './Terminal';
import Authentication from './Authentication';
import SystemStatus from './SystemStatus';

interface User {
  username: string;
  accessLevel: 'root' | 'executor' | 'guest';
  authenticated: boolean;
}

const MagicalOS: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [systemTime, setSystemTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAuthentication = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user?.authenticated) {
    return <Authentication onAuthenticate={handleAuthentication} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-indigo-950 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 magical-background"></div>
      <div className="absolute inset-0 rune-pattern opacity-10"></div>
      
      {/* Floating Particles */}
      <div className="floating-particles"></div>
      
      {/* Main Interface */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-purple-500/30 bg-black/20 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 magical-glow">
              ETERNUM BASTION OS
            </h1>
          </div>
          
          <div className="flex items-center space-x-6 text-purple-300">
            <div className="text-sm">
              <span className="text-purple-400">User:</span> {user.username}
            </div>
            <div className="text-sm">
              <span className="text-purple-400">Access:</span> {user.accessLevel.toUpperCase()}
            </div>
            <div className="text-sm">
              <span className="text-purple-400">Temporal:</span> {systemTime.toLocaleTimeString()}
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* System Status Sidebar */}
          <div className="w-80 border-r border-purple-500/30 bg-black/10 backdrop-blur-sm">
            <SystemStatus user={user} />
          </div>
          
          {/* Terminal */}
          <div className="flex-1">
            <Terminal user={user} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagicalOS;