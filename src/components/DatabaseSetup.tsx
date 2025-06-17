import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, CheckCircle, AlertTriangle, Settings } from 'lucide-react';
import { DatabaseService } from '../lib/supabase';

interface DatabaseSetupProps {
  onSetupComplete: () => void;
}

const DatabaseSetup: React.FC<DatabaseSetupProps> = ({ onSetupComplete }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [setupStep, setSetupStep] = useState(0);

  const setupSteps = [
    'Connecting to Dimensional Database...',
    'Initializing Soul Registry...',
    'Calibrating Energy Matrices...',
    'Synchronizing Prophecy Engine...',
    'Establishing Mystical Protocols...',
    'Database Integration Complete!'
  ];

  const testConnection = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Test basic connection
      const user = await DatabaseService.getCurrentUser();
      
      // Simulate setup steps
      for (let i = 0; i < setupSteps.length; i++) {
        setSetupStep(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setIsConnected(true);
      setTimeout(() => {
        onSetupComplete();
      }, 2000);
      
    } catch (err) {
      setError('Failed to connect to dimensional database. Please check your Supabase configuration.');
      console.error('Database connection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-indigo-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 magical-background opacity-30"></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-md w-full bg-black/80 border border-purple-500/30 rounded-2xl p-8 backdrop-blur-sm"
      >
        <div className="text-center mb-8">
          <motion.div
            className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center"
            animate={{ 
              rotate: isLoading ? 360 : 0,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: isLoading ? Infinity : 0, ease: "linear" },
              scale: { duration: 2, repeat: Infinity }
            }}
          >
            <Database className="w-8 h-8 text-white" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            Database Integration
          </h1>
          <p className="text-purple-300 text-sm">
            Connecting to the Dimensional Archive
          </p>
        </div>

        {!isConnected && !isLoading && (
          <div className="space-y-6">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-blue-300 font-semibold mb-2 flex items-center">
                <Settings size={16} className="mr-2" />
                Setup Required
              </h3>
              <p className="text-blue-200 text-sm mb-3">
                To enable full functionality, you need to set up Supabase:
              </p>
              <ol className="text-blue-200 text-xs space-y-1 list-decimal list-inside">
                <li>Create a Supabase project at supabase.com</li>
                <li>Copy your project URL and anon key</li>
                <li>Create a .env file with your credentials</li>
                <li>Run the database schema setup</li>
              </ol>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-red-300">
                  <AlertTriangle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            <button
              onClick={testConnection}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              Initialize Database Connection
            </button>

            <button
              onClick={onSetupComplete}
              className="w-full py-2 bg-gray-600/20 border border-gray-500/30 rounded text-gray-300 hover:bg-gray-600/30 transition-colors text-sm"
            >
              Skip (Use Local Storage)
            </button>
          </div>
        )}

        {isLoading && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-purple-300 mb-4">{setupSteps[setupStep]}</div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${((setupStep + 1) / setupSteps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {setupStep + 1} of {setupSteps.length}
              </div>
            </div>
          </div>
        )}

        {isConnected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 bg-green-500/20 border border-green-400/50 rounded-full mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-400 mb-2">
                Connection Established
              </h3>
              <p className="text-green-300 text-sm">
                Dimensional database successfully integrated. All mystical systems are now operational.
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default DatabaseSetup;