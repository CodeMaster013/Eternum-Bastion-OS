import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { SystemNotification } from './MagicalOS';

interface User {
  username: string;
  accessLevel: 'root' | 'executor' | 'guest';
  authenticated: boolean;
}

interface VoiceCommandInterfaceProps {
  user: User;
  onNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp'>) => void;
}

const VoiceCommandInterface: React.FC<VoiceCommandInterfaceProps> = ({ user, onNotification }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

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
    // Check for speech recognition support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          onNotification({
            type: 'info',
            title: 'Voice Interface Active',
            message: 'Listening for mystical incantations...'
          });
        };

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          
          if (finalTranscript) {
            setTranscript(finalTranscript);
            processVoiceCommand(finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          onNotification({
            type: 'error',
            title: 'Voice Recognition Error',
            message: 'Failed to process voice input'
          });
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const speak = (text: string) => {
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 0.8;
      utterance.volume = 0.7;
      
      // Try to use a more mystical-sounding voice
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('UK') || voice.name.includes('British') || voice.name.includes('Daniel')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      synthRef.current.speak(utterance);
    }
  };

  const processVoiceCommand = async (command: string) => {
    setIsProcessing(true);
    
    const lowerCommand = command.toLowerCase();
    
    // Voice command mappings
    const commandMappings = {
      'status': () => {
        speak('System status: All mystical systems operational. Bastion integrity at optimal levels.');
        onNotification({
          type: 'success',
          title: 'Voice Command Executed',
          message: 'System status reported via voice interface'
        });
      },
      
      'transform': () => {
        if (user.accessLevel === 'guest') {
          speak('Access denied. Transformation rituals require executor privileges.');
          onNotification({
            type: 'error',
            title: 'Access Denied',
            message: 'Transformation commands require higher access level'
          });
        } else {
          speak('Initiating transformation sequence. Please specify target and desired form.');
          onNotification({
            type: 'info',
            title: 'Transformation Ready',
            message: 'Awaiting transformation parameters'
          });
        }
      },
      
      'chambers': () => {
        speak('Available chambers: Prism Atrium, Metamorphic Conclave, Ember Ring, Void Nexus, Memory Sanctum, and Mirror Maze.');
        onNotification({
          type: 'info',
          title: 'Chamber List',
          message: 'All chambers reported via voice interface'
        });
      },
      
      'energy': () => {
        speak('Energy systems nominal. All chambers receiving adequate power allocation.');
        onNotification({
          type: 'info',
          title: 'Energy Status',
          message: 'Power systems reported via voice interface'
        });
      },
      
      'prophecy': () => {
        if (user.accessLevel === 'guest') {
          speak('Access denied. Prophecy generation requires executor privileges.');
        } else {
          speak('Channeling divine energies for prophetic vision. Please wait while the cosmic forces align.');
          onNotification({
            type: 'info',
            title: 'Prophecy Requested',
            message: 'Divine vision generation initiated via voice command'
          });
        }
      },
      
      'lockdown': () => {
        if (user.accessLevel !== 'root') {
          speak('Access denied. Emergency lockdown requires root authority.');
          onNotification({
            type: 'error',
            title: 'Access Denied',
            message: 'Lockdown commands require ROOT access'
          });
        } else {
          speak('Warning: Emergency lockdown protocol activated. All chambers sealed.');
          onNotification({
            type: 'warning',
            title: 'Emergency Lockdown',
            message: 'Lockdown initiated via voice command'
          });
        }
      },
      
      'help': () => {
        speak('Available voice commands: status, transform, chambers, energy, prophecy, and help. Speak clearly for optimal recognition.');
        onNotification({
          type: 'info',
          title: 'Voice Help',
          message: 'Available commands listed via voice interface'
        });
      }
    };

    // Find matching command
    let commandExecuted = false;
    for (const [keyword, action] of Object.entries(commandMappings)) {
      if (lowerCommand.includes(keyword)) {
        action();
        commandExecuted = true;
        break;
      }
    }

    if (!commandExecuted) {
      speak('Command not recognized. Please speak clearly or say help for available commands.');
      onNotification({
        type: 'warning',
        title: 'Unknown Voice Command',
        message: `Unrecognized command: "${command}"`
      });
    }

    setIsProcessing(false);
    setTranscript('');
  };

  // Simulate voice level animation
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setVoiceLevel(Math.random() * 100);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setVoiceLevel(0);
    }
  }, [isListening]);

  if (!recognitionRef.current) {
    return (
      <div className={`fixed ${isMobile ? 'bottom-20 right-2' : 'bottom-4 right-4'} bg-red-900/20 border border-red-500/30 rounded-lg p-3 md:p-4 text-red-300 max-w-xs`}>
        <p className="text-xs md:text-sm">Voice commands not supported in this browser</p>
      </div>
    );
  }

  return (
    <div className={`fixed ${isMobile ? 'bottom-20 right-2' : 'bottom-4 right-4'} z-40`}>
      <AnimatePresence>
        {(isListening || isProcessing || transcript) && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className={`mb-4 bg-black/80 border border-purple-500/30 rounded-lg p-3 md:p-4 backdrop-blur-sm ${isMobile ? 'max-w-xs' : 'max-w-sm'}`}
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-purple-300 text-xs md:text-sm">Processing incantation...</span>
              </div>
            ) : transcript ? (
              <div>
                <div className="text-xs text-purple-400 mb-1">Recognized:</div>
                <div className="text-xs md:text-sm text-white break-words">{transcript}</div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Volume2 size={isMobile ? 14 : 16} className="text-green-400 flex-shrink-0" />
                <span className="text-green-300 text-xs md:text-sm">Listening for commands...</span>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-green-400 rounded-full transition-all duration-100"
                      style={{
                        height: `${Math.max(4, (voiceLevel / 100) * 20 * (i + 1) / 5)}px`
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center space-x-2">
        {/* Help Button - Mobile only */}
        {isMobile && (
          <motion.button
            onClick={() => setShowHelp(!showHelp)}
            className="w-12 h-12 rounded-full border-2 border-blue-400 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 flex items-center justify-center transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ?
          </motion.button>
        )}

        {/* Voice Button */}
        <motion.button
          onClick={isListening ? stopListening : startListening}
          className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            isListening
              ? 'bg-red-500/20 border-red-400 text-red-400 hover:bg-red-500/30'
              : 'bg-purple-500/20 border-purple-400 text-purple-400 hover:bg-purple-500/30'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={isListening ? { 
            boxShadow: [
              '0 0 0 0 rgba(239, 68, 68, 0.4)',
              '0 0 0 10px rgba(239, 68, 68, 0)',
              '0 0 0 0 rgba(239, 68, 68, 0)'
            ]
          } : {}}
          transition={isListening ? { 
            duration: 1.5, 
            repeat: Infinity 
          } : {}}
        >
          {isListening ? <MicOff size={isMobile ? 20 : 24} /> : <Mic size={isMobile ? 20 : 24} />}
        </motion.button>
      </div>

      {/* Voice Commands Help */}
      <AnimatePresence>
        {(showHelp || (!isMobile && !isListening && !isProcessing)) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute ${isMobile ? 'bottom-16 right-0' : 'bottom-20 right-0'} bg-black/80 border border-purple-500/30 rounded-lg p-3 backdrop-blur-sm text-xs text-purple-300 ${isMobile ? 'max-w-xs' : 'max-w-xs'}`}
          >
            <div className="font-semibold mb-2 flex items-center justify-between">
              Voice Commands:
              {isMobile && (
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-gray-400 hover:text-white ml-2"
                >
                  ×
                </button>
              )}
            </div>
            <div className="space-y-1">
              <div>• "Status" - System status</div>
              <div>• "Transform" - Transformation</div>
              <div>• "Chambers" - List chambers</div>
              <div>• "Energy" - Power status</div>
              <div>• "Prophecy" - Generate vision</div>
              <div>• "Help" - Show commands</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceCommandInterface;