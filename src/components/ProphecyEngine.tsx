import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crystal, Sparkles, Eye, RefreshCw, BookOpen, AlertTriangle } from 'lucide-react';
import { SystemNotification } from './MagicalOS';

interface User {
  username: string;
  accessLevel: 'root' | 'executor' | 'guest';
  authenticated: boolean;
}

interface ProphecyEngineProps {
  user: User;
  onNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp'>) => void;
}

interface Prophecy {
  id: string;
  title: string;
  content: string;
  type: 'warning' | 'opportunity' | 'transformation' | 'dimensional' | 'temporal';
  probability: number;
  timeframe: string;
  chamber?: string;
  entities: string[];
  generated: Date;
  status: 'active' | 'fulfilled' | 'averted' | 'expired';
}

interface DivineInsight {
  id: string;
  category: 'past' | 'present' | 'future';
  insight: string;
  relevance: number;
  timestamp: Date;
}

const ProphecyEngine: React.FC<ProphecyEngineProps> = ({ user, onNotification }) => {
  const [prophecies, setProphecies] = useState<Prophecy[]>([]);
  const [insights, setInsights] = useState<DivineInsight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProphecy, setSelectedProphecy] = useState<Prophecy | null>(null);
  const [activeTab, setActiveTab] = useState<'prophecies' | 'insights'>('prophecies');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    // Initialize with sample prophecies
    const sampleProphecies: Prophecy[] = [
      {
        id: '1',
        title: 'The Convergence of Mirrors',
        content: 'When the twin moons align with the Void Nexus, a great reflection shall shatter the boundaries between realms. The Mirror Maze will reveal its deepest secrets, but beware - what is reflected may not be what was intended.',
        type: 'dimensional',
        probability: 87,
        timeframe: 'Within 7 cycles',
        chamber: 'Mirror Maze',
        entities: ['Gambitflare', 'Valtharix'],
        generated: new Date(Date.now() - 86400000),
        status: 'active'
      },
      {
        id: '2',
        title: 'The Dragon\'s Ascension',
        content: 'A warrior of flame shall undergo the ultimate transformation, transcending mortal limitations. The Ember Ring will burn brighter than ever before, but the price of power may be higher than anticipated.',
        type: 'transformation',
        probability: 73,
        timeframe: 'Within 3 cycles',
        chamber: 'Ember Ring',
        entities: ['Hakari'],
        generated: new Date(Date.now() - 172800000),
        status: 'active'
      },
      {
        id: '3',
        title: 'The Void\'s Whisper',
        content: 'Ancient memories stir in the depths of nothingness. The lost one\'s essence may yet be recovered, but the ritual requires a sacrifice of equal magnitude. The past seeks to reclaim what was taken.',
        type: 'warning',
        probability: 45,
        timeframe: 'Uncertain',
        chamber: 'Void Nexus',
        entities: ['Seraphina', 'Valtharix'],
        generated: new Date(Date.now() - 259200000),
        status: 'active'
      }
    ];

    const sampleInsights: DivineInsight[] = [
      {
        id: '1',
        category: 'future',
        insight: 'The energy patterns suggest a major transformation event approaching within the next lunar cycle',
        relevance: 92,
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: '2',
        category: 'present',
        insight: 'Current dimensional stability is at 94% - optimal conditions for advanced rituals',
        relevance: 88,
        timestamp: new Date(Date.now() - 7200000)
      },
      {
        id: '3',
        category: 'past',
        insight: 'The Seraphina incident created temporal echoes that still resonate through the Void Nexus',
        relevance: 76,
        timestamp: new Date(Date.now() - 10800000)
      }
    ];

    setProphecies(sampleProphecies);
    setInsights(sampleInsights);
  }, []);

  const generateNewProphecy = async () => {
    if (user.accessLevel === 'guest') {
      onNotification({
        type: 'error',
        title: 'Access Denied',
        message: 'Prophecy generation requires EXECUTOR access or higher'
      });
      return;
    }

    setIsGenerating(true);

    // Simulate prophecy generation delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    const prophecyTemplates = [
      {
        title: 'The Prism\'s Revelation',
        content: 'Light shall bend in ways unseen, revealing hidden truths within the crystalline chambers. A new form of transformation awaits discovery.',
        type: 'opportunity' as const,
        chamber: 'Prism Atrium'
      },
      {
        title: 'The Memory\'s Echo',
        content: 'Ancient knowledge stirs within the sanctum. Past experiences shall guide future transformations, but old wounds may reopen.',
        type: 'temporal' as const,
        chamber: 'Memory Sanctum'
      },
      {
        title: 'The Duel\'s Outcome',
        content: 'A great battle approaches between reflection and reality. The victor shall determine the fate of the mirror realm.',
        type: 'warning' as const,
        chamber: 'Mirror Maze'
      },
      {
        title: 'The Soul\'s Journey',
        content: 'A registered entity shall undergo unexpected evolution. The transformation will challenge the very nature of identity.',
        type: 'transformation' as const,
        chamber: 'Metamorphic Conclave'
      }
    ];

    const template = prophecyTemplates[Math.floor(Math.random() * prophecyTemplates.length)];
    const entities = ['Hakari', 'Gambitflare', 'Valtharix', 'Unknown Entity'];
    const selectedEntities = entities.slice(0, Math.floor(Math.random() * 2) + 1);

    const newProphecy: Prophecy = {
      id: Date.now().toString(),
      title: template.title,
      content: template.content,
      type: template.type,
      probability: Math.floor(Math.random() * 40) + 50,
      timeframe: `Within ${Math.floor(Math.random() * 10) + 1} cycles`,
      chamber: template.chamber,
      entities: selectedEntities,
      generated: new Date(),
      status: 'active'
    };

    setProphecies(prev => [newProphecy, ...prev]);
    setIsGenerating(false);

    onNotification({
      type: 'success',
      title: 'Prophecy Generated',
      message: `New vision received: "${newProphecy.title}"`,
      chamber: newProphecy.chamber
    });

    // Generate accompanying insight
    const newInsight: DivineInsight = {
      id: Date.now().toString() + '_insight',
      category: 'future',
      insight: `The cosmic forces align to reveal: ${newProphecy.title.toLowerCase()} holds significant implications for the bastion's future`,
      relevance: newProphecy.probability,
      timestamp: new Date()
    };

    setInsights(prev => [newInsight, ...prev.slice(0, 9)]);
  };

  const updateProphecyStatus = (prophecyId: string, newStatus: Prophecy['status']) => {
    if (user.accessLevel === 'guest') {
      onNotification({
        type: 'error',
        title: 'Access Denied',
        message: 'Prophecy status modification requires EXECUTOR access or higher'
      });
      return;
    }

    setProphecies(prev => prev.map(p => 
      p.id === prophecyId ? { ...p, status: newStatus } : p
    ));

    onNotification({
      type: 'info',
      title: 'Prophecy Updated',
      message: `Prophecy status changed to ${newStatus}`
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-red-400 bg-red-400/20';
      case 'opportunity': return 'text-green-400 bg-green-400/20';
      case 'transformation': return 'text-purple-400 bg-purple-400/20';
      case 'dimensional': return 'text-blue-400 bg-blue-400/20';
      case 'temporal': return 'text-yellow-400 bg-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'fulfilled': return 'text-blue-400';
      case 'averted': return 'text-yellow-400';
      case 'expired': return 'text-gray-400';
      default: return 'text-purple-400';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-red-400';
    if (probability >= 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getFilteredProphecies = () => {
    if (filterType === 'all') return prophecies;
    return prophecies.filter(p => p.type === filterType);
  };

  return (
    <div className="h-full flex bg-black/20 backdrop-blur-sm">
      {/* Main Prophecy Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Crystal className="w-8 h-8 text-purple-400" />
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Prophecy Engine
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('prophecies')}
                className={`px-4 py-2 rounded transition-colors ${
                  activeTab === 'prophecies'
                    ? 'bg-purple-500/30 text-purple-300 border border-purple-400/50'
                    : 'bg-black/30 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20'
                }`}
              >
                <Eye size={16} className="inline mr-2" />
                Prophecies ({prophecies.length})
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`px-4 py-2 rounded transition-colors ${
                  activeTab === 'insights'
                    ? 'bg-purple-500/30 text-purple-300 border border-purple-400/50'
                    : 'bg-black/30 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20'
                }`}
              >
                <Sparkles size={16} className="inline mr-2" />
                Insights ({insights.length})
              </button>
            </div>
            
            {user.accessLevel !== 'guest' && (
              <button
                onClick={generateNewProphecy}
                disabled={isGenerating}
                className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded text-purple-300 hover:bg-purple-600/30 transition-colors disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={16} className="inline mr-2 animate-spin" />
                    Channeling...
                  </>
                ) : (
                  <>
                    <Crystal size={16} className="inline mr-2" />
                    Divine Vision
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'prophecies' ? (
            <motion.div
              key="prophecies"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Filters */}
              <div className="flex items-center space-x-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 bg-black/30 border border-purple-500/30 rounded text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="all">All Types</option>
                  <option value="warning">Warnings</option>
                  <option value="opportunity">Opportunities</option>
                  <option value="transformation">Transformations</option>
                  <option value="dimensional">Dimensional</option>
                  <option value="temporal">Temporal</option>
                </select>
                
                <div className="text-sm text-purple-300">
                  {getFilteredProphecies().length} prophecies
                </div>
              </div>

              {/* Prophecy Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatePresence>
                  {getFilteredProphecies().map((prophecy) => (
                    <motion.div
                      key={prophecy.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-black/30 border border-purple-500/30 rounded-lg p-6 hover:border-purple-400/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedProphecy(prophecy)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-purple-300 mb-2">
                            {prophecy.title}
                          </h3>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs ${getTypeColor(prophecy.type)}`}>
                              {prophecy.type}
                            </span>
                            <span className={`text-sm ${getStatusColor(prophecy.status)}`}>
                              {prophecy.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getProbabilityColor(prophecy.probability)}`}>
                            {prophecy.probability}%
                          </div>
                          <div className="text-xs text-gray-400">probability</div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-4 line-clamp-3">
                        {prophecy.content}
                      </p>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Timeframe:</span>
                          <span className="text-white">{prophecy.timeframe}</span>
                        </div>
                        {prophecy.chamber && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Chamber:</span>
                            <span className="text-white">{prophecy.chamber}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-400">Entities:</span>
                          <span className="text-white">{prophecy.entities.join(', ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Generated:</span>
                          <span className="text-white">{prophecy.generated.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {getFilteredProphecies().length === 0 && (
                <div className="text-center py-12 text-purple-400/50">
                  <Crystal size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No prophecies found. Generate new visions to see the future.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {insights.length === 0 ? (
                <div className="text-center py-12 text-purple-400/50">
                  <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No divine insights available. Generate prophecies to receive guidance.</p>
                </div>
              ) : (
                insights.map((insight) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-black/30 border border-purple-500/30 rounded-lg p-4 hover:border-purple-400/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          insight.category === 'future' ? 'bg-blue-400/20 text-blue-400' :
                          insight.category === 'present' ? 'bg-green-400/20 text-green-400' :
                          'bg-yellow-400/20 text-yellow-400'
                        }`}>
                          {insight.category}
                        </span>
                        <span className="text-sm text-gray-400">
                          {insight.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-purple-300">
                          {insight.relevance}%
                        </div>
                        <div className="text-xs text-gray-400">relevance</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">{insight.insight}</p>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Prophecy Details Panel */}
      <AnimatePresence>
        {selectedProphecy && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="w-96 bg-black/30 border-l border-purple-500/30 backdrop-blur-sm p-6 overflow-y-auto"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-purple-300">{selectedProphecy.title}</h3>
                <button
                  onClick={() => setSelectedProphecy(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Prophecy Content */}
              <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-purple-400 mb-3">Divine Vision</h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {selectedProphecy.content}
                </p>
              </div>

              {/* Prophecy Details */}
              <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-blue-400 mb-3">Prophecy Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className={`px-2 py-1 rounded text-xs ${getTypeColor(selectedProphecy.type)}`}>
                      {selectedProphecy.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Probability:</span>
                    <span className={`font-bold ${getProbabilityColor(selectedProphecy.probability)}`}>
                      {selectedProphecy.probability}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Timeframe:</span>
                    <span className="text-white">{selectedProphecy.timeframe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`${getStatusColor(selectedProphecy.status)}`}>
                      {selectedProphecy.status}
                    </span>
                  </div>
                  {selectedProphecy.chamber && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Chamber:</span>
                      <span className="text-white">{selectedProphecy.chamber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Generated:</span>
                    <span className="text-white">{selectedProphecy.generated.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Involved Entities */}
              <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-green-400 mb-3">Involved Entities</h4>
                <div className="space-y-2">
                  {selectedProphecy.entities.map((entity, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-black/20 rounded">
                      <span className="text-lg">👤</span>
                      <span className="text-purple-300">{entity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Actions */}
              {user.accessLevel !== 'guest' && selectedProphecy.status === 'active' && (
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-orange-400 mb-3">Update Status</h4>
                  <button
                    onClick={() => updateProphecyStatus(selectedProphecy.id, 'fulfilled')}
                    className="w-full py-2 bg-blue-600/20 border border-blue-500/30 rounded text-blue-300 hover:bg-blue-600/30 transition-colors"
                  >
                    Mark as Fulfilled
                  </button>
                  <button
                    onClick={() => updateProphecyStatus(selectedProphecy.id, 'averted')}
                    className="w-full py-2 bg-yellow-600/20 border border-yellow-500/30 rounded text-yellow-300 hover:bg-yellow-600/30 transition-colors"
                  >
                    Mark as Averted
                  </button>
                  <button
                    onClick={() => updateProphecyStatus(selectedProphecy.id, 'expired')}
                    className="w-full py-2 bg-gray-600/20 border border-gray-500/30 rounded text-gray-300 hover:bg-gray-600/30 transition-colors"
                  >
                    Mark as Expired
                  </button>
                </div>
              )}

              {/* Warning for High Probability */}
              {selectedProphecy.probability >= 80 && selectedProphecy.type === 'warning' && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <h4 className="text-lg font-semibold text-red-400">High Priority Warning</h4>
                  </div>
                  <p className="text-sm text-red-300">
                    This prophecy has a high probability of occurrence and requires immediate attention.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProphecyEngine;