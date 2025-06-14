import React, { useState, useEffect } from 'react';
import { Activity, Zap, Shield, Database, Cpu, HardDrive } from 'lucide-react';

interface User {
  username: string;
  accessLevel: 'root' | 'executor' | 'guest';
  authenticated: boolean;
}

interface SystemStatusProps {
  user: User;
}

interface SystemMetric {
  name: string;
  value: number;
  status: 'optimal' | 'warning' | 'critical';
  icon: React.ReactNode;
}

const SystemStatus: React.FC<SystemStatusProps> = ({ user }) => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    { name: 'Aether Flow', value: 87, status: 'optimal', icon: <Zap size={16} /> },
    { name: 'Sigil Resonance', value: 92, status: 'optimal', icon: <Activity size={16} /> },
    { name: 'Ward Integrity', value: 76, status: 'warning', icon: <Shield size={16} /> },
    { name: 'Memory Crystals', value: 89, status: 'optimal', icon: <Database size={16} /> },
    { name: 'Prism Alignment', value: 95, status: 'optimal', icon: <Cpu size={16} /> },
    { name: 'Void Containment', value: 42, status: 'critical', icon: <HardDrive size={16} /> },
  ]);

  const [recentActivity, setRecentActivity] = useState([
    { time: '14:32:07', event: 'Transformation ritual completed in Chamber 7', type: 'success' },
    { time: '14:31:42', event: 'Memory synchronization initiated', type: 'info' },
    { time: '14:30:15', event: 'Ward fluctuation detected in Sector 3', type: 'warning' },
    { time: '14:29:33', event: 'Duel reflection activated: Hakari vs Gambitflare', type: 'info' },
    { time: '14:28:09', event: 'Void containment breach - Level 2', type: 'error' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 10))
      })));
    }, 3000);

    return () => clearInterval(interval);
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

  return (
    <div className="h-full p-4 space-y-6 overflow-y-auto">
      {/* System Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center">
          <Activity size={20} className="mr-2" />
          System Vitals
        </h3>
        <div className="space-y-3">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-black/30 rounded-lg p-3 border border-purple-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-purple-400">{metric.icon}</span>
                  <span className="text-sm text-purple-200">{metric.name}</span>
                </div>
                <span className={`text-sm font-medium ${getStatusColor(metric.status)}`}>
                  {metric.value.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    metric.status === 'optimal' ? 'bg-green-500' :
                    metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${metric.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Chambers */}
      <div>
        <h3 className="text-lg font-semibold text-purple-300 mb-4">Active Chambers</h3>
        <div className="space-y-2">
          {['Prism Atrium', 'Metamorphic Conclave', 'Ember Ring', 'Void Nexus'].map((chamber, index) => (
            <div key={index} className="flex items-center justify-between bg-black/30 rounded-lg p-2 border border-purple-500/20">
              <span className="text-sm text-purple-200">{chamber}</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${index % 2 === 0 ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                <span className={`text-xs ${index % 2 === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {index % 2 === 0 ? 'Active' : 'Standby'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-purple-300 mb-4">Recent Activity</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {recentActivity.map((activity, index) => (
            <div key={index} className="bg-black/30 rounded-lg p-3 border border-purple-500/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`text-xs font-mono ${getActivityColor(activity.type)}`}>
                    [{activity.time}]
                  </p>
                  <p className="text-sm text-purple-200 mt-1">{activity.event}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      {user.accessLevel !== 'guest' && (
        <div>
          <h3 className="text-lg font-semibold text-purple-300 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-2 text-xs text-purple-300 hover:bg-purple-600/30 transition-colors">
              System Scan
            </button>
            <button className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-2 text-xs text-blue-300 hover:bg-blue-600/30 transition-colors">
              Sync Prisms
            </button>
            <button className="bg-green-600/20 border border-green-500/30 rounded-lg p-2 text-xs text-green-300 hover:bg-green-600/30 transition-colors">
              Heal Wards
            </button>
            <button className="bg-red-600/20 border border-red-500/30 rounded-lg p-2 text-xs text-red-300 hover:bg-red-600/30 transition-colors">
              Emergency
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemStatus;