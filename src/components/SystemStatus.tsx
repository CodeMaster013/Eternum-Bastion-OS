import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, Shield, Database, Cpu, HardDrive, AlertTriangle, TrendingUp } from 'lucide-react';
import { EnergyAllocation } from './MagicalOS';

interface User {
  username: string;
  accessLevel: 'root' | 'executor' | 'guest';
  authenticated: boolean;
}

interface SystemStatusProps {
  user: User;
  energyAllocations: EnergyAllocation[];
}

interface SystemMetric {
  name: string;
  value: number;
  status: 'optimal' | 'warning' | 'critical';
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'stable';
}

const SystemStatus: React.FC<SystemStatusProps> = ({ user, energyAllocations }) => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    { name: 'Aether Flow', value: 87, status: 'optimal', icon: <Zap size={16} />, trend: 'stable' },
    { name: 'Sigil Resonance', value: 92, status: 'optimal', icon: <Activity size={16} />, trend: 'up' },
    { name: 'Ward Integrity', value: 76, status: 'warning', icon: <Shield size={16} />, trend: 'down' },
    { name: 'Memory Crystals', value: 89, status: 'optimal', icon: <Database size={16} />, trend: 'stable' },
    { name: 'Prism Alignment', value: 95, status: 'optimal', icon: <Cpu size={16} />, trend: 'up' },
    { name: 'Void Containment', value: 42, status: 'critical', icon: <HardDrive size={16} />, trend: 'down' },
  ]);

  const [recentActivity, setRecentActivity] = useState([
    { time: '14:32:07', event: 'Transformation ritual completed in Chamber 7', type: 'success' },
    { time: '14:31:42', event: 'Memory synchronization initiated', type: 'info' },
    { time: '14:30:15', event: 'Ward fluctuation detected in Sector 3', type: 'warning' },
    { time: '14:29:33', event: 'Duel reflection activated: Hakari vs Gambitflare', type: 'info' },
    { time: '14:28:09', event: 'Void containment breach - Level 2', type: 'error' },
  ]);

  const [systemAlerts, setSystemAlerts] = useState([
    { id: '1', severity: 'high', message: 'Void Nexus containment at critical levels', chamber: 'Void Nexus' },
    { id: '2', severity: 'medium', message: 'Ward integrity fluctuation in Sector 3', chamber: 'Prism Atrium' },
    { id: '3', severity: 'low', message: 'Routine maintenance due for Memory Sanctum', chamber: 'Memory Sanctum' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => {
        let change = (Math.random() - 0.5) * 10;
        
        // Apply trend influence
        if (metric.trend === 'up') change += 2;
        if (metric.trend === 'down') change -= 2;
        
        const newValue = Math.max(0, Math.min(100, metric.value + change));
        const newStatus = newValue >= 80 ? 'optimal' : newValue >= 50 ? 'warning' : 'critical';
        const newTrend = change > 1 ? 'up' : change < -1 ? 'down' : 'stable';
        
        return {
          ...metric,
          value: newValue,
          status: newStatus,
          trend: newTrend
        };
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Add new activity periodically
    const activityTimer = setInterval(() => {
      if (Math.random() < 0.3) {
        const events = [
          'Dimensional gateway stabilized',
          'Energy reallocation completed',
          'Soul registry updated',
          'Prophecy engine generated new vision',
          'Spell crafting session initiated',
          'Chamber synchronization verified'
        ];
        
        const newActivity = {
          time: new Date().toLocaleTimeString(),
          event: events[Math.floor(Math.random() * events.length)],
          type: Math.random() > 0.7 ? 'warning' : Math.random() > 0.5 ? 'success' : 'info'
        };
        
        setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]);
      }
    }, 10000);

    return () => clearInterval(activityTimer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'info': return 'text-blue-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={12} className="text-green-400" />;
      case 'down': return <TrendingUp size={12} className="text-red-400 rotate-180" />;
      default: return <div className="w-3 h-0.5 bg-gray-400"></div>;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-500/50 bg-red-900/20 text-red-300';
      case 'medium': return 'border-yellow-500/50 bg-yellow-900/20 text-yellow-300';
      case 'low': return 'border-blue-500/50 bg-blue-900/20 text-blue-300';
      default: return 'border-gray-500/50 bg-gray-900/20 text-gray-300';
    }
  };

  const totalEnergyUsage = energyAllocations.reduce((sum, allocation) => sum + allocation.allocated, 0);
  const averageEfficiency = energyAllocations.reduce((sum, allocation) => sum + allocation.efficiency, 0) / energyAllocations.length;

  return (
    <div className="h-full p-4 space-y-6 overflow-y-auto">
      {/* System Overview */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/30 rounded-lg p-4 border border-purple-500/20"
      >
        <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center">
          <Activity size={20} className="mr-2" />
          System Overview
        </h3>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-black/20 rounded p-2">
            <div className="text-gray-400">Total Energy</div>
            <div className="text-white font-bold">{totalEnergyUsage}%</div>
          </div>
          <div className="bg-black/20 rounded p-2">
            <div className="text-gray-400">Efficiency</div>
            <div className="text-white font-bold">{(averageEfficiency * 100).toFixed(1)}%</div>
          </div>
          <div className="bg-black/20 rounded p-2">
            <div className="text-gray-400">Active Chambers</div>
            <div className="text-white font-bold">{energyAllocations.filter(e => e.allocated > 30).length}</div>
          </div>
          <div className="bg-black/20 rounded p-2">
            <div className="text-gray-400">Alerts</div>
            <div className="text-white font-bold">{systemAlerts.length}</div>
          </div>
        </div>
      </motion.div>

      {/* System Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center">
          <Activity size={20} className="mr-2" />
          System Vitals
        </h3>
        <div className="space-y-3">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-black/30 rounded-lg p-3 border border-purple-500/20"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-purple-400">{metric.icon}</span>
                  <span className="text-sm text-purple-200">{metric.name}</span>
                  {getTrendIcon(metric.trend)}
                </div>
                <span className={`text-sm font-medium ${getStatusColor(metric.status)}`}>
                  {metric.value.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    metric.status === 'optimal' ? 'bg-green-500' :
                    metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* System Alerts */}
      <div>
        <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center">
          <AlertTriangle size={20} className="mr-2" />
          System Alerts
        </h3>
        <div className="space-y-2">
          {systemAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`border rounded-lg p-3 ${getAlertColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <AlertTriangle size={14} />
                    <span className="text-xs font-medium uppercase">{alert.severity} Priority</span>
                  </div>
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs opacity-70 mt-1">{alert.chamber}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Active Chambers */}
      <div>
        <h3 className="text-lg font-semibold text-purple-300 mb-4">Active Chambers</h3>
        <div className="space-y-2">
          {energyAllocations.map((allocation, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between bg-black/30 rounded-lg p-2 border border-purple-500/20"
            >
              <span className="text-sm text-purple-200">{allocation.chamber}</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  allocation.allocated > 70 ? 'bg-green-400 animate-pulse' : 
                  allocation.allocated > 30 ? 'bg-yellow-400' : 'bg-gray-400'
                }`}></div>
                <span className={`text-xs ${
                  allocation.allocated > 70 ? 'text-green-400' : 
                  allocation.allocated > 30 ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                  {allocation.allocated > 30 ? 'Active' : 'Standby'}
                </span>
                <span className="text-xs text-white">{allocation.allocated}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-purple-300 mb-4">Recent Activity</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {recentActivity.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-black/30 rounded-lg p-3 border border-purple-500/20"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`text-xs font-mono ${getActivityColor(activity.type)}`}>
                    [{activity.time}]
                  </p>
                  <p className="text-sm text-purple-200 mt-1">{activity.event}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      {user.accessLevel !== 'guest' && (
        <div>
          <h3 className="text-lg font-semibold text-purple-300 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-2 text-xs text-purple-300 hover:bg-purple-600/30 transition-colors"
            >
              System Scan
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-2 text-xs text-blue-300 hover:bg-blue-600/30 transition-colors"
            >
              Sync Prisms
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-green-600/20 border border-green-500/30 rounded-lg p-2 text-xs text-green-300 hover:bg-green-600/30 transition-colors"
            >
              Heal Wards
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-red-600/20 border border-red-500/30 rounded-lg p-2 text-xs text-red-300 hover:bg-red-600/30 transition-colors"
            >
              Emergency
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemStatus;