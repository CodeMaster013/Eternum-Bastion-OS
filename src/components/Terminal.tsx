import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Terminal as TerminalIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CommandProcessor from './CommandProcessor';
import { SystemNotification } from './MagicalOS';

interface User {
  username: string;
  accessLevel: 'root' | 'executor' | 'guest';
  authenticated: boolean;
}

interface TerminalProps {
  user: User;
  onNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp'>) => void;
  currentTheme: string;
}

interface TerminalLine {
  id: number;
  type: 'command' | 'output' | 'error' | 'system';
  content: string;
  timestamp: Date;
  effects?: string[];
}

interface TerminalTab {
  id: string;
  name: string;
  history: TerminalLine[];
  currentCommand: string;
}

const Terminal: React.FC<TerminalProps> = ({ user, onNotification, currentTheme }) => {
  const [tabs, setTabs] = useState<TerminalTab[]>([
    { id: '1', name: 'Main Terminal', history: [], currentCommand: '' }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const commandProcessor = new CommandProcessor(user);
  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];

  useEffect(() => {
    // Welcome message for the first tab
    if (tabs[0].history.length === 0) {
      const welcomeMessages = [
        { type: 'system' as const, content: '╔══════════════════════════════════════════════════════════════╗', effects: ['glow'] },
        { type: 'system' as const, content: '║              ETERNUM BASTION MYSTICAL INTERFACE              ║', effects: ['glow'] },
        { type: 'system' as const, content: '╚══════════════════════════════════════════════════════════════╝', effects: ['glow'] },
        { type: 'system' as const, content: '', effects: [] },
        { type: 'system' as const, content: `🔮 Welcome, ${user.username}`, effects: ['sparkle'] },
        { type: 'system' as const, content: `⚡ Access Level: ${user.accessLevel.toUpperCase()}`, effects: ['pulse'] },
        { type: 'system' as const, content: `🌟 Dimensional Link: ESTABLISHED`, effects: ['shimmer'] },
        { type: 'system' as const, content: '', effects: [] },
        { type: 'system' as const, content: 'Type "help" for available commands or "man <command>" for detailed documentation.', effects: [] },
        { type: 'system' as const, content: '', effects: [] }
      ];

      setTabs(prev => prev.map(tab => 
        tab.id === '1' 
          ? { 
              ...tab, 
              history: welcomeMessages.map((msg, index) => ({
                id: index,
                ...msg,
                timestamp: new Date()
              }))
            }
          : tab
      ));
    }
  }, [user]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [activeTab.history]);

  const addToHistory = (type: TerminalLine['type'], content: string, effects: string[] = []) => {
    const newLine: TerminalLine = {
      id: Date.now() + Math.random(),
      type,
      content,
      timestamp: new Date(),
      effects
    };
    
    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, history: [...tab.history, newLine] }
        : tab
    ));
  };

  const updateCurrentCommand = (command: string) => {
    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, currentCommand: command }
        : tab
    ));
  };

  const handleCommand = async (command: string) => {
    if (!command.trim()) return;

    setIsExecuting(true);
    
    // Add command to history with visual effects
    addToHistory('command', command, ['typewriter']);
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);

    // Add visual spell-casting effects for certain commands
    const spellCommands = ['initiate.transfiguration', 'execute.draconic_morpher', 'launch.reflection_duel'];
    const isSpellCommand = spellCommands.some(spell => command.includes(spell));
    
    if (isSpellCommand) {
      // Add casting effect
      addToHistory('system', '✨ Channeling mystical energies...', ['sparkle', 'glow']);
      await new Promise(resolve => setTimeout(resolve, 1000));
      addToHistory('system', '🌟 Spell matrix stabilizing...', ['pulse', 'shimmer']);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Process command
    try {
      const result = await commandProcessor.execute(command);
      
      if (result.success) {
        if (result.output) {
          result.output.forEach((line, index) => {
            setTimeout(() => {
              const effects = isSpellCommand ? ['glow', 'success'] : ['fade-in'];
              addToHistory('output', line, effects);
            }, index * 100);
          });
        }
        
        // Send notification for successful spell commands
        if (isSpellCommand) {
          onNotification({
            type: 'success',
            title: 'Spell Executed',
            message: `${command.split(' ')[0]} completed successfully`
          });
        }
      } else {
        addToHistory('error', result.error || 'Unknown mystical disturbance', ['glitch', 'error']);
        
        onNotification({
          type: 'error',
          title: 'Command Failed',
          message: result.error || 'Unknown error occurred'
        });
      }
    } catch (error) {
      addToHistory('error', 'CRITICAL RUNE FAULT: System Anomaly Detected', ['glitch', 'critical']);
      
      onNotification({
        type: 'error',
        title: 'Critical Error',
        message: 'System anomaly detected'
      });
    }

    updateCurrentCommand('');
    setIsExecuting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(activeTab.currentCommand);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        updateCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex === commandHistory.length - 1 ? -1 : historyIndex + 1;
        setHistoryIndex(newIndex);
        updateCurrentCommand(newIndex === -1 ? '' : commandHistory[newIndex]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Basic auto-completion
      const suggestions = commandProcessor.getSuggestions(activeTab.currentCommand);
      if (suggestions.length === 1) {
        updateCurrentCommand(suggestions[0]);
      } else if (suggestions.length > 1) {
        addToHistory('system', `Possible completions: ${suggestions.join(', ')}`, ['fade-in']);
      }
    }
  };

  const addNewTab = () => {
    const newTab: TerminalTab = {
      id: Date.now().toString(),
      name: `Terminal ${tabs.length + 1}`,
      history: [],
      currentCommand: ''
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return; // Don't close the last tab
    
    setTabs(prev => prev.filter(tab => tab.id !== tabId));
    if (activeTabId === tabId) {
      setActiveTabId(tabs[0].id === tabId ? tabs[1].id : tabs[0].id);
    }
  };

  const getPrompt = () => {
    const accessSymbol = user.accessLevel === 'root' ? '#' : user.accessLevel === 'executor' ? '$' : '>';
    return `[${user.username}@bastion]${accessSymbol}`;
  };

  const getLineClass = (type: TerminalLine['type'], effects: string[] = []) => {
    let baseClass = '';
    switch (type) {
      case 'command': baseClass = 'text-cyan-300'; break;
      case 'output': baseClass = 'text-green-300'; break;
      case 'error': baseClass = 'text-red-400'; break;
      case 'system': baseClass = 'text-purple-300'; break;
      default: baseClass = 'text-gray-300';
    }
    
    const effectClasses = effects.map(effect => {
      switch (effect) {
        case 'glow': return 'magical-glow';
        case 'sparkle': return 'sparkle-text';
        case 'pulse': return 'pulse-text';
        case 'shimmer': return 'shimmer-text';
        case 'glitch': return 'glitch-text';
        case 'typewriter': return 'typewriter-text';
        case 'fade-in': return 'fade-in-text';
        case 'success': return 'success-glow';
        case 'error': return 'error-glow';
        case 'critical': return 'critical-glow';
        default: return '';
      }
    }).join(' ');
    
    return `${baseClass} ${effectClasses}`.trim();
  };

  const getThemeClasses = () => {
    const themes = {
      default: 'bg-black/20',
      fire: 'bg-red-900/20',
      ice: 'bg-blue-900/20',
      void: 'bg-gray-900/20',
      nature: 'bg-green-900/20',
      celestial: 'bg-purple-900/20'
    };
    return themes[currentTheme as keyof typeof themes] || themes.default;
  };

  return (
    <div className={`h-full flex flex-col ${getThemeClasses()} backdrop-blur-sm`}>
      {/* Terminal Tabs */}
      <div className="flex items-center border-b border-purple-500/30 bg-black/20">
        <div className="flex flex-1 overflow-x-auto">
          {tabs.map((tab) => (
            <motion.div
              key={tab.id}
              className={`flex items-center px-4 py-2 border-r border-purple-500/20 cursor-pointer transition-colors ${
                activeTabId === tab.id
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'text-purple-400 hover:bg-purple-500/10'
              }`}
              onClick={() => setActiveTabId(tab.id)}
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-sm mr-2">{tab.name}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="text-xs hover:text-red-400 ml-2"
                >
                  ×
                </button>
              )}
            </motion.div>
          ))}
        </div>
        
        <button
          onClick={addNewTab}
          className="px-3 py-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors"
          title="New Terminal"
        >
          +
        </button>
      </div>

      {/* Terminal Header */}
      <div className="flex items-center justify-between p-3 border-b border-purple-500/30 bg-black/20">
        <div className="flex items-center space-x-2">
          <TerminalIcon size={18} className="text-purple-400" />
          <span className="text-purple-300 text-sm font-medium">
            {activeTab.name} - Mystical Command Interface
          </span>
        </div>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className={`w-3 h-3 rounded-full ${isExecuting ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></div>
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1"
        onClick={() => inputRef.current?.focus()}
      >
        <AnimatePresence>
          {activeTab.history.map((line) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`${getLineClass(line.type, line.effects)} leading-relaxed`}
            >
              {line.type === 'command' && (
                <span className="text-purple-400 mr-2">{getPrompt()}</span>
              )}
              <span className="whitespace-pre-wrap">{line.content}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Current Input Line */}
        <div className="flex items-center">
          <span className="text-purple-400 mr-2">{getPrompt()}</span>
          <input
            ref={inputRef}
            type="text"
            value={activeTab.currentCommand}
            onChange={(e) => updateCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-cyan-300 font-mono"
            disabled={isExecuting}
            autoFocus
          />
          <motion.div
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <ChevronRight size={16} className="text-purple-400 ml-1" />
          </motion.div>
        </div>
        
        {/* Execution Indicator */}
        {isExecuting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2 text-yellow-400"
          >
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Executing mystical command...</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Terminal;