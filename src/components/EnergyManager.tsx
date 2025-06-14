import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Settings, TrendingUp, AlertTriangle } from 'lucide-react';
import { EnergyAllocation, SystemNotification } from './MagicalOS';

interface User {
  username: string;
  accessLevel: 'root' | 'executor' | 'guest';
  authenticated: boolean;
}

interface EnergyManagerProps {
  user: User;
  energyAllocations: EnergyAllocation[];
  onUpdateAllocation: (chamber: string, allocation: number) => void;
  onNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp'>) => void;
}

const EnergyManager: React.FC<EnergyManagerProps> = ({ 
  user, 
  energyAllocations, 
  onUpdateAllocation, 
  onNotification 
}) => {
  const [selectedChamber, setSelectedChamber] = useState<string | null>(null);
  const [autoOptimize, setAutoOptimize] = useState(false);

  const totalAllocated = energyAllocations.reduce((sum, allocation) => sum + allocation.allocated, 0);
  const totalCapacity = energyAllocations.reduce((sum, allocation) => sum + allocation.maximum, 0);
  const averageEfficiency = energyAllocations.reduce((sum, allocation) => sum + allocation.efficiency, 0) / energyAllocations.length;

  const handleSliderChange = (chamber: string, value: number) => {
    if (user.accessLevel === 'guest') {
      onNotification({
        type: 'error',
        title: 'Access Denied',
        message: 'Insufficient privileges to modify energy allocations'
      });
      return;
    }
    onUpdateAllocation(chamber, value);
  };

  const optimizeAllocation = () => {
    if (user.accessLevel === 'guest') {
      onNotification({
        type: 'error',
        title: 'Access Denied',
        message: 'Insufficient privileges for system optimization'
      });
      return;
    }

    energyAllocations.forEach(allocation => {
      const optimized = Math.floor(allocation.efficiency * 100);
      onUpdateAllocation(allocation.chamber, optimized);
    });

    onNotification({
      type: 'success',
      title: 'Optimization Complete',
      message: 'All chamber energy allocations optimized for maximum efficiency'
    });
  };

  const emergencyReallocation = () => {
    if (user.accessLevel !== 'root') {
      onNotification({
        type: 'error',
        title: 'Access Denied',
        message: 'Emergency protocols require ROOT access'
      });
      return;
    }

    // Redistribute energy to critical systems
    const criticalChambers = ['Void Nexus', 'Memory Sanctum'];
    energyAllocations.forEach(allocation => {
      const newAllocation = criticalChambers.includes(allocation.chamber) ? 90 : 30;
      onUpdateAllocation(allocation.chamber, newAllocation);
    });

    onNotification({
      type: 'warning',
      title: 'Emergency Reallocation',
      message: 'Energy redirected to critical systems'
    });
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 0.9) return 'text-green-400';
    if (efficiency >= 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusColor = (allocated: number, efficiency: number) => {
    if (allocated < 30) return 'bg-red-500';
    if (allocated > 90) return 'bg-orange-500';
    if (efficiency < 0.7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="h-full p-6 overflow-y-auto bg-black/20 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <Zap className="w-8 h-8 text-yellow-400" />
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              Energy Management Matrix
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-purple-300">
              <span className="text-purple-400">Total Load:</span> {totalAllocated}/{totalCapacity}
            </div>
            <div className="text-sm text-purple-300">
              <span className="text-purple-400">Avg Efficiency:</span> {(averageEfficiency * 100).toFixed(1)}%
            </div>
          </div>
        </motion.div>

        {/* System Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-black/30 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-green-400">System Health</h3>
            </div>
            <div className="text-2xl font-bold text-white">
              {averageEfficiency > 0.8 ? 'Optimal' : averageEfficiency > 0.6 ? 'Stable' : 'Critical'}
            </div>
            <div className="text-sm text-gray-400">Overall system performance</div>
          </div>

          <div className="bg-black/30 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-yellow-400">Power Usage</h3>
            </div>
            <div className="text-2xl font-bold text-white">
              {((totalAllocated / totalCapacity) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">of total capacity</div>
          </div>

          <div className="bg-black/30 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <h3 className="text-lg font-semibold text-orange-400">Alerts</h3>
            </div>
            <div className="text-2xl font-bold text-white">
              {energyAllocations.filter(a => a.efficiency < 0.7 || a.allocated < 30).length}
            </div>
            <div className="text-sm text-gray-400">chambers need attention</div>
          </div>
        </motion.div>

        {/* Control Panel */}
        {user.accessLevel !== 'guest' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/30 border border-purple-500/30 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-purple-300">System Controls</h3>
              <div className="flex space-x-2">
                <button
                  onClick={optimizeAllocation}
                  className="px-4 py-2 bg-green-600/20 border border-green-500/30 rounded text-green-300 hover:bg-green-600/30 transition-colors"
                >
                  Auto Optimize
                </button>
                {user.accessLevel === 'root' && (
                  <button
                    onClick={emergencyReallocation}
                    className="px-4 py-2 bg-red-600/20 border border-red-500/30 rounded text-red-300 hover:bg-red-600/30 transition-colors"
                  >
                    Emergency Protocol
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Chamber Energy Allocations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {energyAllocations.map((allocation, index) => (
            <motion.div
              key={allocation.chamber}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-black/30 border border-purple-500/30 rounded-lg p-6 hover:border-purple-400/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(allocation.allocated, allocation.efficiency)}`}></div>
                  <h3 className="text-lg font-semibold text-purple-300">{allocation.chamber}</h3>
                </div>
                <div className={`text-sm font-medium ${getEfficiencyColor(allocation.efficiency)}`}>
                  {(allocation.efficiency * 100).toFixed(1)}% efficiency
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Energy Allocation</span>
                    <span>{allocation.allocated}% / {allocation.maximum}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                    <motion.div
                      className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(allocation.allocated / allocation.maximum) * 100}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                  </div>
                  
                  {user.accessLevel !== 'guest' && (
                    <input
                      type="range"
                      min="0"
                      max={allocation.maximum}
                      value={allocation.allocated}
                      onChange={(e) => handleSliderChange(allocation.chamber, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Power Draw:</span>
                    <div className="text-white font-medium">{(allocation.allocated * 2.5).toFixed(1)} MW</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Output:</span>
                    <div className="text-white font-medium">{(allocation.allocated * allocation.efficiency * 2.5).toFixed(1)} MW</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Energy Flow Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/30 border border-purple-500/30 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-purple-300 mb-4">Energy Flow Matrix</h3>
          <div className="relative h-64 bg-black/20 rounded-lg overflow-hidden">
            <div className="absolute inset-0 energy-flow-visualization">
              {energyAllocations.map((allocation, index) => (
                <motion.div
                  key={allocation.chamber}
                  className="absolute w-2 h-2 bg-purple-400 rounded-full"
                  animate={{
                    x: [0, 200, 400, 200, 0],
                    y: [50 + index * 30, 100, 150, 200, 50 + index * 30],
                    scale: [1, 1.5, 1, 1.5, 1],
                    opacity: [0.5, 1, 0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 4 + index,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-300">
                  {totalAllocated} MW
                </div>
                <div className="text-sm text-gray-400">Total Active Power</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EnergyManager;