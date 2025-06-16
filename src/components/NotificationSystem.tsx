import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { SystemNotification } from './MagicalOS';

interface NotificationSystemProps {
  notifications: SystemNotification[];
  onRemove: (id: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, onRemove }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} />;
      case 'warning': return <AlertTriangle size={16} />;
      case 'error': return <AlertCircle size={16} />;
      default: return <Info size={16} />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-500/30 bg-green-900/20 text-green-300';
      case 'warning': return 'border-yellow-500/30 bg-yellow-900/20 text-yellow-300';
      case 'error': return 'border-red-500/30 bg-red-900/20 text-red-300';
      default: return 'border-blue-500/30 bg-blue-900/20 text-blue-300';
    }
  };

  return (
    <div className="fixed top-16 md:top-20 right-2 md:right-4 z-50 space-y-2 max-w-xs md:max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className={`border rounded-lg p-3 md:p-4 backdrop-blur-sm ${getColors(notification.type)} relative overflow-hidden`}
          >
            {/* Mystical Background Effect */}
            <div className="absolute inset-0 mystical-notification-bg opacity-20"></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {getIcon(notification.type)}
                  <h4 className="font-semibold text-xs md:text-sm truncate">{notification.title}</h4>
                </div>
                <button
                  onClick={() => onRemove(notification.id)}
                  className="text-gray-400 hover:text-white transition-colors flex-shrink-0 ml-2"
                >
                  <X size={14} />
                </button>
              </div>
              
              <p className="text-xs opacity-90 mb-2 break-words">{notification.message}</p>
              
              <div className="flex justify-between items-center text-xs opacity-70">
                <span>{notification.timestamp.toLocaleTimeString()}</span>
                {notification.chamber && (
                  <span className="bg-black/30 px-2 py-1 rounded truncate max-w-20 md:max-w-none">
                    {notification.chamber}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationSystem;