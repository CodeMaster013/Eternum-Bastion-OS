import React, { useState, useEffect } from 'react';
import Terminal from './Terminal';
import Authentication from './Authentication';
import SystemStatus from './SystemStatus';
import NotificationSystem from './NotificationSystem';
import EnergyManager from './EnergyManager';
import DimensionalMap from './DimensionalMap';
import SpellCraftingModule from './SpellCraftingModule';
import SoulRegistry from './SoulRegistry';
import ProphecyEngine from './ProphecyEngine';
import VoiceCommandInterface from './VoiceCommandInterface';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  username: string;
  accessLevel: 'root' | 'executor' | 'guest';
  authenticated: boolean;
}

export interface SystemNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  chamber?: string;
}

export interface EnergyAllocation {
  chamber: string;
  allocated: number;
  maximum: number;
  efficiency: number;
}

const MagicalOS: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [systemTime, setSystemTime] = useState(new Date());
  const [activeModule, setActiveModule] = useState<string>('terminal');
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [energyAllocations, setEnergyAllocations] = useState<EnergyAllocation[]>([
    { chamber: 'Prism Atrium', allocated: 75, maximum: 100, efficiency: 0.92 },
    { chamber: 'Metamorphic Conclave', allocated: 60, maximum: 100, efficiency: 0.88 },
    { chamber: 'Ember Ring', allocated: 85, maximum: 100, efficiency: 0.95 },
    { chamber: 'Void Nexus', allocated: 40, maximum: 100, efficiency: 0.65 },
    { chamber: 'Memory Sanctum', allocated: 70, maximum: 100, efficiency: 0.90 },
    { chamber: 'Mirror Maze', allocated: 55, maximum: 100, efficiency: 0.82 }
  ]);
  const [currentTheme, setCurrentTheme] = useState<string>('default');
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simulate system events
    const eventTimer = setInterval(() => {
      if (Math.random() < 0.3) {
        addNotification({
          type: Math.random() > 0.7 ? 'warning' : 'info',
          title: 'System Event',
          message: getRandomSystemEvent(),
          chamber: getRandomChamber()
        });
      }
    }, 15000);

    return () => clearInterval(eventTimer);
  }, []);

  const handleAuthentication = (userData: User) => {
    setUser(userData);
    addNotification({
      type: 'success',
      title: 'Authentication Successful',
      message: `Welcome back, ${userData.username}. Dimensional link established.`
    });
  };

  const handleLogout = () => {
    setUser(null);
    setActiveModule('terminal');
    setNotifications([]);
  };

  const addNotification = (notification: Omit<SystemNotification, 'id' | 'timestamp'>) => {
    const newNotification: SystemNotification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const updateEnergyAllocation = (chamber: string, newAllocation: number) => {
    setEnergyAllocations(prev => 
      prev.map(allocation => 
        allocation.chamber === chamber 
          ? { ...allocation, allocated: Math.min(newAllocation, allocation.maximum) }
          : allocation
      )
    );
    
    addNotification({
      type: 'info',
      title: 'Energy Reallocation',
      message: `${chamber} energy adjusted to ${newAllocation}%`,
      chamber
    });
  };

  const getRandomSystemEvent = () => {
    const events = [
      'Temporal fluctuation detected in dimensional matrix',
      'Prism resonance harmonics stabilized',
      'Memory synchronization cycle completed',
      'Ward integrity fluctuation resolved',
      'Transformation ritual successfully executed',
      'Dimensional gateway activity monitored',
      'Soul anchor points recalibrated',
      'Mystical energy surge contained'
    ];
    return events[Math.floor(Math.random() * events.length)];
  };

  const getRandomChamber = () => {
    const chambers = ['Prism Atrium', 'Metamorphic Conclave', 'Ember Ring', 'Void Nexus', 'Memory Sanctum', 'Mirror Maze'];
    return chambers[Math.floor(Math.random() * chambers.length)];
  };

  const getThemeClasses = () => {
    const themes = {
      default: 'from-purple-950 via-black to-indigo-950',
      fire: 'from-red-950 via-orange-900 to-yellow-900',
      ice: 'from-blue-950 via-cyan-900 to-teal-900',
      void: 'from-gray-950 via-black to-purple-950',
      nature: 'from-green-950 via-emerald-900 to-teal-900',
      celestial: 'from-indigo-950 via-purple-900 to-pink-900'
    };
    return themes[currentTheme as keyof typeof themes] || themes.default;
  };

  if (!user?.authenticated) {
    return <Authentication onAuthenticate={handleAuthentication} />;
  }

  const moduleComponents = {
    terminal: <Terminal user={user} onNotification={addNotification} currentTheme={currentTheme} />,
    map: <DimensionalMap user={user} onNotification={addNotification} energyAllocations={energyAllocations} />,
    spellcraft: <SpellCraftingModule user={user} onNotification={addNotification} />,
    souls: <SoulRegistry user={user} onNotification={addNotification} />,
    prophecy: <ProphecyEngine user={user} onNotification={addNotification} />,
    energy: <EnergyManager 
      user={user} 
      energyAllocations={energyAllocations} 
      onUpdateAllocation={updateEnergyAllocation}
      onNotification={addNotification}
    />
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getThemeClasses()} relative overflow-hidden`}>
      {/* Animated Background Effects */}
      <div className="absolute inset-0 magical-background"></div>
      <div className="absolute inset-0 rune-pattern opacity-10"></div>
      
      {/* Enhanced Floating Particles */}
      <div className="floating-particles"></div>
      <div className="mystical-orbs"></div>
      
      {/* Main Interface */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Enhanced Header */}
        <motion.div 
          className="flex justify-between items-center p-4 border-b border-purple-500/30 bg-black/20 backdrop-blur-sm"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-4">
            <motion.div 
              className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity }
              }}
            />
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 magical-glow">
              ETERNUM OS
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
            
            {/* Theme Selector */}
            <select 
              value={currentTheme}
              onChange={(e) => setCurrentTheme(e.target.value)}
              className="bg-black/30 border border-purple-500/30 rounded px-2 py-1 text-xs text-purple-300"
            >
              <option value="default">Default</option>
              <option value="fire">Fire</option>
              <option value="ice">Ice</option>
              <option value="void">Void</option>
              <option value="nature">Nature</option>
              <option value="celestial">Celestial</option>
            </select>

            {/* Voice Toggle */}
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                voiceEnabled 
                  ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
                  : 'bg-gray-500/20 border border-gray-500/30 text-gray-400'
              }`}
            >
              Voice {voiceEnabled ? 'ON' : 'OFF'}
            </button>
            
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Logout
            </button>
          </div>
        </motion.div>

        {/* Module Navigation */}
        <div className="flex border-b border-purple-500/30 bg-black/10 backdrop-blur-sm">
          {[
            { id: 'terminal', name: 'Terminal', icon: '⚡' },
            { id: 'map', name: 'Dimensional Map', icon: '🗺️' },
            { id: 'spellcraft', name: 'Spell Crafting', icon: '🔮' },
            { id: 'souls', name: 'Soul Registry', icon: '👥' },
            { id: 'prophecy', name: 'Prophecy Engine', icon: '🔮' },
            { id: 'energy', name: 'Energy Manager', icon: '⚡' },
            { id: 'llama', name: 'Llama 3.2', icon: '🤖' }
          ].map((module) => (
            <motion.button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-r border-purple-500/20 ${
                activeModule === module.id
                  ? 'bg-purple-500/20 text-purple-300 border-b-2 border-purple-400'
                  : 'text-purple-400 hover:bg-purple-500/10 hover:text-purple-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">{module.icon}</span>
              {module.name}
            </motion.button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* System Status Sidebar */}
          <motion.div 
            className="w-80 border-r border-purple-500/30 bg-black/10 backdrop-blur-sm"
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <SystemStatus user={user} energyAllocations={energyAllocations} />
          </motion.div>
          
          {/* Active Module */}
          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {moduleComponents[activeModule as keyof typeof moduleComponents]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Notification System */}
      <NotificationSystem 
        notifications={notifications}
        onRemove={removeNotification}
      />

      {/* Voice Command Interface */}
      {voiceEnabled && (
        <VoiceCommandInterface 
          user={user}
          onNotification={addNotification}
        />
      )}

      {/* Holographic UI Elements */}
      <div className="holographic-elements">
        <div className="floating-rune rune-1"></div>
        <div className="floating-rune rune-2"></div>
        <div className="floating-rune rune-3"></div>
      </div>
    </div>
  );
};

export default MagicalOS;
