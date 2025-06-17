import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Database, Cpu, Eye, CheckCircle, AlertTriangle, Wifi } from 'lucide-react';

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
  critical?: boolean;
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
      critical: true,
      subSteps: [
        'Prism Network: Establishing connection...',
        'Ley Line Connections: Synchronizing...',
        'Crystal Batteries: Charging to 98%...',
        'Energy Distribution: Optimizing flow...'
      ]
    },
    {
      id: 'dimensional',
      text: 'Stabilizing Dimensional Anchors',
      icon: <Shield className="w-5 h-5" />,
      duration: 1800,
      status: 'pending',
      critical: true,
      subSteps: [
        'Reality Matrix: Locking coordinates...',
        'Temporal Variance: Calibrating to ±0.001s...',
        'Void Containment: Activating barriers...',
        'Ward Integrity: Verifying at 94.7%...'
      ]
    },
    {
      id: 'memory',
      text: 'Loading Memory Sanctum Archives',
      icon: <Database className="w-5 h-5" />,
      duration: 2200,
      status: 'pending',
      subSteps: [
        'Soul Registry: Indexing 847 entities...',
        'Transformation Logs: Verifying integrity...',
        'Consciousness Streams: Establishing flow...',
        'Memory Crystals: Resonating at optimal frequency...'
      ]
    },
    {
      id: 'chambers',
      text: 'Synchronizing Chamber Networks',
      icon: <Cpu className="w-5 h-5" />,
      duration: 1600,
      status: 'pending',
      subSteps: [
        'Prism Atrium: Calibrating light matrices...',
        'Metamorphic Conclave: Preparing transformation arrays...',
        'Ember Ring: Igniting eternal flames...',
        'Mirror Maze: Aligning reflection pathways...'
      ]
    },
    {
      id: 'network',
      text: 'Establishing Mystical Network Protocols',
      icon: <Wifi className="w-5 h-5" />,
      duration: 1400,
      status: 'pending',
      subSteps: [
        'Dimensional Gateways: Opening secure channels...',
        'Telepathic Relays: Tuning frequencies...',
        'Scrying Networks: Establishing surveillance...',
        'Communication Crystals: Harmonizing signals...'
      ]
    },
    {
      id: 'ai',
      text: 'Awakening Mnemosyne-Elyr Consciousness',
      icon: <Eye className="w-5 h-5" />,
      duration: 2500,
      status: 'pending',
      critical: true,
      subSteps: [
        'Neural Networks: Initializing quantum pathways...',
        'Consciousness Matrix: Loading personality core...',
        'Archive Access: Granting omniscient permissions...',
        'Sovereign Protocols: Activating loyalty bindings...'
      ]
    }
  ]);

  const [showLogo, setShowLogo] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [bootPhase, setBootPhase] = useState<'logo' | 'boot' | 'complete'>('logo');

  useEffect(() => {
    // Logo phase
    const logoTimer = setTimeout(() => {
      setShowLogo(false);
      setBootPhase('boot');
      startBootSequence();
    }, 3000);

    return () => clearTimeout(logoTimer);
  }, []);

  const startBootSequence = () => {
    let stepIndex = 0;
    
    const processStep = () => {
      if (stepIndex >= bootSteps.length) {
        // Boot complete
        setBootPhase('complete');
        setTimeout(() => {
          onBootComplete();
        }, 2000);
        return;
      }

      const currentBootStep = bootSteps[stepIndex];
      
      // Set current step to loading
      setBootSteps(prev => prev.map((step, index) => 
        index === stepIndex 
          ? { ...step, status: 'loading' }
          : step
      ));
      setCurrentStep(stepIndex);
      setCurrentSubStep(0);

      // Process sub-steps
      if (currentBootStep.subSteps) {
        const subStepInterval = currentBootStep.duration / currentBootStep.subSteps.length;
        
        currentBootStep.subSteps.forEach((_, subIndex) => {
          setTimeout(() => {
            setCurrentSubStep(subIndex);
          }, subIndex * subStepInterval);
        });
      }

      // Simulate potential error for demonstration (very low chance)
      const shouldError = Math.random() < 0.05 && !currentBootStep.critical;
      
      setTimeout(() => {
        if (shouldError) {
          // Handle error
          setBootSteps(prev => prev.map((step, index) => 
            index === stepIndex 
              ? { ...step, status: 'error' }
              : step
          ));
          
          // Auto-retry after a moment
          setTimeout(() => {
            setBootSteps(prev => prev.map((step, index) => 
              index === stepIndex 
                ? { ...step, status: 'complete' }
                : step
            ));
            
            setBootProgress(((stepIndex + 1) / bootSteps.length) * 100);
            stepIndex++;
            setTimeout(processStep, 500);
          }, 1000);
        } else {
          // Complete step successfully
          setBootSteps(prev => prev.map((step, index) => 
            index === stepIndex 
              ? { ...step, status: 'complete' }
              : step
          ));
          
          setBootProgress(((stepIndex + 1) / bootSteps.length) * 100);
          stepIndex++;
          
          // Process next step
          setTimeout(processStep, 500);
        }
      }, currentBootStep.duration);
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
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
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
        {bootPhase === 'logo' ? (
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
        ) : bootPhase === 'boot' ? (
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
              <div className="w-full bg-gray-800 rounded-full h-3 mb-4 overflow-hidden">
                <motion.div
                  className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${bootProgress}%` }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </motion.div>
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
                      ? 'border-yellow-400/50 bg-yellow-900/10 shadow-lg shadow-yellow-400/20' 
                      : step.status === 'complete'
                      ? 'border-green-400/50 bg-green-900/10 shadow-lg shadow-green-400/20'
                      : step.status === 'error'
                      ? 'border-red-400/50 bg-red-900/10 shadow-lg shadow-red-400/20'
                      : 'border-gray-600/50 bg-gray-900/10'
                  }`}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`${getStatusColor(step.status)} relative`}>
                      {step.icon}
                      {step.critical && step.status === 'loading' && (
                        <div className="absolute -inset-1 bg-yellow-400/20 rounded-full animate-ping" />
                      )}
                    </div>
                    <h3 className={`text-lg font-semibold ${getStatusColor(step.status)} flex-1`}>
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
                          animate={{ 
                            opacity: subIndex <= currentSubStep ? 1 : 0.3,
                            x: 0 
                          }}
                          transition={{ delay: subIndex * 0.3 }}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <motion.div
                            className={`w-2 h-2 rounded-full ${
                              subIndex <= currentSubStep ? 'bg-yellow-400' : 'bg-gray-600'
                            }`}
                            animate={subIndex === currentSubStep ? { 
                              scale: [1, 1.2, 1],
                              opacity: [1, 0.7, 1]
                            } : {}}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                          <span className={subIndex <= currentSubStep ? 'text-gray-300' : 'text-gray-500'}>
                            {subStep}
                          </span>
                          {subIndex < currentSubStep && (
                            <CheckCircle className="w-3 h-3 text-green-400 ml-auto" />
                          )}
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
                          <span>{subStep.replace(/\.\.\.$/, ' ✓')}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {step.status === 'error' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="ml-9 text-sm text-red-300"
                    >
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>System anomaly detected - auto-recovery initiated</span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center"
          >
            <div className="bg-green-900/20 border border-green-400/50 rounded-lg p-8 max-w-md mx-auto">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              </motion.div>
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
      </AnimatePresence>
    </div>
  );
};

export default BootSequence;