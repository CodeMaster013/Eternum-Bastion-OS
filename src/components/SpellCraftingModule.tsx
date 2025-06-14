import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Draggable from 'react-draggable';
import { Sparkles, Plus, Save, Play, Trash2, BookOpen } from 'lucide-react';
import { SystemNotification } from './MagicalOS';

interface User {
  username: string;
  accessLevel: 'root' | 'executor' | 'guest';
  authenticated: boolean;
}

interface SpellCraftingModuleProps {
  user: User;
  onNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp'>) => void;
}

interface Rune {
  id: string;
  name: string;
  symbol: string;
  type: 'element' | 'modifier' | 'target' | 'power';
  description: string;
  color: string;
  requiredAccess: 'root' | 'executor' | 'guest';
}

interface CraftedSpell {
  id: string;
  name: string;
  runes: Rune[];
  power: number;
  stability: number;
  description: string;
  created: Date;
}

const SpellCraftingModule: React.FC<SpellCraftingModuleProps> = ({ user, onNotification }) => {
  const [selectedRunes, setSelectedRunes] = useState<Rune[]>([]);
  const [craftedSpells, setCraftedSpells] = useState<CraftedSpell[]>([]);
  const [spellName, setSpellName] = useState('');
  const [activeTab, setActiveTab] = useState<'craft' | 'library'>('craft');
  const craftingAreaRef = useRef<HTMLDivElement>(null);

  const availableRunes: Rune[] = [
    // Element Runes
    { id: 'fire', name: 'Ignis', symbol: '🔥', type: 'element', description: 'Fire element - destruction and purification', color: 'text-red-400', requiredAccess: 'guest' },
    { id: 'water', name: 'Aqua', symbol: '💧', type: 'element', description: 'Water element - healing and flow', color: 'text-blue-400', requiredAccess: 'guest' },
    { id: 'earth', name: 'Terra', symbol: '🌍', type: 'element', description: 'Earth element - stability and growth', color: 'text-green-400', requiredAccess: 'guest' },
    { id: 'air', name: 'Ventus', symbol: '💨', type: 'element', description: 'Air element - speed and freedom', color: 'text-cyan-400', requiredAccess: 'guest' },
    { id: 'void', name: 'Nihil', symbol: '🕳️', type: 'element', description: 'Void element - erasure and negation', color: 'text-purple-400', requiredAccess: 'root' },
    { id: 'light', name: 'Lux', symbol: '✨', type: 'element', description: 'Light element - illumination and truth', color: 'text-yellow-400', requiredAccess: 'executor' },
    
    // Modifier Runes
    { id: 'amplify', name: 'Amplificare', symbol: '⚡', type: 'modifier', description: 'Increases spell power', color: 'text-orange-400', requiredAccess: 'executor' },
    { id: 'focus', name: 'Concentrare', symbol: '🎯', type: 'modifier', description: 'Improves spell precision', color: 'text-indigo-400', requiredAccess: 'guest' },
    { id: 'extend', name: 'Extendere', symbol: '⏰', type: 'modifier', description: 'Extends spell duration', color: 'text-pink-400', requiredAccess: 'executor' },
    { id: 'multiply', name: 'Multiplicare', symbol: '✖️', type: 'modifier', description: 'Creates multiple effects', color: 'text-emerald-400', requiredAccess: 'root' },
    
    // Target Runes
    { id: 'self', name: 'Ego', symbol: '👤', type: 'target', description: 'Targets the caster', color: 'text-gray-400', requiredAccess: 'guest' },
    { id: 'single', name: 'Unus', symbol: '🎯', type: 'target', description: 'Targets single entity', color: 'text-blue-300', requiredAccess: 'guest' },
    { id: 'area', name: 'Area', symbol: '💥', type: 'target', description: 'Affects an area', color: 'text-red-300', requiredAccess: 'executor' },
    { id: 'all', name: 'Omnis', symbol: '🌐', type: 'target', description: 'Affects all entities', color: 'text-purple-300', requiredAccess: 'root' },
    
    // Power Runes
    { id: 'minor', name: 'Minor', symbol: '○', type: 'power', description: 'Minor power level', color: 'text-gray-300', requiredAccess: 'guest' },
    { id: 'major', name: 'Major', symbol: '◉', type: 'power', description: 'Major power level', color: 'text-yellow-300', requiredAccess: 'executor' },
    { id: 'supreme', name: 'Supremus', symbol: '⭐', type: 'power', description: 'Supreme power level', color: 'text-gold-300', requiredAccess: 'root' }
  ];

  const getAccessibleRunes = () => {
    return availableRunes.filter(rune => {
      if (rune.requiredAccess === 'guest') return true;
      if (rune.requiredAccess === 'executor') return user.accessLevel !== 'guest';
      if (rune.requiredAccess === 'root') return user.accessLevel === 'root';
      return false;
    });
  };

  const addRuneToCrafting = (rune: Rune) => {
    if (selectedRunes.length >= 6) {
      onNotification({
        type: 'warning',
        title: 'Spell Complexity Limit',
        message: 'Maximum of 6 runes per spell to maintain stability'
      });
      return;
    }

    setSelectedRunes(prev => [...prev, { ...rune, id: `${rune.id}-${Date.now()}` }]);
    onNotification({
      type: 'info',
      title: 'Rune Added',
      message: `${rune.name} added to spell matrix`
    });
  };

  const removeRuneFromCrafting = (runeId: string) => {
    setSelectedRunes(prev => prev.filter(r => r.id !== runeId));
  };

  const calculateSpellStats = () => {
    const elementRunes = selectedRunes.filter(r => r.type === 'element').length;
    const modifierRunes = selectedRunes.filter(r => r.type === 'modifier').length;
    const targetRunes = selectedRunes.filter(r => r.type === 'target').length;
    const powerRunes = selectedRunes.filter(r => r.type === 'power').length;

    const basePower = elementRunes * 20 + powerRunes * 30;
    const modifiedPower = basePower + (modifierRunes * 15);
    const power = Math.min(100, modifiedPower);

    // Stability decreases with complexity but increases with proper balance
    let stability = 100 - (selectedRunes.length * 5);
    if (elementRunes > 0 && targetRunes > 0 && powerRunes > 0) stability += 20;
    if (modifierRunes > elementRunes * 2) stability -= 30; // Too many modifiers
    
    return {
      power: Math.max(0, power),
      stability: Math.max(0, Math.min(100, stability))
    };
  };

  const craftSpell = () => {
    if (selectedRunes.length === 0) {
      onNotification({
        type: 'error',
        title: 'Crafting Failed',
        message: 'At least one rune is required to craft a spell'
      });
      return;
    }

    if (!spellName.trim()) {
      onNotification({
        type: 'error',
        title: 'Crafting Failed',
        message: 'Spell name is required'
      });
      return;
    }

    const stats = calculateSpellStats();
    
    if (stats.stability < 30) {
      onNotification({
        type: 'warning',
        title: 'Unstable Spell',
        message: 'Spell stability is too low. Consider rebalancing runes.'
      });
      return;
    }

    const newSpell: CraftedSpell = {
      id: Date.now().toString(),
      name: spellName,
      runes: [...selectedRunes],
      power: stats.power,
      stability: stats.stability,
      description: generateSpellDescription(selectedRunes),
      created: new Date()
    };

    setCraftedSpells(prev => [newSpell, ...prev]);
    setSelectedRunes([]);
    setSpellName('');

    onNotification({
      type: 'success',
      title: 'Spell Crafted',
      message: `${newSpell.name} successfully added to your grimoire`
    });
  };

  const generateSpellDescription = (runes: Rune[]): string => {
    const elements = runes.filter(r => r.type === 'element').map(r => r.name);
    const modifiers = runes.filter(r => r.type === 'modifier').map(r => r.name);
    const targets = runes.filter(r => r.type === 'target').map(r => r.name);
    const powers = runes.filter(r => r.type === 'power').map(r => r.name);

    let description = 'A mystical incantation that ';
    
    if (elements.length > 0) {
      description += `harnesses the power of ${elements.join(' and ')} `;
    }
    
    if (modifiers.length > 0) {
      description += `with ${modifiers.join(' and ')} enhancement `;
    }
    
    if (targets.length > 0) {
      description += `targeting ${targets.join(' or ')} `;
    }
    
    if (powers.length > 0) {
      description += `at ${powers.join(' and ')} intensity`;
    }

    return description + '.';
  };

  const executeSpell = (spell: CraftedSpell) => {
    if (user.accessLevel === 'guest') {
      onNotification({
        type: 'error',
        title: 'Execution Denied',
        message: 'Spell execution requires EXECUTOR access or higher'
      });
      return;
    }

    onNotification({
      type: 'success',
      title: 'Spell Executed',
      message: `${spell.name} cast successfully! Power: ${spell.power}%, Stability: ${spell.stability}%`
    });

    // Simulate spell effects based on runes
    const hasVoid = spell.runes.some(r => r.id.includes('void'));
    const hasArea = spell.runes.some(r => r.id.includes('area'));
    
    if (hasVoid && hasArea) {
      onNotification({
        type: 'warning',
        title: 'Dimensional Disturbance',
        message: 'Void-area spell caused minor reality fluctuations'
      });
    }
  };

  const deleteSpell = (spellId: string) => {
    setCraftedSpells(prev => prev.filter(s => s.id !== spellId));
    onNotification({
      type: 'info',
      title: 'Spell Deleted',
      message: 'Spell removed from grimoire'
    });
  };

  const stats = calculateSpellStats();

  return (
    <div className="h-full flex bg-black/20 backdrop-blur-sm">
      {/* Main Crafting Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Spell Crafting Matrix
            </h2>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('craft')}
              className={`px-4 py-2 rounded transition-colors ${
                activeTab === 'craft'
                  ? 'bg-purple-500/30 text-purple-300 border border-purple-400/50'
                  : 'bg-black/30 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20'
              }`}
            >
              <Sparkles size={16} className="inline mr-2" />
              Craft
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`px-4 py-2 rounded transition-colors ${
                activeTab === 'library'
                  ? 'bg-purple-500/30 text-purple-300 border border-purple-400/50'
                  : 'bg-black/30 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20'
              }`}
            >
              <BookOpen size={16} className="inline mr-2" />
              Grimoire ({craftedSpells.length})
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'craft' ? (
            <motion.div
              key="craft"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Spell Name Input */}
              <div className="bg-black/30 border border-purple-500/30 rounded-lg p-4">
                <label className="block text-purple-300 text-sm font-medium mb-2">
                  Spell Name
                </label>
                <input
                  type="text"
                  value={spellName}
                  onChange={(e) => setSpellName(e.target.value)}
                  className="w-full px-4 py-2 bg-black/30 border border-purple-500/30 rounded text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
                  placeholder="Enter mystical incantation name..."
                />
              </div>

              {/* Crafting Area */}
              <div 
                ref={craftingAreaRef}
                className="bg-black/30 border border-purple-500/30 rounded-lg p-6 min-h-64 relative"
                style={{
                  backgroundImage: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
                }}
              >
                <h3 className="text-lg font-semibold text-purple-300 mb-4">Spell Matrix</h3>
                
                {selectedRunes.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-purple-400/50 text-center">
                    <div>
                      <Sparkles size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Drag runes here to begin crafting</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {selectedRunes.map((rune, index) => (
                      <motion.div
                        key={rune.id}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="relative"
                      >
                        <Draggable>
                          <div className={`w-16 h-16 bg-black/50 border-2 border-purple-400/50 rounded-lg flex items-center justify-center cursor-move hover:border-purple-300 transition-colors ${rune.color}`}>
                            <span className="text-2xl">{rune.symbol}</span>
                            <button
                              onClick={() => removeRuneFromCrafting(rune.id)}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        </Draggable>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Spell Stats */}
                {selectedRunes.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 grid grid-cols-2 gap-4"
                  >
                    <div className="bg-black/50 border border-orange-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-orange-400 text-sm">Power</span>
                        <span className="text-white font-bold">{stats.power}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                          style={{ width: `${stats.power}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-black/50 border border-blue-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-400 text-sm">Stability</span>
                        <span className="text-white font-bold">{stats.stability}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500"
                          style={{ width: `${stats.stability}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Craft Button */}
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={craftSpell}
                    disabled={selectedRunes.length === 0 || !spellName.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-400/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <Save size={16} className="inline mr-2" />
                    Craft Spell
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {craftedSpells.length === 0 ? (
                <div className="text-center py-12 text-purple-400/50">
                  <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Your grimoire is empty. Craft some spells to get started!</p>
                </div>
              ) : (
                craftedSpells.map((spell) => (
                  <motion.div
                    key={spell.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-black/30 border border-purple-500/30 rounded-lg p-4 hover:border-purple-400/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-purple-300">{spell.name}</h3>
                        <p className="text-sm text-gray-400">{spell.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => executeSpell(spell)}
                          className="p-2 bg-green-600/20 border border-green-500/30 rounded text-green-300 hover:bg-green-600/30 transition-colors"
                          title="Execute Spell"
                        >
                          <Play size={16} />
                        </button>
                        <button
                          onClick={() => deleteSpell(spell.id)}
                          className="p-2 bg-red-600/20 border border-red-500/30 rounded text-red-300 hover:bg-red-600/30 transition-colors"
                          title="Delete Spell"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-orange-400 text-sm">Power:</span>
                        <span className="text-white font-medium">{spell.power}%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-400 text-sm">Stability:</span>
                        <span className="text-white font-medium">{spell.stability}%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-sm">Created:</span>
                        <span className="text-white text-sm">{spell.created.toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-400 text-sm">Runes:</span>
                      <div className="flex space-x-1">
                        {spell.runes.map((rune, index) => (
                          <span key={index} className={`text-lg ${rune.color}`} title={rune.name}>
                            {rune.symbol}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rune Palette */}
      {activeTab === 'craft' && (
        <div className="w-80 bg-black/30 border-l border-purple-500/30 backdrop-blur-sm p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold text-purple-300 mb-4">Rune Palette</h3>
          
          {['element', 'modifier', 'target', 'power'].map((type) => (
            <div key={type} className="mb-6">
              <h4 className="text-sm font-medium text-purple-400 mb-2 capitalize">{type} Runes</h4>
              <div className="grid grid-cols-3 gap-2">
                {getAccessibleRunes()
                  .filter(rune => rune.type === type)
                  .map((rune) => (
                    <motion.div
                      key={rune.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-12 h-12 bg-black/50 border border-purple-500/30 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors ${rune.color}`}
                      onClick={() => addRuneToCrafting(rune)}
                      title={`${rune.name}: ${rune.description}`}
                    >
                      <span className="text-lg">{rune.symbol}</span>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpellCraftingModule;