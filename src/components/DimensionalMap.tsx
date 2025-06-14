import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Zap, Eye, Lock, Unlock } from 'lucide-react';
import { EnergyAllocation, SystemNotification } from './MagicalOS';

interface User {
  username: string;
  accessLevel: 'root' | 'executor' | 'guest';
  authenticated: boolean;
}

interface DimensionalMapProps {
  user: User;
  onNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp'>) => void;
  energyAllocations: EnergyAllocation[];
}

interface Chamber {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'transformation' | 'memory' | 'combat' | 'void' | 'energy' | 'mirror';
  status: 'active' | 'standby' | 'locked' | 'critical';
  connections: string[];
  description: string;
  requiredAccess: 'root' | 'executor' | 'guest';
}

const DimensionalMap: React.FC<DimensionalMapProps> = ({ user, onNotification, energyAllocations }) => {
  const [selectedChamber, setSelectedChamber] = useState<Chamber | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'energy' | 'security'>('overview');
  const mapRef = useRef<HTMLDivElement>(null);

  const chambers: Chamber[] = [
    {
      id: 'prism-atrium',
      name: 'Prism Atrium',
      x: 300,
      y: 200,
      type: 'transformation',
      status: 'active',
      connections: ['metamorphic-conclave', 'ember-ring'],
      description: 'Central transformation hub where light bends reality itself',
      requiredAccess: 'guest'
    },
    {
      id: 'metamorphic-conclave',
      name: 'Metamorphic Conclave',
      x: 150,
      y: 300,
      type: 'transformation',
      status: 'active',
      connections: ['prism-atrium', 'memory-sanctum'],
      description: 'Advanced shapeshifting and biological transformation chamber',
      requiredAccess: 'executor'
    },
    {
      id: 'ember-ring',
      name: 'Ember Ring',
      x: 450,
      y: 300,
      type: 'energy',
      status: 'standby',
      connections: ['prism-atrium', 'void-nexus'],
      description: 'Circle of eternal flames that power the bastion',
      requiredAccess: 'executor'
    },
    {
      id: 'void-nexus',
      name: 'Void Nexus',
      x: 500,
      y: 450,
      type: 'void',
      status: 'critical',
      connections: ['ember-ring', 'mirror-maze'],
      description: 'Where the space between spaces can be touched',
      requiredAccess: 'root'
    },
    {
      id: 'memory-sanctum',
      name: 'Memory Sanctum',
      x: 100,
      y: 450,
      type: 'memory',
      status: 'active',
      connections: ['metamorphic-conclave', 'mirror-maze'],
      description: 'Repository of all consciousness and experience',
      requiredAccess: 'executor'
    },
    {
      id: 'mirror-maze',
      name: 'Mirror Maze',
      x: 300,
      y: 550,
      type: 'mirror',
      status: 'locked',
      connections: ['memory-sanctum', 'void-nexus', 'duel-arena'],
      description: 'Infinite reflections hiding infinite truths',
      requiredAccess: 'root'
    },
    {
      id: 'duel-arena',
      name: 'Duel Arena',
      x: 300,
      y: 100,
      type: 'combat',
      status: 'standby',
      connections: ['prism-atrium'],
      description: 'Mystical combat simulation and training grounds',
      requiredAccess: 'executor'
    }
  ];

  const getEnergyForChamber = (chamberName: string) => {
    return energyAllocations.find(e => e.chamber === chamberName);
  };

  const getChamberColor = (chamber: Chamber) => {
    const energy = getEnergyForChamber(chamber.name);
    
    if (viewMode === 'energy') {
      if (!energy) return '#666';
      if (energy.allocated > 80) return '#10b981'; // green
      if (energy.allocated > 50) return '#f59e0b'; // yellow
      return '#ef4444'; // red
    }
    
    if (viewMode === 'security') {
      if (chamber.requiredAccess === 'root') return '#dc2626';
      if (chamber.requiredAccess === 'executor') return '#f59e0b';
      return '#10b981';
    }
    
    // Overview mode
    switch (chamber.status) {
      case 'active': return '#10b981';
      case 'standby': return '#f59e0b';
      case 'locked': return '#6b7280';
      case 'critical': return '#ef4444';
      default: return '#8b5cf6';
    }
  };

  const getChamberIcon = (type: string) => {
    switch (type) {
      case 'transformation': return '🔮';
      case 'memory': return '🧠';
      case 'combat': return '⚔️';
      case 'void': return '🕳️';
      case 'energy': return '⚡';
      case 'mirror': return '🪞';
      default: return '🏛️';
    }
  };

  const handleChamberClick = (chamber: Chamber) => {
    if (chamber.requiredAccess === 'root' && user.accessLevel !== 'root') {
      onNotification({
        type: 'error',
        title: 'Access Denied',
        message: `${chamber.name} requires ROOT access level`,
        chamber: chamber.name
      });
      return;
    }
    
    if (chamber.requiredAccess === 'executor' && user.accessLevel === 'guest') {
      onNotification({
        type: 'error',
        title: 'Access Denied',
        message: `${chamber.name} requires EXECUTOR access level or higher`,
        chamber: chamber.name
      });
      return;
    }

    setSelectedChamber(chamber);
    onNotification({
      type: 'info',
      title: 'Chamber Selected',
      message: `Accessing ${chamber.name}...`,
      chamber: chamber.name
    });
  };

  const renderConnection = (from: Chamber, to: Chamber) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    return (
      <motion.div
        key={`${from.id}-${to.id}`}
        className="absolute bg-purple-400/30 h-0.5 origin-left"
        style={{
          left: from.x + 20,
          top: from.y + 20,
          width: length - 40,
          transform: `rotate(${angle}deg)`
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
    );
  };

  return (
    <div className="h-full flex bg-black/20 backdrop-blur-sm">
      {/* Map Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Map className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Dimensional Map
            </h2>
          </div>
          
          <div className="flex space-x-2">
            {['overview', 'energy', 'security'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === mode
                    ? 'bg-purple-500/30 text-purple-300 border border-purple-400/50'
                    : 'bg-black/30 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Map Canvas */}
        <div 
          ref={mapRef}
          className="absolute inset-0 pt-16"
          style={{ 
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)',
            backgroundSize: '200px 200px'
          }}
        >
          {/* Render Connections */}
          {chambers.map(chamber => 
            chamber.connections.map(connectionId => {
              const connectedChamber = chambers.find(c => c.id === connectionId);
              return connectedChamber ? renderConnection(chamber, connectedChamber) : null;
            })
          )}

          {/* Render Chambers */}
          {chambers.map((chamber, index) => {
            const energy = getEnergyForChamber(chamber.name);
            const hasAccess = 
              chamber.requiredAccess === 'guest' || 
              (chamber.requiredAccess === 'executor' && user.accessLevel !== 'guest') ||
              (chamber.requiredAccess === 'root' && user.accessLevel === 'root');

            return (
              <motion.div
                key={chamber.id}
                className={`absolute w-12 h-12 rounded-full border-2 cursor-pointer flex items-center justify-center text-lg ${
                  hasAccess ? 'hover:scale-110' : 'opacity-50 cursor-not-allowed'
                }`}
                style={{
                  left: chamber.x,
                  top: chamber.y,
                  backgroundColor: getChamberColor(chamber),
                  borderColor: selectedChamber?.id === chamber.id ? '#fff' : getChamberColor(chamber),
                  boxShadow: selectedChamber?.id === chamber.id ? '0 0 20px rgba(255,255,255,0.5)' : 'none'
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: hasAccess ? 1.1 : 1 }}
                onClick={() => handleChamberClick(chamber)}
              >
                {getChamberIcon(chamber.type)}
                
                {/* Energy indicator */}
                {viewMode === 'energy' && energy && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-black/70 rounded-full flex items-center justify-center text-xs text-white">
                    {energy.allocated}
                  </div>
                )}
                
                {/* Access indicator */}
                {viewMode === 'security' && (
                  <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-black/70 rounded-full flex items-center justify-center">
                    {hasAccess ? <Unlock size={8} className="text-green-400" /> : <Lock size={8} className="text-red-400" />}
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Chamber Labels */}
          {chambers.map((chamber) => (
            <motion.div
              key={`${chamber.id}-label`}
              className="absolute text-xs text-purple-300 pointer-events-none text-center"
              style={{
                left: chamber.x - 20,
                top: chamber.y + 50,
                width: 80
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              {chamber.name}
            </motion.div>
          ))}

          {/* Energy Flow Animation */}
          {viewMode === 'energy' && (
            <div className="absolute inset-0 pointer-events-none">
              {chambers.map((chamber, index) => {
                const energy = getEnergyForChamber(chamber.name);
                if (!energy || energy.allocated < 20) return null;
                
                return (
                  <motion.div
                    key={`energy-${chamber.id}`}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    style={{
                      left: chamber.x + 20,
                      top: chamber.y + 20
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chamber Details Panel */}
      <AnimatePresence>
        {selectedChamber && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="w-96 bg-black/30 border-l border-purple-500/30 backdrop-blur-sm p-6 overflow-y-auto"
          >
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-purple-300">{selectedChamber.name}</h3>
                  <button
                    onClick={() => setSelectedChamber(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getChamberIcon(selectedChamber.type)}</span>
                    <span className="text-purple-400 capitalize">{selectedChamber.type} Chamber</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getChamberColor(selectedChamber) }}
                    />
                    <span className="text-purple-400 capitalize">{selectedChamber.status}</span>
                  </div>
                  
                  <div className="text-sm text-gray-300">
                    {selectedChamber.description}
                  </div>
                </div>
              </div>

              {/* Energy Status */}
              {(() => {
                const energy = getEnergyForChamber(selectedChamber.name);
                return energy ? (
                  <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-yellow-400 mb-3">Energy Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Allocation:</span>
                        <span className="text-white">{energy.allocated}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Efficiency:</span>
                        <span className="text-white">{(energy.efficiency * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400"
                          style={{ width: `${energy.allocated}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Access Control */}
              <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-blue-400 mb-3">Access Control</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Required Level:</span>
                    <span className="text-white uppercase">{selectedChamber.requiredAccess}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Your Access:</span>
                    <span className="text-white uppercase">{user.accessLevel}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedChamber.requiredAccess === 'guest' || 
                     (selectedChamber.requiredAccess === 'executor' && user.accessLevel !== 'guest') ||
                     (selectedChamber.requiredAccess === 'root' && user.accessLevel === 'root') ? (
                      <>
                        <Unlock size={16} className="text-green-400" />
                        <span className="text-green-400">Access Granted</span>
                      </>
                    ) : (
                      <>
                        <Lock size={16} className="text-red-400" />
                        <span className="text-red-400">Access Denied</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Connected Chambers */}
              <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-purple-400 mb-3">Connected Chambers</h4>
                <div className="space-y-2">
                  {selectedChamber.connections.map(connectionId => {
                    const connectedChamber = chambers.find(c => c.id === connectionId);
                    return connectedChamber ? (
                      <div 
                        key={connectionId}
                        className="flex items-center space-x-2 p-2 bg-black/20 rounded cursor-pointer hover:bg-purple-500/10"
                        onClick={() => setSelectedChamber(connectedChamber)}
                      >
                        <span className="text-lg">{getChamberIcon(connectedChamber.type)}</span>
                        <span className="text-purple-300">{connectedChamber.name}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              {user.accessLevel !== 'guest' && (
                <div className="space-y-2">
                  <button className="w-full py-2 bg-purple-600/20 border border-purple-500/30 rounded text-purple-300 hover:bg-purple-600/30 transition-colors">
                    Scan Chamber
                  </button>
                  <button className="w-full py-2 bg-blue-600/20 border border-blue-500/30 rounded text-blue-300 hover:bg-blue-600/30 transition-colors">
                    Run Diagnostics
                  </button>
                  {user.accessLevel === 'root' && (
                    <button className="w-full py-2 bg-red-600/20 border border-red-500/30 rounded text-red-300 hover:bg-red-600/30 transition-colors">
                      Emergency Override
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DimensionalMap;