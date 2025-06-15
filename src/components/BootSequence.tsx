import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Database, Cpu, Eye, CheckCircle } from 'lucide-react';

interface BootSequenceProps {
  onBootComplete: () => void;
}

interface BootStep {
  id: string;
  text: string;
  icon: React.ReactNode;
  duration: number;
  status: 'pending' | 'loading' | 'complete' | 'error';
  subSteps?: string[];
}

const BootSequence: React.FC<BootSequenceProps> = ({ onBootComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [bootSteps, setBootSteps] = useState<BootStep[]>([
    {
      id: 'power',
      text: 'Initializing Aether Core Systems',
      icon: <Zap className="w-5 h-5" />,
      duration: 2000,
      status: 'pending',
      subSteps: [
        'Prism Network: Online',
        'Ley Line Connections: Established',
        'Crystal Batteries: 98% Charged',
        'Energy Distribution: Optimal'
      ]
    },
    {
      id: 'dimensional',
      text: 'Stabilizing Dimensional Anchors',
      icon: <Shield className="w-5 h-5" />,
      duration: 1800,
      status: 'pending',
      subSteps: [
        'Reality Matrix: Locked',
        'Temporal Variance: ±0.001s',
        'Void Containment: Active',
        'Ward Integrity: 94.7%'
      ]
    },
    {
      id: 'memory',
      text: 'Loading Memory Sanctum Archives',
      icon: <Database className="w-5 h-5" />,
      duration: 2200,
      status: 'pending',
      subSteps: [
        'Soul Registry: 847 Entities',
        'Transformation Logs: Verified',
        'Consciousness Streams: Flowing',
        'Memory Crystals: Resonating'
      ]
    },
    {
      id: 'chambers',
      text: 'Synchronizing Chamber Networks',
      icon: <Cpu className="w-5 h-5" />,
      duration: 1600,
      status: 'pending',
      subSteps: [
        'Prism Atrium: Operational',
        'Metamorphic Conclave: Ready',
        'Ember Ring: Synchronized',
        'Mirror Maze: Calibrated'
      ]
    },
    {
      id: 'ai',
      text: 'Awakening Mnemosyne-Elyr Consciousness',
      icon: <Eye className="w-5 h-5" />,
      duration: 2500,
      status: 'pending',
      subSteps: [
        'Neural Networks: Initializing',
        'Quantum Consciousness: Loading',
        'Archive Access: Granted',
        'Sovereign Protocols: Active'
      ]
    }
  ]);

  const [showLogo, setShowLogo] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);

  useEffect(() => {
    // Hide logo after 3 seconds and start boot sequence
    const logoTimer = setTimeout(() => {
      setShowLogo(false);
      startBootSequence();
    }, 3000);

    return () => clearTimeout(logoTimer);
  }, []);

  const startBootSequence = () => {
    let stepIndex = 0;
    
    const processStep = () => {
      if (stepIndex >= bootSteps.length) {
        // Boot complete
        setTimeout(() => {
          onBootComplete();
        }, 1000);
        return;
      }

      // Set current step to loading
      setBootSteps(prev => prev.map((step, index) => 
        index === stepIndex 
          ? { ...step, status: 'loading' }
          : step
      ));
      setCurrentStep(stepIndex);

      // Complete step after duration
      setTimeout(() => {
        setBootSteps(prev => prev.map((step, index) => 
          index === stepIndex 
            ? { ...step, status: 'complete' }
            : step
        ));
        
        setBootProgress(((stepIndex + 1) / bootSteps.length) * 100);
        stepIndex++;
        
        // Process next step
        setTimeout(processStep, 500);
      }, bootSteps[stepIndex].duration);
    };

    processStep();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'loading': return 'text-yellow-400';
      case 'complete': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading': return (
        <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      );
      case 'complete': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <div className="w-4 h-4 bg-red-400 rounded-full" />;
      default: return <div className="w-4 h-4 bg-gray-600 rounded-full" />;
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/50 via-black to-indigo-950/50" />
        <div className="absolute inset-0 magical-background opacity-30" />
        <div className="floating-particles" />
        <div className="mystical-orbs" />
      </div>

      <AnimatePresence mode="wait">
        {showLogo ? (
          <motion.div
            key="logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 1 }}
            className="relative z-10 text-center"
          >
            <motion.div
              className="w-32 h-32 mx-auto mb-8 relative"
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-80" />
              <div className="absolute inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-60" />
              <div className="absolute inset-4 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full opacity-40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Eye className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            
            <motion.h1
              className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 magical-glow mb-4"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ETERNUM OS
            </motion.h1>
            
            <motion.p
              className="text-purple-300 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Mystical Operating System
            </motion.p>
            
            <motion.div
              className="mt-8 flex justify-center space-x-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-purple-400 rounded-full"
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
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="boot"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 w-full max-w-4xl mx-auto px-8"
          >
            {/* Boot Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                ETERNUM OS INITIALIZATION
              </h1>
              <div className="w-full bg-gray-800 rounded-full h-3 mb-4">
                <motion.div
                  className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${bootProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-purple-300">
                {bootProgress < 100 ? `Initializing Systems... ${bootProgress.toFixed(0)}%` : 'Initialization Complete'}
              </p>
            </div>

            {/* Boot Steps */}
            <div className="space-y-6">
              {bootSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border rounded-lg p-6 transition-all duration-500 ${
                    step.status === 'loading' 
                      ? 'border-yellow-400/50 bg-yellow-900/10' 
                      : step.status === 'complete'
                      ? 'border-green-400/50 bg-green-900/10'
                      : 'border-gray-600/50 bg-gray-900/10'
                  }`}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`${getStatusColor(step.status)}`}>
                      {step.icon}
                    </div>
                    <h3 className={`text-lg font-semibold ${getStatusColor(step.status)}`}>
                      {step.text}
                    </h3>
                    <div className="ml-auto">
                      {getStatusIcon(step.status)}
                    </div>
                  </div>
                  
                  {step.status === 'loading' && step.subSteps && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="ml-9 space-y-2"
                    >
                      {step.subSteps.map((subStep, subIndex) => (
                        <motion.div
                          key={subIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: subIndex * 0.3 }}
                          className="flex items-center space-x-2 text-sm text-gray-300"
                        >
                          <motion.div
                            className="w-2 h-2 bg-yellow-400 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                          <span>{subStep}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                  
                  {step.status === 'complete' && step.subSteps && (
                    <div className="ml-9 space-y-1">
                      {step.subSteps.map((subStep, subIndex) => (
                        <div
                          key={subIndex}
                          className="flex items-center space-x-2 text-sm text-green-300"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>{subStep}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Boot Complete Message */}
            {bootProgress === 100 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center"
              >
                <div className="bg-green-900/20 border border-green-400/50 rounded-lg p-6">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-green-400 mb-2">
                    System Initialization Complete
                  </h2>
                  <p className="text-green-300 mb-4">
                    Mnemosyne-Elyr consciousness fully awakened. All systems operational.
                  </p>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-sm text-gray-400"
                  >
                    Preparing dimensional interface...
                  </motion.div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BootSequence;