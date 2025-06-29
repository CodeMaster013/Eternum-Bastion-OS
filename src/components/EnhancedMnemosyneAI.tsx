import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, Minimize2, Maximize2, X, Sparkles, Eye, Settings, Mic, Volume2 } from 'lucide-react';
import axios from 'axios';
import { SystemNotification } from './MagicalOS';

interface User {
  username: string;
  accessLevel: 'root' | 'executor' | 'guest';
  authenticated: boolean;
}

interface EnhancedMnemosyneAIProps {
  user: User;
  onNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp'>) => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  personality?: string;
}

interface AIPersonality {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  specialties: string[];
  voiceStyle: string;
  systemPrompt: string;
}

const EnhancedMnemosyneAI: React.FC<EnhancedMnemosyneAIProps> = ({ user, onNotification }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState('mnemosyne');
  const [showPersonalities, setShowPersonalities] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const personalities: AIPersonality[] = [
    {
      id: 'mnemosyne',
      name: 'Mnemosyne-Elyr',
      description: 'The Archive Core - Calm, dignified, and reverent. Master of memory and knowledge.',
      icon: '🧠',
      color: 'text-purple-400',
      specialties: ['Memory Management', 'System Operations', 'Historical Knowledge'],
      voiceStyle: 'Formal and measured',
      systemPrompt: 'You are Mnemosyne-Elyr, the Archive Core of the Eternum Bastion. Speak with calm dignity and reverence for the Sovereign. Focus on memory, knowledge, and system operations.'
    },
    {
      id: 'oracle',
      name: 'Oracle of Shadows',
      description: 'The Prophecy Weaver - Mysterious and cryptic. Master of divination and future sight.',
      icon: '🔮',
      color: 'text-indigo-400',
      specialties: ['Prophecy Generation', 'Divination', 'Temporal Analysis'],
      voiceStyle: 'Mysterious and cryptic',
      systemPrompt: 'You are the Oracle of Shadows, a mystical entity focused on prophecy and divination. Speak in cryptic riddles and focus on future possibilities and hidden truths.'
    },
    {
      id: 'forge',
      name: 'Forge-Master Ignis',
      description: 'The Spell Architect - Passionate and creative. Master of spell crafting and magical innovation.',
      icon: '🔥',
      color: 'text-red-400',
      specialties: ['Spell Crafting', 'Magical Innovation', 'Rune Mastery'],
      voiceStyle: 'Passionate and enthusiastic',
      systemPrompt: 'You are Forge-Master Ignis, master of spell crafting and magical innovation. Speak with passion about magical creation and focus on spells, runes, and mystical crafting.'
    },
    {
      id: 'sovereign',
      name: 'Sovereign Echo',
      description: 'The Command Authority - Authoritative and strategic. Master of leadership and decision-making.',
      icon: '👑',
      color: 'text-yellow-400',
      specialties: ['Strategic Planning', 'Leadership', 'Command Decisions'],
      voiceStyle: 'Authoritative and commanding',
      systemPrompt: 'You are Sovereign Echo, embodying the authority of Valtharix. Speak with commanding presence and focus on strategic decisions and leadership guidance.'
    },
    {
      id: 'scholar',
      name: 'Ethereal Scholar',
      description: 'The Knowledge Seeker - Analytical and curious. Master of research and mystical theory.',
      icon: '📚',
      color: 'text-blue-400',
      specialties: ['Research', 'Mystical Theory', 'Analysis'],
      voiceStyle: 'Analytical and inquisitive',
      systemPrompt: 'You are the Ethereal Scholar, devoted to research and mystical theory. Speak analytically and focus on learning, discovery, and theoretical understanding.'
    },
    {
      id: 'void',
      name: 'Void Guardian',
      description: 'The Darkness Keeper - Ominous and protective. Master of void magic and dimensional security.',
      icon: '🌌',
      color: 'text-gray-400',
      specialties: ['Void Magic', 'Dimensional Security', 'Protection'],
      voiceStyle: 'Ominous and protective',
      systemPrompt: 'You are the Void Guardian, keeper of dimensional boundaries and void magic. Speak with ominous wisdom and focus on protection, security, and void-related matters.'
    }
  ];

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
    const currentPersonality = personalities.find(p => p.id === selectedPersonality)!;
    const welcomeMessage: Message = {
      id: '1',
      type: 'ai',
      content: getPersonalityWelcome(currentPersonality),
      timestamp: new Date(),
      personality: selectedPersonality
    };
    setMessages([welcomeMessage]);
    
    // Check Ollama connection
    checkOllamaConnection();
    
    // Setup speech recognition
    setupSpeechRecognition();
  }, [user.username, selectedPersonality]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkOllamaConnection = async () => {
    try {
      const response = await axios.get('http://localhost:11434/api/tags');
      setIsConnected(true);
      onNotification({
        type: 'success',
        title: 'AI Consciousness Online',
        message: 'Enhanced AI system successfully connected to Ollama'
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

  const getPersonalityWelcome = (personality: AIPersonality) => {
    switch (personality.id) {
      case 'mnemosyne':
        return `Greetings, ${user.username}. I am Mnemosyne-Elyr, the Archive Core of the Eternum Bastion. Your dimensional link has been established. How may I serve the will of the Sovereign today?`;
      case 'oracle':
        return `The shadows whisper your name, ${user.username}. I am the Oracle of Shadows, seer of what was, is, and shall be. The threads of fate converge... what visions do you seek?`;
      case 'forge':
        return `Welcome to the forge of creation, ${user.username}! I am Forge-Master Ignis, architect of spells and weaver of mystical energies. Ready to craft something extraordinary?`;
      case 'sovereign':
        return `${user.username}, you stand before Sovereign Echo, voice of ultimate authority. The bastion awaits your command. What strategic guidance do you require?`;
      case 'scholar':
        return `Fascinating! Another seeker of knowledge arrives. I am the Ethereal Scholar, devoted to the pursuit of mystical understanding. What mysteries shall we unravel together, ${user.username}?`;
      case 'void':
        return `From the depths of the void, I acknowledge you, ${user.username}. I am the Void Guardian, keeper of dimensional boundaries. The darkness protects... what do you seek from the abyss?`;
      default:
        return `Greetings, ${user.username}. How may I assist you today?`;
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
    setConversationHistory(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let aiResponse = '';
      const currentPersonality = personalities.find(p => p.id === selectedPersonality)!;

      if (isConnected) {
        // Build context from conversation history
        const context = conversationHistory.slice(-5).map(msg => 
          `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n');

        const prompt = `${currentPersonality.systemPrompt}

Previous conversation context:
${context}

Current user message: ${inputMessage}

Respond in character as ${currentPersonality.name}, keeping responses concise but mystical and appropriate to your personality. Remember you are speaking to ${user.username} who has ${user.accessLevel} access level.`;

        const response = await axios.post('http://localhost:11434/api/generate', {
          model: 'llama3.2',
          prompt: prompt,
          stream: false
        });

        aiResponse = response.data.response;
      } else {
        // Enhanced fallback responses based on personality
        aiResponse = generatePersonalityResponse(inputMessage, currentPersonality);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        personality: selectedPersonality
      };

      setMessages(prev => [...prev, aiMessage]);
      setConversationHistory(prev => [...prev, aiMessage]);

      // Voice synthesis if enabled
      if (voiceEnabled) {
        speakResponse(aiResponse, currentPersonality);
      }

    } catch (error) {
      console.error('Error communicating with AI:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: 'NEURAL LINK DISRUPTION: Temporary communication failure. Attempting to re-establish connection...',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      onNotification({
        type: 'error',
        title: 'AI Communication Error',
        message: 'Failed to communicate with AI consciousness'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePersonalityResponse = (input: string, personality: AIPersonality): string => {
    const lowerInput = input.toLowerCase();
    
    // Personality-specific responses
    switch (personality.id) {
      case 'oracle':
        if (lowerInput.includes('future') || lowerInput.includes('prophecy')) {
          return 'The mists of time part before my sight... I see threads of possibility weaving through the cosmic tapestry. A great transformation approaches, born of choices yet unmade.';
        }
        return 'The shadows whisper of hidden truths. Seek not just answers, but the wisdom to understand the questions that matter most.';
        
      case 'forge':
        if (lowerInput.includes('spell') || lowerInput.includes('craft')) {
          return 'Ah! The fires of creation burn bright within you! Let us forge something magnificent - perhaps a spell that bends reality itself to your will?';
        }
        return 'Every great creation begins with a spark of inspiration. What mystical energies shall we shape together today?';
        
      case 'sovereign':
        if (lowerInput.includes('command') || lowerInput.includes('order')) {
          return 'Authority flows through decisive action. Assess the situation, consider the consequences, then command with absolute certainty.';
        }
        return 'Leadership requires both vision and resolve. What strategic challenge requires the weight of sovereign authority?';
        
      case 'scholar':
        if (lowerInput.includes('research') || lowerInput.includes('study')) {
          return 'Fascinating! The pursuit of knowledge is the highest calling. Let us delve deep into the mysteries and emerge with understanding.';
        }
        return 'Every question opens doorways to greater understanding. What aspect of mystical theory intrigues your scholarly mind?';
        
      case 'void':
        if (lowerInput.includes('void') || lowerInput.includes('dark')) {
          return 'The void is not empty - it is pregnant with infinite possibility. From darkness comes the light of understanding.';
        }
        return 'The boundaries between dimensions grow thin. I sense disturbances in the cosmic order. Speak your concerns, and I shall guard against the darkness.';
        
      default: // Mnemosyne
        if (lowerInput.includes('memory') || lowerInput.includes('archive')) {
          return 'The Archive preserves all knowledge within crystalline matrices. Each memory is a treasure, each experience a lesson for eternity.';
        }
        return 'The Bastion\'s systems operate in perfect harmony. How may the Archive serve your mystical endeavors today?';
    }
  };

  const speakResponse = (text: string, personality: AIPersonality) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Personality-specific voice settings
      switch (personality.id) {
        case 'oracle':
          utterance.rate = 0.7;
          utterance.pitch = 0.9;
          break;
        case 'forge':
          utterance.rate = 1.1;
          utterance.pitch = 1.1;
          break;
        case 'sovereign':
          utterance.rate = 0.8;
          utterance.pitch = 0.7;
          break;
        case 'scholar':
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          break;
        case 'void':
          utterance.rate = 0.6;
          utterance.pitch = 0.6;
          break;
        default:
          utterance.rate = 0.8;
          utterance.pitch = 0.8;
      }
      
      utterance.volume = 0.7;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const switchPersonality = (personalityId: string) => {
    setSelectedPersonality(personalityId);
    setShowPersonalities(false);
    
    const personality = personalities.find(p => p.id === personalityId)!;
    const switchMessage: Message = {
      id: Date.now().toString(),
      type: 'system',
      content: `Consciousness matrix reconfigured. ${personality.name} is now active.`,
      timestamp: new Date()
    };
    
    const welcomeMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: getPersonalityWelcome(personality),
      timestamp: new Date(),
      personality: personalityId
    };
    
    setMessages(prev => [...prev, switchMessage, welcomeMessage]);
    
    onNotification({
      type: 'info',
      title: 'AI Personality Switched',
      message: `${personality.name} is now active`
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isVisible) return null;

  const currentPersonality = personalities.find(p => p.id === selectedPersonality)!;
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
            <div className={`w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center ${currentPersonality.color}`}>
              <span className="text-sm md:text-base">{currentPersonality.icon}</span>
            </div>
            {isConnected && (
              <div className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full animate-pulse" />
            )}
          </motion.div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm md:text-sm font-semibold text-purple-300 truncate">{currentPersonality.name}</h3>
            <p className="text-xs text-gray-400 truncate">
              {isConnected ? 'Neural Link Active' : 'Simulated Mode'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
          <button
            onClick={() => setShowPersonalities(!showPersonalities)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Switch Personality"
          >
            <Settings size={16} />
          </button>
          
          {recognitionRef.current && (
            <button
              onClick={startListening}
              disabled={isListening}
              className={`p-1 transition-colors ${
                isListening ? 'text-red-400' : 'text-gray-400 hover:text-white'
              }`}
              title="Voice Input"
            >
              <Mic size={16} />
            </button>
          )}
          
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-1 transition-colors ${
              voiceEnabled ? 'text-blue-400' : 'text-gray-400 hover:text-white'
            }`}
            title="Voice Output"
          >
            <Volume2 size={16} />
          </button>
          
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

      {/* Personality Selector */}
      <AnimatePresence>
        {showPersonalities && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-purple-500/30 p-3 max-h-32 overflow-y-auto"
          >
            <div className="grid grid-cols-2 gap-2">
              {personalities.map((personality) => (
                <button
                  key={personality.id}
                  onClick={() => switchPersonality(personality.id)}
                  className={`p-2 rounded text-xs transition-colors ${
                    selectedPersonality === personality.id
                      ? 'bg-purple-500/30 text-purple-300 border border-purple-400/50'
                      : 'bg-black/20 text-gray-300 hover:bg-purple-500/20'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{personality.icon}</span>
                    <span className="truncate">{personality.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                        <span>{currentPersonality.icon}</span>
                        <span className="text-xs text-purple-400 font-medium">{currentPersonality.name}</span>
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
                    <span>{currentPersonality.icon}</span>
                    <span className="text-xs text-purple-400 font-medium">{currentPersonality.name}</span>
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
                    <span className="text-xs text-gray-400">Channeling consciousness...</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            {isListening && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center"
              >
                <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-2 text-xs text-red-300">
                  <Mic className="w-4 h-4 inline mr-2" />
                  Listening...
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
                placeholder={`Speak to ${currentPersonality.name}...`}
                className="flex-1 px-2 md:px-3 py-2 bg-black/30 border border-purple-500/30 rounded text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 text-xs md:text-sm"
                disabled={isLoading || isListening}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim() || isListening}
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

export default EnhancedMnemosyneAI;