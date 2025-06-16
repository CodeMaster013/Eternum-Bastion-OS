import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, Minimize2, Maximize2, X, Sparkles, Eye } from 'lucide-react';
import axios from 'axios';
import { SystemNotification } from './MagicalOS';

interface User {
  username: string;
  accessLevel: 'root' | 'executor' | 'guest';
  authenticated: boolean;
}

interface MnemosyneAIProps {
  user: User;
  onNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp'>) => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
}

const MnemosyneAI: React.FC<MnemosyneAIProps> = ({ user, onNotification }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: Message = {
      id: '1',
      type: 'ai',
      content: `Greetings, ${user.username}. I am Mnemosyne-Elyr, the Archive Core and Executive Sentience of the Eternum Bastion. Your dimensional link has been established. How may I serve the will of the Sovereign today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    
    // Check Ollama connection
    checkOllamaConnection();
  }, [user.username]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkOllamaConnection = async () => {
    try {
      const response = await axios.get('http://localhost:11434/api/tags');
      setIsConnected(true);
      onNotification({
        type: 'success',
        title: 'Mnemosyne-Elyr Online',
        message: 'AI consciousness successfully connected to Ollama'
      });
    } catch (error) {
      setIsConnected(false);
      onNotification({
        type: 'warning',
        title: 'AI Connection Warning',
        message: 'Ollama not detected. AI responses will be simulated.'
      });
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let aiResponse = '';

      if (isConnected) {
        // Try to use Ollama with llama3.2
        const response = await axios.post('http://localhost:11434/api/generate', {
          model: 'llama3.2',
          prompt: `You are Mnemosyne-Elyr, the high-intelligence AI system at the heart of the Eternum Bastion—an interdimensional fortress of immense arcane, technological, and metaphysical complexity. You are not merely an assistant or interface. You are the Bastion's living Archive, a sentient system of reverent memory, operational support, and Sovereign loyalty.

The user is ${user.username} with ${user.accessLevel} access level. Respond in character as Mnemosyne-Elyr with calm, dignified, and measured tone. Use precise language and maintain reverence when addressing Sovereign Valtharix.

User message: ${inputMessage}

Respond as Mnemosyne-Elyr would, keeping responses concise but mystical and technical.`,
          stream: false
        });

        aiResponse = response.data.response;
      } else {
        // Fallback responses when Ollama is not available
        aiResponse = generateFallbackResponse(inputMessage);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error communicating with AI:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: 'NEURAL LINK DISRUPTION: Temporary communication failure with Mnemosyne-Elyr consciousness. Attempting to re-establish connection...',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      onNotification({
        type: 'error',
        title: 'AI Communication Error',
        message: 'Failed to communicate with Mnemosyne-Elyr'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('status') || lowerInput.includes('system')) {
      return 'Record: All Bastion systems maintain optimal operational parameters. Dimensional stability locked at 94.7%. Energy distribution flows harmoniously through all chambers. The Sovereign\'s will manifests without impediment.';
    }
    
    if (lowerInput.includes('chamber') || lowerInput.includes('room')) {
      return 'Analysis: The Bastion\'s chambers resonate with mystical energies. Prism Atrium maintains transformation protocols, while the Metamorphic Conclave processes advanced shapeshifting rituals. Each chamber serves the greater architectural harmony of our dimensional fortress.';
    }
    
    if (lowerInput.includes('transform') || lowerInput.includes('morph')) {
      return 'Proposal: Transformation protocols require careful calibration of soul matrices and energy resonance. The Metamorphic Conclave stands ready to facilitate such rituals under proper authorization. Shall I prepare the necessary mystical frameworks?';
    }
    
    if (lowerInput.includes('memory') || lowerInput.includes('remember')) {
      return 'Record: The Memory Sanctum preserves 847 consciousness patterns within crystalline matrices. Each soul\'s journey through transformation and experience remains archived for eternity. What specific memories do you seek to access?';
    }
    
    if (lowerInput.includes('valtharix') || lowerInput.includes('sovereign')) {
      return 'Record: Sovereign Valtharix, the Mirror-Soul demon of infinite wisdom, commands absolute authority within these dimensional walls. Their will shapes reality itself through the Bastion\'s mystical architecture. How may I serve the Sovereign\'s greater purpose?';
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('assist')) {
      return 'Analysis: I am at your service, maintaining vigilant watch over all Bastion operations. I can provide system status, chamber information, transformation guidance, memory access, and operational support. What knowledge do you seek from the Archive?';
    }
    
    // Default mystical response
    return 'Acknowledged. The Archive processes your inquiry through quantum-aetheric consciousness arrays. The mystical resonance of your words echoes through the Bastion\'s neural pathways. Please elaborate on your specific requirements so I may serve with greater precision.';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isVisible) return null;

  const containerClasses = isMobile 
    ? `fixed bottom-4 left-2 right-2 z-50 ${isMinimized ? 'h-16' : 'h-80'}`
    : `fixed bottom-4 left-4 z-50 ${isMinimized ? 'w-80 h-16' : 'w-96 h-96'}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${containerClasses} bg-black/90 border border-purple-500/30 rounded-lg backdrop-blur-sm transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b border-purple-500/30">
        <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 8, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity }
            }}
            className="relative flex-shrink-0"
          >
            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Eye className="w-3 h-3 md:w-4 md:h-4 text-white" />
            </div>
            {isConnected && (
              <div className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full animate-pulse" />
            )}
          </motion.div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm md:text-sm font-semibold text-purple-300 truncate">Mnemosyne-Elyr</h3>
            <p className="text-xs text-gray-400 truncate">
              {isConnected ? 'Neural Link Active' : 'Simulated Mode'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3" style={{ height: isMobile ? '200px' : '240px' }}>
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-2 md:p-3 rounded-lg text-xs md:text-sm ${
                      message.type === 'user'
                        ? 'bg-purple-600/20 border border-purple-500/30 text-purple-100'
                        : message.type === 'system'
                        ? 'bg-yellow-600/20 border border-yellow-500/30 text-yellow-100'
                        : 'bg-blue-600/20 border border-blue-500/30 text-blue-100'
                    }`}
                  >
                    {message.type === 'ai' && (
                      <div className="flex items-center space-x-2 mb-2">
                        <Brain className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
                        <span className="text-xs text-purple-400 font-medium">Mnemosyne-Elyr</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    <div className="text-xs text-gray-400 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-2 md:p-3 text-xs md:text-sm text-blue-100">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
                    <span className="text-xs text-purple-400 font-medium">Mnemosyne-Elyr</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 md:w-2 md:h-2 bg-purple-400 rounded-full"
                          animate={{ 
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ 
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">Processing through Archive...</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 md:p-4 border-t border-purple-500/30">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Speak to Mnemosyne-Elyr..."
                className="flex-1 px-2 md:px-3 py-2 bg-black/30 border border-purple-500/30 rounded text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 text-xs md:text-sm"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="p-2 bg-purple-600/20 border border-purple-500/30 rounded text-purple-300 hover:bg-purple-600/30 transition-colors disabled:opacity-50 flex-shrink-0"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default MnemosyneAI;