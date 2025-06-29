import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageCircle, Share2, Eye, Settings, UserPlus, Crown, Shield } from 'lucide-react';
import { SystemNotification } from './MagicalOS';

interface User {
  username: string;
  accessLevel: 'root' | 'executor' | 'guest';
  authenticated: boolean;
}

interface CollaborationHubProps {
  user: User;
  onNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp'>) => void;
}

interface ConnectedUser {
  id: string;
  username: string;
  accessLevel: 'root' | 'executor' | 'guest';
  status: 'online' | 'away' | 'busy' | 'offline';
  currentActivity: string;
  location: string;
  joinedAt: Date;
  avatar?: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  type: 'message' | 'system' | 'spell' | 'transformation';
  metadata?: any;
}

interface SharedSession {
  id: string;
  name: string;
  type: 'spellcraft' | 'transformation' | 'energy' | 'exploration';
  host: string;
  participants: string[];
  maxParticipants: number;
  isPrivate: boolean;
  created: Date;
  status: 'active' | 'paused' | 'completed';
}

const CollaborationHub: React.FC<CollaborationHubProps> = ({ user, onNotification }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'chat' | 'sessions' | 'share'>('users');
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [sharedSessions, setSharedSessions] = useState<SharedSession[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<ConnectedUser | null>(null);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [newSession, setNewSession] = useState({
    name: '',
    type: 'spellcraft' as const,
    maxParticipants: 4,
    isPrivate: false
  });

  useEffect(() => {
    // Simulate connected users
    initializeConnectedUsers();
    initializeChatMessages();
    initializeSharedSessions();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      updateUserActivities();
      simulateNewMessages();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const initializeConnectedUsers = () => {
    const sampleUsers: ConnectedUser[] = [
      {
        id: '1',
        username: 'Valtharix',
        accessLevel: 'root',
        status: 'online',
        currentActivity: 'Managing Void Nexus',
        location: 'Void Nexus',
        joinedAt: new Date(Date.now() - 3600000),
        avatar: '👑'
      },
      {
        id: '2',
        username: 'Pyromancer_Supreme',
        accessLevel: 'executor',
        status: 'busy',
        currentActivity: 'Crafting Fire Spells',
        location: 'Ember Ring',
        joinedAt: new Date(Date.now() - 7200000),
        avatar: '🔥'
      },
      {
        id: '3',
        username: 'Memory_Keeper',
        accessLevel: 'executor',
        status: 'online',
        currentActivity: 'Organizing Soul Registry',
        location: 'Memory Sanctum',
        joinedAt: new Date(Date.now() - 1800000),
        avatar: '🧠'
      },
      {
        id: '4',
        username: 'Crystal_Miner',
        accessLevel: 'guest',
        status: 'away',
        currentActivity: 'Idle',
        location: 'Prism Atrium',
        joinedAt: new Date(Date.now() - 900000),
        avatar: '💎'
      },
      {
        id: '5',
        username: 'Void_Walker',
        accessLevel: 'executor',
        status: 'online',
        currentActivity: 'Exploring Dimensions',
        location: 'Mirror Maze',
        joinedAt: new Date(Date.now() - 5400000),
        avatar: '🌌'
      }
    ];
    
    setConnectedUsers(sampleUsers);
  };

  const initializeChatMessages = () => {
    const sampleMessages: ChatMessage[] = [
      {
        id: '1',
        sender: 'Valtharix',
        content: 'Welcome to the Eternum Bastion collaboration hub. May your mystical endeavors be fruitful.',
        timestamp: new Date(Date.now() - 3600000),
        type: 'system'
      },
      {
        id: '2',
        sender: 'Pyromancer_Supreme',
        content: 'Just completed a legendary fire spell! The Ember Ring is resonating beautifully.',
        timestamp: new Date(Date.now() - 3000000),
        type: 'message'
      },
      {
        id: '3',
        sender: 'Memory_Keeper',
        content: 'Anyone interested in a collaborative soul transformation? I have some interesting patterns to share.',
        timestamp: new Date(Date.now() - 2400000),
        type: 'message'
      },
      {
        id: '4',
        sender: 'System',
        content: 'Void_Walker successfully completed a dimensional rift spell',
        timestamp: new Date(Date.now() - 1800000),
        type: 'spell',
        metadata: { spellType: 'dimensional', success: true }
      },
      {
        id: '5',
        sender: 'Crystal_Miner',
        content: 'The Prism Atrium is showing some unusual energy patterns. Anyone else notice this?',
        timestamp: new Date(Date.now() - 1200000),
        type: 'message'
      }
    ];
    
    setChatMessages(sampleMessages);
  };

  const initializeSharedSessions = () => {
    const sampleSessions: SharedSession[] = [
      {
        id: '1',
        name: 'Advanced Spell Crafting Workshop',
        type: 'spellcraft',
        host: 'Pyromancer_Supreme',
        participants: ['Pyromancer_Supreme', 'Memory_Keeper', 'Void_Walker'],
        maxParticipants: 5,
        isPrivate: false,
        created: new Date(Date.now() - 1800000),
        status: 'active'
      },
      {
        id: '2',
        name: 'Void Nexus Investigation',
        type: 'exploration',
        host: 'Valtharix',
        participants: ['Valtharix', 'Void_Walker'],
        maxParticipants: 3,
        isPrivate: true,
        created: new Date(Date.now() - 3600000),
        status: 'active'
      },
      {
        id: '3',
        name: 'Energy Optimization Study',
        type: 'energy',
        host: 'Memory_Keeper',
        participants: ['Memory_Keeper'],
        maxParticipants: 4,
        isPrivate: false,
        created: new Date(Date.now() - 900000),
        status: 'active'
      }
    ];
    
    setSharedSessions(sampleSessions);
  };

  const updateUserActivities = () => {
    const activities = [
      'Crafting Spells', 'Managing Energy', 'Exploring Chambers', 'Studying Prophecies',
      'Organizing Registry', 'Optimizing Systems', 'Meditating', 'Researching'
    ];
    
    setConnectedUsers(prev => prev.map(user => ({
      ...user,
      currentActivity: user.status === 'online' ? activities[Math.floor(Math.random() * activities.length)] : user.currentActivity
    })));
  };

  const simulateNewMessages = () => {
    if (Math.random() < 0.3) {
      const senders = ['Pyromancer_Supreme', 'Memory_Keeper', 'Void_Walker', 'Crystal_Miner'];
      const messages = [
        'Energy levels are looking good today!',
        'Just discovered an interesting spell combination.',
        'The chambers are resonating in perfect harmony.',
        'Anyone want to collaborate on a transformation?',
        'Found some unusual patterns in the void readings.'
      ];
      
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: senders[Math.floor(Math.random() * senders.length)],
        content: messages[Math.floor(Math.random() * messages.length)],
        timestamp: new Date(),
        type: 'message'
      };
      
      setChatMessages(prev => [...prev, newMessage]);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: user.username,
      content: newMessage,
      timestamp: new Date(),
      type: 'message'
    };
    
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
    
    onNotification({
      type: 'info',
      title: 'Message Sent',
      message: 'Your message has been shared with the collaboration hub'
    });
  };

  const createSession = () => {
    if (!newSession.name.trim()) {
      onNotification({
        type: 'error',
        title: 'Invalid Session',
        message: 'Session name is required'
      });
      return;
    }
    
    const session: SharedSession = {
      id: Date.now().toString(),
      name: newSession.name,
      type: newSession.type,
      host: user.username,
      participants: [user.username],
      maxParticipants: newSession.maxParticipants,
      isPrivate: newSession.isPrivate,
      created: new Date(),
      status: 'active'
    };
    
    setSharedSessions(prev => [session, ...prev]);
    setShowCreateSession(false);
    setNewSession({ name: '', type: 'spellcraft', maxParticipants: 4, isPrivate: false });
    
    onNotification({
      type: 'success',
      title: 'Session Created',
      message: `${session.name} is now available for collaboration`
    });
  };

  const joinSession = (sessionId: string) => {
    setSharedSessions(prev => prev.map(session => {
      if (session.id === sessionId && !session.participants.includes(user.username)) {
        if (session.participants.length < session.maxParticipants) {
          return {
            ...session,
            participants: [...session.participants, user.username]
          };
        }
      }
      return session;
    }));
    
    onNotification({
      type: 'success',
      title: 'Joined Session',
      message: 'You have joined the collaborative session'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400 bg-green-400';
      case 'away': return 'text-yellow-400 bg-yellow-400';
      case 'busy': return 'text-red-400 bg-red-400';
      case 'offline': return 'text-gray-400 bg-gray-400';
      default: return 'text-gray-400 bg-gray-400';
    }
  };

  const getAccessIcon = (accessLevel: string) => {
    switch (accessLevel) {
      case 'root': return <Crown className="w-4 h-4 text-yellow-400" />;
      case 'executor': return <Shield className="w-4 h-4 text-blue-400" />;
      case 'guest': return <Users className="w-4 h-4 text-gray-400" />;
      default: return null;
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'spellcraft': return '🔮';
      case 'transformation': return '🦋';
      case 'energy': return '⚡';
      case 'exploration': return '🗺️';
      default: return '📋';
    }
  };

  return (
    <div className="h-full p-6 overflow-y-auto bg-black/20 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-purple-400" />
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Collaboration Hub
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-purple-300">
              {connectedUsers.filter(u => u.status === 'online').length} mystics online
            </div>
            <button
              onClick={() => setShowCreateSession(true)}
              className="px-4 py-2 bg-green-600/20 border border-green-500/30 rounded text-green-300 hover:bg-green-600/30 transition-colors"
            >
              <UserPlus size={16} className="inline mr-2" />
              Create Session
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2">
          {[
            { id: 'users', name: 'Connected Users', icon: <Users size={16} /> },
            { id: 'chat', name: 'Mystical Chat', icon: <MessageCircle size={16} /> },
            { id: 'sessions', name: 'Shared Sessions', icon: <Share2 size={16} /> },
            { id: 'share', name: 'Share Screen', icon: <Eye size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded transition-colors flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-purple-500/30 text-purple-300 border border-purple-400/50'
                  : 'bg-black/30 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connectedUsers.map((connectedUser) => (
                  <motion.div
                    key={connectedUser.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-black/30 border border-purple-500/30 rounded-lg p-4 hover:border-purple-400/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedUser(connectedUser)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-purple-600/20 border border-purple-500/30 rounded-full flex items-center justify-center text-lg">
                            {connectedUser.avatar || '👤'}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${getStatusColor(connectedUser.status).split(' ')[1]}`}></div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-purple-300">{connectedUser.username}</h3>
                            {getAccessIcon(connectedUser.accessLevel)}
                          </div>
                          <div className={`text-xs ${getStatusColor(connectedUser.status).split(' ')[0]}`}>
                            {connectedUser.status}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Activity:</span>
                        <span className="text-white ml-2">{connectedUser.currentActivity}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Location:</span>
                        <span className="text-white ml-2">{connectedUser.location}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Online for:</span>
                        <span className="text-white ml-2">
                          {Math.floor((Date.now() - connectedUser.joinedAt.getTime()) / 60000)}m
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Chat Messages */}
              <div className="bg-black/30 border border-purple-500/30 rounded-lg p-4 h-96 overflow-y-auto">
                <div className="space-y-3">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-3 ${
                        message.sender === user.username ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div className="w-8 h-8 bg-purple-600/20 border border-purple-500/30 rounded-full flex items-center justify-center text-sm">
                        {message.sender === 'System' ? '🤖' : message.sender.charAt(0)}
                      </div>
                      <div className={`flex-1 ${message.sender === user.username ? 'text-right' : ''}`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-purple-300">{message.sender}</span>
                          <span className="text-xs text-gray-400">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                          {message.type !== 'message' && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              message.type === 'system' ? 'bg-blue-500/20 text-blue-400' :
                              message.type === 'spell' ? 'bg-purple-500/20 text-purple-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {message.type}
                            </span>
                          )}
                        </div>
                        <div className={`text-sm p-3 rounded-lg ${
                          message.sender === user.username
                            ? 'bg-purple-600/20 border border-purple-500/30 text-purple-100'
                            : message.type === 'system'
                            ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100'
                            : 'bg-gray-600/20 border border-gray-500/30 text-gray-100'
                        }`}>
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Message Input */}
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 px-4 py-2 bg-black/30 border border-purple-500/30 rounded text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
                  placeholder="Share your mystical thoughts..."
                />
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded text-purple-300 hover:bg-purple-600/30 transition-colors"
                >
                  Send
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'sessions' && (
            <motion.div
              key="sessions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sharedSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    className="bg-black/30 border border-purple-500/30 rounded-lg p-4 hover:border-purple-400/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getSessionTypeIcon(session.type)}</span>
                        <div>
                          <h3 className="font-semibold text-purple-300">{session.name}</h3>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="text-gray-400">{session.type}</span>
                            {session.isPrivate && <span className="text-red-400">Private</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white">
                          {session.participants.length}/{session.maxParticipants}
                        </div>
                        <div className="text-xs text-gray-400">participants</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div>
                        <span className="text-gray-400">Host:</span>
                        <span className="text-white ml-2">{session.host}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Created:</span>
                        <span className="text-white ml-2">
                          {Math.floor((Date.now() - session.created.getTime()) / 60000)}m ago
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Status:</span>
                        <span className={`ml-2 ${
                          session.status === 'active' ? 'text-green-400' :
                          session.status === 'paused' ? 'text-yellow-400' :
                          'text-gray-400'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {session.participants.slice(0, 3).map((participant, index) => (
                          <div
                            key={index}
                            className="w-6 h-6 bg-purple-600/20 border border-purple-500/30 rounded-full flex items-center justify-center text-xs"
                            title={participant}
                          >
                            {participant.charAt(0)}
                          </div>
                        ))}
                        {session.participants.length > 3 && (
                          <div className="w-6 h-6 bg-gray-600/20 border border-gray-500/30 rounded-full flex items-center justify-center text-xs">
                            +{session.participants.length - 3}
                          </div>
                        )}
                      </div>
                      
                      {!session.participants.includes(user.username) && session.participants.length < session.maxParticipants && (
                        <button
                          onClick={() => joinSession(session.id)}
                          className="px-3 py-1 bg-green-600/20 border border-green-500/30 rounded text-green-300 hover:bg-green-600/30 transition-colors text-sm"
                        >
                          Join
                        </button>
                      )}
                      
                      {session.participants.includes(user.username) && (
                        <span className="text-xs text-green-400">Joined</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'share' && (
            <motion.div
              key="share"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <Eye size={48} className="mx-auto mb-4 text-purple-400 opacity-50" />
              <h3 className="text-xl font-semibold text-purple-300 mb-2">Screen Sharing</h3>
              <p className="text-purple-400/70 mb-4">
                Share your mystical workspace with other collaborators
              </p>
              <button className="px-6 py-3 bg-purple-600/20 border border-purple-500/30 rounded text-purple-300 hover:bg-purple-600/30 transition-colors">
                Coming Soon
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Session Modal */}
        <AnimatePresence>
          {showCreateSession && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowCreateSession(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-black/80 border border-purple-500/30 rounded-lg p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-purple-300 mb-4">Create Collaboration Session</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-purple-300 text-sm font-medium mb-2">
                      Session Name
                    </label>
                    <input
                      type="text"
                      value={newSession.name}
                      onChange={(e) => setNewSession(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 bg-black/30 border border-purple-500/30 rounded text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
                      placeholder="Enter session name..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-purple-300 text-sm font-medium mb-2">
                      Session Type
                    </label>
                    <select
                      value={newSession.type}
                      onChange={(e) => setNewSession(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-4 py-2 bg-black/30 border border-purple-500/30 rounded text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="spellcraft">Spell Crafting</option>
                      <option value="transformation">Transformation</option>
                      <option value="energy">Energy Management</option>
                      <option value="exploration">Exploration</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-purple-300 text-sm font-medium mb-2">
                      Max Participants
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="10"
                      value={newSession.maxParticipants}
                      onChange={(e) => setNewSession(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2 bg-black/30 border border-purple-500/30 rounded text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="private"
                      checked={newSession.isPrivate}
                      onChange={(e) => setNewSession(prev => ({ ...prev, isPrivate: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="private" className="text-purple-300 text-sm">
                      Private Session
                    </label>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={createSession}
                    className="flex-1 py-2 bg-purple-600/20 border border-purple-500/30 rounded text-purple-300 hover:bg-purple-600/30 transition-colors"
                  >
                    Create Session
                  </button>
                  <button
                    onClick={() => setShowCreateSession(false)}
                    className="flex-1 py-2 bg-gray-600/20 border border-gray-500/30 rounded text-gray-300 hover:bg-gray-600/30 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CollaborationHub;