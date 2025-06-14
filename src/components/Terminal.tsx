import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Terminal as TerminalIcon } from 'lucide-react';
import CommandProcessor from './CommandProcessor';

interface User {
  username: string;
  accessLevel: 'root' | 'executor' | 'guest';
  authenticated: boolean;
}

interface TerminalProps {
  user: User;
}

interface TerminalLine {
  id: number;
  type: 'command' | 'output' | 'error' | 'system';
  content: string;
  timestamp: Date;
}

const Terminal: React.FC<TerminalProps> = ({ user }) => {
  const [currentCommand, setCurrentCommand] = useState('');
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const commandProcessor = new CommandProcessor(user);

  useEffect(() => {
    // Welcome message
    const welcomeMessages = [
      { type: 'system' as const, content: '╔══════════════════════════════════════════════════════════════╗' },
      { type: 'system' as const, content: '║              ETERNUM BASTION MYSTICAL INTERFACE              ║' },
      { type: 'system' as const, content: '╚══════════════════════════════════════════════════════════════╝' },
      { type: 'system' as const, content: '' },
      { type: 'system' as const, content: `🔮 Welcome, ${user.username}` },
      { type: 'system' as const, content: `⚡ Access Level: ${user.accessLevel.toUpperCase()}` },
      { type: 'system' as const, content: `🌟 Dimensional Link: ESTABLISHED` },
      { type: 'system' as const, content: '' },
      { type: 'system' as const, content: 'Type "help" for available commands or "man <command>" for detailed documentation.' },
      { type: 'system' as const, content: '' }
    ];

    setHistory(welcomeMessages.map((msg, index) => ({
      id: index,
      ...msg,
      timestamp: new Date()
    })));
  }, [user]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const addToHistory = (type: TerminalLine['type'], content: string) => {
    const newLine: TerminalLine = {
      id: Date.now() + Math.random(),
      type,
      content,
      timestamp: new Date()
    };
    setHistory(prev => [...prev, newLine]);
  };

  const handleCommand = async (command: string) => {
    if (!command.trim()) return;

    // Add command to history
    addToHistory('command', command);
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);

    // Process command
    try {
      const result = await commandProcessor.execute(command);
      
      if (result.success) {
        if (result.output) {
          result.output.forEach(line => {
            addToHistory('output', line);
          });
        }
      } else {
        addToHistory('error', result.error || 'Unknown mystical disturbance');
      }
    } catch (error) {
      addToHistory('error', 'CRITICAL RUNE FAULT: System Anomaly Detected');
    }

    setCurrentCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(currentCommand);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex === commandHistory.length - 1 ? -1 : historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(newIndex === -1 ? '' : commandHistory[newIndex]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Basic auto-completion
      const suggestions = commandProcessor.getSuggestions(currentCommand);
      if (suggestions.length === 1) {
        setCurrentCommand(suggestions[0]);
      } else if (suggestions.length > 1) {
        addToHistory('system', `Possible completions: ${suggestions.join(', ')}`);
      }
    }
  };

  const getPrompt = () => {
    const accessSymbol = user.accessLevel === 'root' ? '#' : user.accessLevel === 'executor' ? '$' : '>';
    return `[${user.username}@bastion]${accessSymbol}`;
  };

  const getLineClass = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command': return 'text-cyan-300';
      case 'output': return 'text-green-300';
      case 'error': return 'text-red-400';
      case 'system': return 'text-purple-300';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="h-full flex flex-col bg-black/20 backdrop-blur-sm">
      {/* Terminal Header */}
      <div className="flex items-center justify-between p-3 border-b border-purple-500/30 bg-black/20">
        <div className="flex items-center space-x-2">
          <TerminalIcon size={18} className="text-purple-400" />
          <span className="text-purple-300 text-sm font-medium">Mystical Command Interface</span>
        </div>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((line) => (
          <div key={line.id} className={`${getLineClass(line.type)} leading-relaxed`}>
            {line.type === 'command' && (
              <span className="text-purple-400 mr-2">{getPrompt()}</span>
            )}
            <span className="whitespace-pre-wrap">{line.content}</span>
          </div>
        ))}
        
        {/* Current Input Line */}
        <div className="flex items-center">
          <span className="text-purple-400 mr-2">{getPrompt()}</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-cyan-300 font-mono"
            autoFocus
          />
          <ChevronRight size={16} className="text-purple-400 animate-pulse ml-1" />
        </div>
      </div>
    </div>
  );
};

export default Terminal;