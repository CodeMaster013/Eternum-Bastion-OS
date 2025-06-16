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
import MnemosyneAI from './MnemosyneAI';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
    setIsMobileMenuOpen(false);
    setIsSidebarOpen(false);
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
    />,
    llama: <MnemosyneAI user={user} onNotification={addNotification} />
  };

  const modules = [
    { id: 'terminal', name: 'Terminal', icon: '⚡', shortName: 'Term' },
    { id: 'map', name: 'Dimensional Map', icon: '🗺️', shortName: 'Map' },
    { id: 'spellcraft', name: 'Spell Crafting', icon: '🔮', shortName: 'Spells' },
    { id: 'souls', name: 'Soul Registry', icon: '👥', shortName: 'Souls' },
    { id: 'prophecy', name: 'Prophecy Engine', icon: '🔮', shortName: 'Oracle' },
    { id: 'energy', name: 'Energy Manager', icon: '⚡', shortName: 'Energy' },
    { id: 'llama', name: 'Mnemosyne-Elyr', icon: '🧠', shortName: 'AI' }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getThemeClasses()} relative overflow-hidden`}>
      {/* Animated Background Effects */}
      <div className="absolute inset-0 magical-background"></div>
      <div className="absolute inset-0 rune-pattern opacity-10"></div>
      
      {/* Enhanced Floating Particles - Hidden on mobile */}
      {!isMobile && (
        <>
          <div className="floating-particles"></div>
          <div className="mystical-orbs"></div>
        </>
      )}
      
      {/* Main Interface */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Enhanced Header */}
        <motion.div 
          className="flex justify-between items-center p-3 md:p-4 border-b border-purple-500/30 bg-black/20 backdrop-blur-sm"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Mobile Menu Button */}
            {isMobile && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-purple-400 hover:text-purple-300 md:hidden"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
            
            <motion.div 
              className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity }
              }}
            />
            <h1 className="text-lg md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 magical-glow">
              ETERNUM OS
            </h1>
          </div>
          
          {/* Desktop Header Info */}
          <div className="hidden md:flex items-center space-x-6 text-purple-300">
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

          {/* Mobile Header Info */}
          <div className="flex md:hidden items-center space-x-2">
            <div className="text-xs text-purple-300">
              {user.accessLevel.toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-xs"
            >
              Exit
            </button>
          </div>
        </motion.div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && isMobile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-black/90 border-b border-purple-500/30 backdrop-blur-sm md:hidden"
            >
              <div className="p-4 space-y-3">
                {/* Mobile User Info */}
                <div className="text-sm text-purple-300 space-y-1">
                  <div><span className="text-purple-400">User:</span> {user.username}</div>
                  <div><span className="text-purple-400">Time:</span> {systemTime.toLocaleTimeString()}</div>
                </div>
                
                {/* Mobile Controls */}
                <div className="flex items-center justify-between">
                  <select 
                    value={currentTheme}
                    onChange={(e) => setCurrentTheme(e.target.value)}
                    className="bg-black/30 border border-purple-500/30 rounded px-2 py-1 text-xs text-purple-300 flex-1 mr-2"
                  >
                    <option value="default">Default Theme</option>
                    <option value="fire">Fire</option>
                    <option value="ice">Ice</option>
                    <option value="void">Void</option>
                    <option value="nature">Nature</option>
                    <option value="celestial">Celestial</option>
                  </select>
                  
                  <button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`px-3 py-1 rounded text-xs transition-colors ${
                      voiceEnabled 
                        ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
                        : 'bg-gray-500/20 border border-gray-500/30 text-gray-400'
                    }`}
                  >
                    Voice {voiceEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Mobile Sidebar Toggle */}
                <button
                  onClick={() => {
                    setIsSidebarOpen(!isSidebarOpen);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300 text-sm"
                >
                  {isSidebarOpen ? 'Hide' : 'Show'} System Status
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Module Navigation - Responsive */}
        <div className="flex border-b border-purple-500/30 bg-black/10 backdrop-blur-sm overflow-x-auto">
          {modules.map((module) => (
            <motion.button
              key={module.id}
              onClick={() => {
                setActiveModule(module.id);
                setIsMobileMenuOpen(false);
              }}
              className={`px-2 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors border-r border-purple-500/20 whitespace-nowrap ${
                activeModule === module.id
                  ? 'bg-purple-500/20 text-purple-300 border-b-2 border-purple-400'
                  : 'text-purple-400 hover:bg-purple-500/10 hover:text-purple-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-1 md:mr-2">{module.icon}</span>
              <span className="hidden sm:inline">{isMobile ? module.shortName : module.name}</span>
              <span className="sm:hidden">{module.shortName}</span>
            </motion.button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex relative">
          {/* System Status Sidebar - Responsive */}
          <AnimatePresence>
            {(!isMobile || isSidebarOpen) && (
              <motion.div 
                className={`${
                  isMobile 
                    ? 'fixed inset-y-0 left-0 z-30 w-80 bg-black/95' 
                    : 'w-80 border-r border-purple-500/30 bg-black/10'
                } backdrop-blur-sm`}
                initial={isMobile ? { x: -320, opacity: 0 } : { x: -300, opacity: 0 }}
                animate={isMobile ? { x: 0, opacity: 1 } : { x: 0, opacity: 1 }}
                exit={isMobile ? { x: -320, opacity: 0 } : { x: -300, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMobile && (
                  <div className="flex items-center justify-between p-4 border-b border-purple-500/30">
                    <h3 className="text-lg font-semibold text-purple-300">System Status</h3>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
                <SystemStatus user={user} energyAllocations={energyAllocations} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Sidebar Overlay */}
          {isMobile && isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-20"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          
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

      {/* Notification System - Responsive positioning */}
      <NotificationSystem 
        notifications={notifications}
        onRemove={removeNotification}
      />

      {/* Voice Command Interface - Responsive */}
      {voiceEnabled && (
        <VoiceCommandInterface 
          user={user}
          onNotification={addNotification}
        />
      )}

      {/* Mnemosyne-Elyr AI Interface - Responsive */}
      {activeModule !== 'llama' && (
        <MnemosyneAI 
          user={user}
          onNotification={addNotification}
        />
      )}

      {/* Holographic UI Elements - Hidden on mobile */}
      {!isMobile && (
        <div className="holographic-elements">
          <div className="floating-rune rune-1"></div>
          <div className="floating-rune rune-2"></div>
          <div className="floating-rune rune-3"></div>
        </div>
      )}
    </div>
  );
};

export default MagicalOS;