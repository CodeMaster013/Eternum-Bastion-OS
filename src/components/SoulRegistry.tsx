import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Plus, Eye, Edit, Trash2, History, Filter } from 'lucide-react';
import { SystemNotification } from './MagicalOS';

interface User {
  username: string;
  accessLevel: 'root' | 'executor' | 'guest';
  authenticated: boolean;
}

interface SoulRegistryProps {
  user: User;
  onNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp'>) => void;
}

interface SoulEntity {
  id: string;
  name: string;
  originalForm: string;
  currentForm: string;
  transformationHistory: TransformationRecord[];
  status: 'active' | 'dormant' | 'transformed' | 'archived';
  chamber: string;
  energySignature: number;
  stability: number;
  created: Date;
  lastModified: Date;
  notes: string;
  accessLevel: 'public' | 'restricted' | 'classified';
}

interface TransformationRecord {
  id: string;
  fromForm: string;
  toForm: string;
  timestamp: Date;
  chamber: string;
  operator: string;
  success: boolean;
  notes: string;
}

const SoulRegistry: React.FC<SoulRegistryProps> = ({ user, onNotification }) => {
  const [souls, setSouls] = useState<SoulEntity[]>([]);
  const [selectedSoul, setSelectedSoul] = useState<SoulEntity | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAccess, setFilterAccess] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSoul, setNewSoul] = useState({
    name: '',
    originalForm: '',
    chamber: 'Prism Atrium',
    notes: ''
  });

  useEffect(() => {
    // Initialize with sample data
    const sampleSouls: SoulEntity[] = [
      {
        id: '1',
        name: 'Hakari',
        originalForm: 'Human Warrior',
        currentForm: 'Draconic Hybrid',
        transformationHistory: [
          {
            id: 'th1',
            fromForm: 'Human Warrior',
            toForm: 'Draconic Hybrid',
            timestamp: new Date(Date.now() - 86400000),
            chamber: 'Metamorphic Conclave',
            operator: 'Valtharix',
            success: true,
            notes: 'Successful draconic enhancement ritual'
          }
        ],
        status: 'active',
        chamber: 'Ember Ring',
        energySignature: 87,
        stability: 92,
        created: new Date(Date.now() - 604800000),
        lastModified: new Date(Date.now() - 86400000),
        notes: 'Elite warrior enhanced with draconic essence',
        accessLevel: 'public'
      },
      {
        id: '2',
        name: 'Gambitflare',
        originalForm: 'Elemental Spirit',
        currentForm: 'Mirror Entity',
        transformationHistory: [
          {
            id: 'th2',
            fromForm: 'Elemental Spirit',
            toForm: 'Mirror Entity',
            timestamp: new Date(Date.now() - 172800000),
            chamber: 'Mirror Maze',
            operator: 'Valtharix',
            success: true,
            notes: 'Reflection duel preparation transformation'
          }
        ],
        status: 'transformed',
        chamber: 'Mirror Maze',
        energySignature: 94,
        stability: 88,
        created: new Date(Date.now() - 1209600000),
        lastModified: new Date(Date.now() - 172800000),
        notes: 'Specialized for mirror realm combat',
        accessLevel: 'restricted'
      },
      {
        id: '3',
        name: 'Seraphina',
        originalForm: 'Celestial Being',
        currentForm: 'Lost Reflection',
        transformationHistory: [
          {
            id: 'th3',
            fromForm: 'Celestial Being',
            toForm: 'Lost Reflection',
            timestamp: new Date(Date.now() - 31536000000),
            chamber: 'Void Nexus',
            operator: 'Unknown',
            success: false,
            notes: 'Transformation failed - entity lost to void'
          }
        ],
        status: 'archived',
        chamber: 'Void Nexus',
        energySignature: 12,
        stability: 23,
        created: new Date(Date.now() - 31536000000),
        lastModified: new Date(Date.now() - 31536000000),
        notes: 'CLASSIFIED: Void incident - deepest regret',
        accessLevel: 'classified'
      }
    ];

    setSouls(sampleSouls);
  }, []);

  const getAccessibleSouls = () => {
    return souls.filter(soul => {
      if (soul.accessLevel === 'public') return true;
      if (soul.accessLevel === 'restricted') return user.accessLevel !== 'guest';
      if (soul.accessLevel === 'classified') return user.accessLevel === 'root';
      return false;
    });
  };

  const getFilteredSouls = () => {
    let filtered = getAccessibleSouls();

    if (searchTerm) {
      filtered = filtered.filter(soul =>
        soul.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        soul.originalForm.toLowerCase().includes(searchTerm.toLowerCase()) ||
        soul.currentForm.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(soul => soul.status === filterStatus);
    }

    if (filterAccess !== 'all') {
      filtered = filtered.filter(soul => soul.accessLevel === filterAccess);
    }

    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20';
      case 'dormant': return 'text-yellow-400 bg-yellow-400/20';
      case 'transformed': return 'text-blue-400 bg-blue-400/20';
      case 'archived': return 'text-gray-400 bg-gray-400/20';
      default: return 'text-purple-400 bg-purple-400/20';
    }
  };

  const getAccessColor = (access: string) => {
    switch (access) {
      case 'public': return 'text-green-400';
      case 'restricted': return 'text-yellow-400';
      case 'classified': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const addNewSoul = () => {
    if (user.accessLevel === 'guest') {
      onNotification({
        type: 'error',
        title: 'Access Denied',
        message: 'Soul registry modification requires EXECUTOR access or higher'
      });
      return;
    }

    if (!newSoul.name || !newSoul.originalForm) {
      onNotification({
        type: 'error',
        title: 'Invalid Data',
        message: 'Name and original form are required'
      });
      return;
    }

    const soul: SoulEntity = {
      id: Date.now().toString(),
      name: newSoul.name,
      originalForm: newSoul.originalForm,
      currentForm: newSoul.originalForm,
      transformationHistory: [],
      status: 'active',
      chamber: newSoul.chamber,
      energySignature: Math.floor(Math.random() * 40) + 60,
      stability: Math.floor(Math.random() * 20) + 80,
      created: new Date(),
      lastModified: new Date(),
      notes: newSoul.notes,
      accessLevel: user.accessLevel === 'root' ? 'public' : 'restricted'
    };

    setSouls(prev => [soul, ...prev]);
    setNewSoul({ name: '', originalForm: '', chamber: 'Prism Atrium', notes: '' });
    setShowAddModal(false);

    onNotification({
      type: 'success',
      title: 'Soul Registered',
      message: `${soul.name} has been added to the registry`
    });
  };

  const deleteSoul = (soulId: string) => {
    if (user.accessLevel !== 'root') {
      onNotification({
        type: 'error',
        title: 'Access Denied',
        message: 'Soul deletion requires ROOT access'
      });
      return;
    }

    setSouls(prev => prev.filter(s => s.id !== soulId));
    setSelectedSoul(null);

    onNotification({
      type: 'warning',
      title: 'Soul Deleted',
      message: 'Entity removed from registry'
    });
  };

  const simulateTransformation = (soul: SoulEntity) => {
    if (user.accessLevel === 'guest') {
      onNotification({
        type: 'error',
        title: 'Access Denied',
        message: 'Transformation simulation requires EXECUTOR access or higher'
      });
      return;
    }

    const forms = ['Draconic Hybrid', 'Elemental Avatar', 'Shadow Wraith', 'Crystal Golem', 'Void Walker'];
    const newForm = forms[Math.floor(Math.random() * forms.length)];
    const success = Math.random() > 0.2; // 80% success rate

    const transformationRecord: TransformationRecord = {
      id: Date.now().toString(),
      fromForm: soul.currentForm,
      toForm: newForm,
      timestamp: new Date(),
      chamber: soul.chamber,
      operator: user.username,
      success,
      notes: success ? 'Transformation completed successfully' : 'Transformation failed - stability issues'
    };

    const updatedSoul = {
      ...soul,
      currentForm: success ? newForm : soul.currentForm,
      transformationHistory: [transformationRecord, ...soul.transformationHistory],
      status: success ? 'transformed' as const : soul.status,
      stability: success ? Math.max(20, soul.stability - 10) : Math.max(10, soul.stability - 20),
      lastModified: new Date()
    };

    setSouls(prev => prev.map(s => s.id === soul.id ? updatedSoul : s));
    setSelectedSoul(updatedSoul);

    onNotification({
      type: success ? 'success' : 'error',
      title: success ? 'Transformation Successful' : 'Transformation Failed',
      message: success 
        ? `${soul.name} transformed from ${soul.currentForm} to ${newForm}`
        : `Transformation of ${soul.name} failed due to stability issues`,
      chamber: soul.chamber
    });
  };

  const filteredSouls = getFilteredSouls();

  return (
    <div className="h-full flex bg-black/20 backdrop-blur-sm">
      {/* Main Registry */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-purple-400" />
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Soul Registry
            </h2>
          </div>
          
          {user.accessLevel !== 'guest' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded text-purple-300 hover:bg-purple-600/30 transition-colors"
            >
              <Plus size={16} className="inline mr-2" />
              Register Soul
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/30 border border-purple-500/30 rounded text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
              placeholder="Search souls..."
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-black/30 border border-purple-500/30 rounded text-white focus:outline-none focus:border-purple-400"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="dormant">Dormant</option>
            <option value="transformed">Transformed</option>
            <option value="archived">Archived</option>
          </select>
          
          <select
            value={filterAccess}
            onChange={(e) => setFilterAccess(e.target.value)}
            className="px-3 py-2 bg-black/30 border border-purple-500/30 rounded text-white focus:outline-none focus:border-purple-400"
          >
            <option value="all">All Access</option>
            <option value="public">Public</option>
            <option value="restricted">Restricted</option>
            {user.accessLevel === 'root' && <option value="classified">Classified</option>}
          </select>
          
          <div className="text-sm text-purple-300 flex items-center">
            <Filter size={16} className="mr-2" />
            {filteredSouls.length} of {getAccessibleSouls().length} souls
          </div>
        </div>

        {/* Soul Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredSouls.map((soul) => (
              <motion.div
                key={soul.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-black/30 border border-purple-500/30 rounded-lg p-4 hover:border-purple-400/50 transition-colors cursor-pointer"
                onClick={() => setSelectedSoul(soul)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-purple-300">{soul.name}</h3>
                    <p className="text-sm text-gray-400">{soul.chamber}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(soul.status)}`}>
                      {soul.status}
                    </span>
                    <span className={`text-xs ${getAccessColor(soul.accessLevel)}`}>
                      {soul.accessLevel === 'classified' ? '🔒' : soul.accessLevel === 'restricted' ? '⚠️' : '🔓'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Original:</span>
                    <span className="text-white ml-2">{soul.originalForm}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Current:</span>
                    <span className="text-white ml-2">{soul.currentForm}</span>
                  </div>
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-gray-400">Energy</div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-1">
                        <div
                          className="h-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${soul.energySignature}%` }}
                        />
                      </div>
                      <span className="text-xs text-white">{soul.energySignature}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Stability</div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-1">
                        <div
                          className="h-1 rounded-full bg-gradient-to-r from-blue-500 to-green-500"
                          style={{ width: `${soul.stability}%` }}
                        />
                      </div>
                      <span className="text-xs text-white">{soul.stability}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-gray-400">
                  {soul.transformationHistory.length} transformations
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredSouls.length === 0 && (
          <div className="text-center py-12 text-purple-400/50">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p>No souls found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Soul Details Panel */}
      <AnimatePresence>
        {selectedSoul && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="w-96 bg-black/30 border-l border-purple-500/30 backdrop-blur-sm p-6 overflow-y-auto"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-purple-300">{selectedSoul.name}</h3>
                <button
                  onClick={() => setSelectedSoul(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Basic Info */}
              <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-purple-400 mb-3">Entity Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Original Form:</span>
                    <span className="text-white">{selectedSoul.originalForm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Form:</span>
                    <span className="text-white">{selectedSoul.currentForm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`${getStatusColor(selectedSoul.status)} px-2 py-1 rounded text-xs`}>
                      {selectedSoul.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Chamber:</span>
                    <span className="text-white">{selectedSoul.chamber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created:</span>
                    <span className="text-white">{selectedSoul.created.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Vital Signs */}
              <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-orange-400 mb-3">Vital Signs</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Energy Signature</span>
                      <span className="text-white">{selectedSoul.energySignature}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${selectedSoul.energySignature}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Stability</span>
                      <span className="text-white">{selectedSoul.stability}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500"
                        style={{ width: `${selectedSoul.stability}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Transformation History */}
              <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
                  <History size={16} className="mr-2" />
                  Transformation History
                </h4>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {selectedSoul.transformationHistory.length === 0 ? (
                    <p className="text-gray-400 text-sm">No transformations recorded</p>
                  ) : (
                    selectedSoul.transformationHistory.map((record) => (
                      <div key={record.id} className="bg-black/20 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs px-2 py-1 rounded ${record.success ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'}`}>
                            {record.success ? 'Success' : 'Failed'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {record.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm">
                          <div className="text-gray-400">
                            {record.fromForm} → {record.toForm}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {record.chamber} • {record.operator}
                          </div>
                          {record.notes && (
                            <div className="text-xs text-purple-300 mt-1">
                              {record.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedSoul.notes && (
                <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-400 mb-3">Notes</h4>
                  <p className="text-sm text-gray-300">{selectedSoul.notes}</p>
                </div>
              )}

              {/* Actions */}
              {user.accessLevel !== 'guest' && (
                <div className="space-y-2">
                  <button
                    onClick={() => simulateTransformation(selectedSoul)}
                    className="w-full py-2 bg-purple-600/20 border border-purple-500/30 rounded text-purple-300 hover:bg-purple-600/30 transition-colors"
                  >
                    Simulate Transformation
                  </button>
                  {user.accessLevel === 'root' && (
                    <button
                      onClick={() => deleteSoul(selectedSoul.id)}
                      className="w-full py-2 bg-red-600/20 border border-red-500/30 rounded text-red-300 hover:bg-red-600/30 transition-colors"
                    >
                      <Trash2 size={16} className="inline mr-2" />
                      Delete Soul
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Soul Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/80 border border-purple-500/30 rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-purple-300 mb-4">Register New Soul</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-purple-300 text-sm font-medium mb-2">
                    Entity Name
                  </label>
                  <input
                    type="text"
                    value={newSoul.name}
                    onChange={(e) => setNewSoul(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 bg-black/30 border border-purple-500/30 rounded text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
                    placeholder="Enter entity name..."
                  />
                </div>
                
                <div>
                  <label className="block text-purple-300 text-sm font-medium mb-2">
                    Original Form
                  </label>
                  <input
                    type="text"
                    value={newSoul.originalForm}
                    onChange={(e) => setNewSoul(prev => ({ ...prev, originalForm: e.target.value }))}
                    className="w-full px-4 py-2 bg-black/30 border border-purple-500/30 rounded text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
                    placeholder="Enter original form..."
                  />
                </div>
                
                <div>
                  <label className="block text-purple-300 text-sm font-medium mb-2">
                    Chamber Assignment
                  </label>
                  <select
                    value={newSoul.chamber}
                    onChange={(e) => setNewSoul(prev => ({ ...prev, chamber: e.target.value }))}
                    className="w-full px-4 py-2 bg-black/30 border border-purple-500/30 rounded text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="Prism Atrium">Prism Atrium</option>
                    <option value="Metamorphic Conclave">Metamorphic Conclave</option>
                    <option value="Ember Ring">Ember Ring</option>
                    <option value="Memory Sanctum">Memory Sanctum</option>
                    <option value="Mirror Maze">Mirror Maze</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-purple-300 text-sm font-medium mb-2">
                    Notes
                  </label>
                  <textarea
                    value={newSoul.notes}
                    onChange={(e) => setNewSoul(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-4 py-2 bg-black/30 border border-purple-500/30 rounded text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 h-20 resize-none"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={addNewSoul}
                  className="flex-1 py-2 bg-purple-600/20 border border-purple-500/30 rounded text-purple-300 hover:bg-purple-600/30 transition-colors"
                >
                  Register Soul
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-gray-600/20 border border-gray-500/30 rounded text-gray-300 hover:bg-gray-600/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SoulRegistry;