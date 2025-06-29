import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Target, Clock, Gift, Zap, Users, BookOpen } from 'lucide-react';
import { SystemNotification } from './MagicalOS';

interface User {
  username: string;
  accessLevel: 'root' | 'executor' | 'guest';
  authenticated: boolean;
}

interface QuestSystemProps {
  user: User;
  onNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp'>) => void;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'story' | 'achievement';
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  progress: number;
  maxProgress: number;
  rewards: {
    xp: number;
    essence: number;
    title?: string;
    items?: string[];
  };
  requirements: string[];
  timeLimit?: Date;
  completed: boolean;
  category: 'transformation' | 'spellcraft' | 'energy' | 'exploration' | 'social';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum' | 'mythic';
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

interface UserProgress {
  level: number;
  xp: number;
  xpToNext: number;
  mysticalEssence: number;
  titles: string[];
  currentTitle: string;
}

const QuestSystem: React.FC<QuestSystemProps> = ({ user, onNotification }) => {
  const [activeTab, setActiveTab] = useState<'quests' | 'achievements' | 'progress'>('quests');
  const [quests, setQuests] = useState<Quest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 1,
    xp: 0,
    xpToNext: 100,
    mysticalEssence: 0,
    titles: ['Initiate'],
    currentTitle: 'Initiate'
  });
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

  useEffect(() => {
    initializeQuests();
    initializeAchievements();
    loadUserProgress();
    
    // Listen for quest progress events
    const handleQuestAction = (event: CustomEvent) => {
      updateQuestProgress(event.detail.action);
    };
    
    window.addEventListener('quest_action', handleQuestAction as EventListener);
    
    return () => {
      window.removeEventListener('quest_action', handleQuestAction as EventListener);
    };
  }, []);

  const initializeQuests = () => {
    const sampleQuests: Quest[] = [
      {
        id: 'daily_1',
        title: 'Energy Harmonization',
        description: 'Check energy levels in all chambers and optimize allocation',
        type: 'daily',
        difficulty: 'easy',
        progress: 0,
        maxProgress: 6,
        rewards: { xp: 50, essence: 25 },
        requirements: [],
        timeLimit: new Date(Date.now() + 24 * 60 * 60 * 1000),
        completed: false,
        category: 'energy'
      },
      {
        id: 'daily_2',
        title: 'Spell Crafting Practice',
        description: 'Create 3 new spells using different rune combinations',
        type: 'daily',
        difficulty: 'medium',
        progress: 0,
        maxProgress: 3,
        rewards: { xp: 75, essence: 40, items: ['Spell Components'] },
        requirements: [],
        timeLimit: new Date(Date.now() + 24 * 60 * 60 * 1000),
        completed: false,
        category: 'spellcraft'
      },
      {
        id: 'weekly_1',
        title: 'Master Transformer',
        description: 'Successfully complete 10 transformations without failure',
        type: 'weekly',
        difficulty: 'hard',
        progress: 0,
        maxProgress: 10,
        rewards: { xp: 200, essence: 100, title: 'Transformation Adept' },
        requirements: ['Executor Access'],
        timeLimit: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        completed: false,
        category: 'transformation'
      },
      {
        id: 'story_1',
        title: 'The Void Nexus Mystery',
        description: 'Investigate the anomalous readings from the Void Nexus chamber',
        type: 'story',
        difficulty: 'legendary',
        progress: 0,
        maxProgress: 5,
        rewards: { xp: 500, essence: 250, title: 'Void Walker', items: ['Void Essence', 'Ancient Knowledge'] },
        requirements: ['Root Access', 'Void Nexus Access'],
        completed: false,
        category: 'exploration'
      },
      {
        id: 'achievement_1',
        title: 'Prophecy Weaver',
        description: 'Generate 25 accurate prophecies',
        type: 'achievement',
        difficulty: 'hard',
        progress: 0,
        maxProgress: 25,
        rewards: { xp: 300, essence: 150, title: 'Oracle of Shadows' },
        requirements: ['Executor Access'],
        completed: false,
        category: 'exploration'
      }
    ];
    
    setQuests(sampleQuests);
  };

  const initializeAchievements = () => {
    const sampleAchievements: Achievement[] = [
      {
        id: 'first_spell',
        title: 'First Incantation',
        description: 'Craft your first spell',
        icon: '🔮',
        rarity: 'bronze',
        unlocked: false,
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'energy_master',
        title: 'Energy Master',
        description: 'Achieve 95% efficiency in all chambers simultaneously',
        icon: '⚡',
        rarity: 'gold',
        unlocked: false,
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'transformation_expert',
        title: 'Metamorphosis Expert',
        description: 'Complete 100 successful transformations',
        icon: '🦋',
        rarity: 'platinum',
        unlocked: false,
        progress: 0,
        maxProgress: 100
      },
      {
        id: 'void_touched',
        title: 'Void Touched',
        description: 'Survive direct contact with void essence',
        icon: '🕳️',
        rarity: 'mythic',
        unlocked: false,
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'social_butterfly',
        title: 'Mystical Socialite',
        description: 'Collaborate with 10 different mystics',
        icon: '👥',
        rarity: 'silver',
        unlocked: false,
        progress: 0,
        maxProgress: 10
      }
    ];
    
    setAchievements(sampleAchievements);
  };

  const loadUserProgress = () => {
    const savedProgress = localStorage.getItem(`eternum_progress_${user.username}`);
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
  };

  const saveUserProgress = (progress: UserProgress) => {
    setUserProgress(progress);
    localStorage.setItem(`eternum_progress_${user.username}`, JSON.stringify(progress));
  };

  const updateQuestProgress = (action: string) => {
    setQuests(prev => prev.map(quest => {
      let shouldUpdate = false;
      let progressIncrease = 0;

      switch (action) {
        case 'energy_check':
          if (quest.category === 'energy' && !quest.completed) {
            shouldUpdate = true;
            progressIncrease = 1;
          }
          break;
        case 'spell_crafted':
          if (quest.category === 'spellcraft' && !quest.completed) {
            shouldUpdate = true;
            progressIncrease = 1;
          }
          break;
        case 'transformation_complete':
          if (quest.category === 'transformation' && !quest.completed) {
            shouldUpdate = true;
            progressIncrease = 1;
          }
          break;
        case 'prophecy_generated':
          if (quest.id === 'achievement_1' && !quest.completed) {
            shouldUpdate = true;
            progressIncrease = 1;
          }
          break;
      }

      if (shouldUpdate) {
        const newProgress = Math.min(quest.progress + progressIncrease, quest.maxProgress);
        const isCompleted = newProgress >= quest.maxProgress;
        
        if (isCompleted && !quest.completed) {
          completeQuest(quest);
        }
        
        return { ...quest, progress: newProgress, completed: isCompleted };
      }
      
      return quest;
    }));
  };

  const completeQuest = (quest: Quest) => {
    const newProgress = {
      ...userProgress,
      xp: userProgress.xp + quest.rewards.xp,
      mysticalEssence: userProgress.mysticalEssence + quest.rewards.essence
    };

    // Check for level up
    if (newProgress.xp >= userProgress.xpToNext) {
      newProgress.level += 1;
      newProgress.xp = newProgress.xp - userProgress.xpToNext;
      newProgress.xpToNext = Math.floor(userProgress.xpToNext * 1.5);
      
      onNotification({
        type: 'success',
        title: 'Level Up!',
        message: `Congratulations! You've reached level ${newProgress.level}!`
      });
    }

    // Add title if quest rewards one
    if (quest.rewards.title && !newProgress.titles.includes(quest.rewards.title)) {
      newProgress.titles.push(quest.rewards.title);
      onNotification({
        type: 'success',
        title: 'New Title Unlocked!',
        message: `You've earned the title: ${quest.rewards.title}`
      });
    }

    saveUserProgress(newProgress);
    
    onNotification({
      type: 'success',
      title: 'Quest Complete!',
      message: `${quest.title} completed! +${quest.rewards.xp} XP, +${quest.rewards.essence} Essence`
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 border-green-400/30';
      case 'medium': return 'text-yellow-400 border-yellow-400/30';
      case 'hard': return 'text-orange-400 border-orange-400/30';
      case 'legendary': return 'text-purple-400 border-purple-400/30';
      default: return 'text-gray-400 border-gray-400/30';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'bronze': return 'text-orange-600 border-orange-600/30';
      case 'silver': return 'text-gray-400 border-gray-400/30';
      case 'gold': return 'text-yellow-400 border-yellow-400/30';
      case 'platinum': return 'text-blue-400 border-blue-400/30';
      case 'mythic': return 'text-purple-400 border-purple-400/30';
      default: return 'text-gray-400 border-gray-400/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Clock className="w-4 h-4" />;
      case 'weekly': return <Target className="w-4 h-4" />;
      case 'story': return <BookOpen className="w-4 h-4" />;
      case 'achievement': return <Trophy className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const formatTimeRemaining = (timeLimit?: Date) => {
    if (!timeLimit) return null;
    
    const now = new Date();
    const diff = timeLimit.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const getFilteredQuests = () => {
    if (filterType === 'all') return quests;
    return quests.filter(quest => quest.type === filterType || quest.category === filterType);
  };

  return (
    <div className="h-full p-6 overflow-y-auto bg-black/20 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              Quest System
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-black/30 border border-purple-500/30 rounded-lg px-3 py-2">
              <div className="text-sm text-purple-400">Level {userProgress.level}</div>
              <div className="text-xs text-gray-400">{userProgress.currentTitle}</div>
            </div>
            <div className="bg-black/30 border border-blue-500/30 rounded-lg px-3 py-2">
              <div className="text-sm text-blue-400">{userProgress.xp}/{userProgress.xpToNext} XP</div>
              <div className="w-20 bg-gray-700 rounded-full h-1 mt-1">
                <div
                  className="h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ width: `${(userProgress.xp / userProgress.xpToNext) * 100}%` }}
                />
              </div>
            </div>
            <div className="bg-black/30 border border-yellow-500/30 rounded-lg px-3 py-2">
              <div className="text-sm text-yellow-400">{userProgress.mysticalEssence} Essence</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2">
          {[
            { id: 'quests', name: 'Active Quests', icon: <Target size={16} /> },
            { id: 'achievements', name: 'Achievements', icon: <Trophy size={16} /> },
            { id: 'progress', name: 'Progress', icon: <Star size={16} /> }
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
          {activeTab === 'quests' && (
            <motion.div
              key="quests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Filters */}
              <div className="flex items-center space-x-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 bg-black/30 border border-purple-500/30 rounded text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="all">All Quests</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="story">Story</option>
                  <option value="achievement">Achievement</option>
                  <option value="transformation">Transformation</option>
                  <option value="spellcraft">Spellcraft</option>
                  <option value="energy">Energy</option>
                  <option value="exploration">Exploration</option>
                </select>
                
                <div className="text-sm text-purple-300">
                  {getFilteredQuests().length} quests available
                </div>
              </div>

              {/* Quest Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredQuests().map((quest) => (
                  <motion.div
                    key={quest.id}
                    whileHover={{ scale: 1.02 }}
                    className={`bg-black/30 border rounded-lg p-4 hover:border-purple-400/50 transition-colors cursor-pointer ${
                      quest.completed ? 'opacity-60' : ''
                    }`}
                    onClick={() => setSelectedQuest(quest)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(quest.type)}
                        <div>
                          <h3 className="font-semibold text-purple-300">{quest.title}</h3>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className={`px-2 py-1 rounded ${getDifficultyColor(quest.difficulty)}`}>
                              {quest.difficulty}
                            </span>
                            <span className="text-gray-400">{quest.type}</span>
                          </div>
                        </div>
                      </div>
                      {quest.completed && <Trophy className="w-5 h-5 text-yellow-400" />}
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-3 line-clamp-3">{quest.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{quest.progress}/{quest.maxProgress}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                          style={{ width: `${(quest.progress / quest.maxProgress) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Rewards */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-400">+{quest.rewards.xp} XP</span>
                        <span className="text-yellow-400">+{quest.rewards.essence} Essence</span>
                      </div>
                      {quest.timeLimit && (
                        <span className="text-orange-400">
                          {formatTimeRemaining(quest.timeLimit)}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    className={`bg-black/30 border rounded-lg p-4 ${getRarityColor(achievement.rarity)} ${
                      achievement.unlocked ? 'border-opacity-100' : 'border-opacity-30 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div>
                          <h3 className="font-semibold text-purple-300">{achievement.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${getRarityColor(achievement.rarity)}`}>
                            {achievement.rarity}
                          </span>
                        </div>
                      </div>
                      {achievement.unlocked && <Star className="w-5 h-5 text-yellow-400" />}
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-3">{achievement.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                          style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    {achievement.unlocked && achievement.unlockedAt && (
                      <div className="text-xs text-gray-400">
                        Unlocked: {achievement.unlockedAt.toLocaleDateString()}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Level Progress */}
              <div className="bg-black/30 border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-300 mb-4">Character Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">{userProgress.level}</div>
                    <div className="text-sm text-gray-400">Current Level</div>
                    <div className="w-full bg-gray-700 rounded-full h-3 mt-2">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${(userProgress.xp / userProgress.xpToNext) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {userProgress.xp}/{userProgress.xpToNext} XP
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-2">{userProgress.mysticalEssence}</div>
                    <div className="text-sm text-gray-400">Mystical Essence</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">{userProgress.titles.length}</div>
                    <div className="text-sm text-gray-400">Titles Earned</div>
                  </div>
                </div>
              </div>

              {/* Titles */}
              <div className="bg-black/30 border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-300 mb-4">Earned Titles</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {userProgress.titles.map((title, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border text-center cursor-pointer transition-colors ${
                        title === userProgress.currentTitle
                          ? 'border-yellow-400/50 bg-yellow-400/20 text-yellow-300'
                          : 'border-purple-500/30 bg-black/20 text-purple-300 hover:border-purple-400/50'
                      }`}
                      onClick={() => setUserProgress(prev => ({ ...prev, currentTitle: title }))}
                    >
                      <div className="text-sm font-medium">{title}</div>
                      {title === userProgress.currentTitle && (
                        <div className="text-xs text-yellow-400 mt-1">Active</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-black/30 border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-300 mb-4">Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {quests.filter(q => q.completed).length}
                    </div>
                    <div className="text-sm text-gray-400">Quests Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {achievements.filter(a => a.unlocked).length}
                    </div>
                    <div className="text-sm text-gray-400">Achievements Unlocked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {Math.floor((quests.filter(q => q.completed).length / quests.length) * 100)}%
                    </div>
                    <div className="text-sm text-gray-400">Completion Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {userProgress.titles.length}
                    </div>
                    <div className="text-sm text-gray-400">Titles Earned</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quest Detail Modal */}
        <AnimatePresence>
          {selectedQuest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedQuest(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-black/80 border border-purple-500/30 rounded-lg p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-purple-300">{selectedQuest.title}</h3>
                  <button
                    onClick={() => setSelectedQuest(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-300">{selectedQuest.description}</p>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(selectedQuest.difficulty)}`}>
                      {selectedQuest.difficulty}
                    </span>
                    <span className="text-gray-400 text-xs">{selectedQuest.category}</span>
                  </div>
                  
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Progress</span>
                      <span>{selectedQuest.progress}/{selectedQuest.maxProgress}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${(selectedQuest.progress / selectedQuest.maxProgress) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Requirements */}
                  {selectedQuest.requirements.length > 0 && (
                    <div>
                      <div className="text-sm text-purple-400 mb-2">Requirements:</div>
                      <div className="space-y-1">
                        {selectedQuest.requirements.map((req, index) => (
                          <div key={index} className="text-xs text-gray-400">• {req}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Rewards */}
                  <div>
                    <div className="text-sm text-purple-400 mb-2">Rewards:</div>
                    <div className="space-y-1 text-xs">
                      <div className="text-blue-400">• {selectedQuest.rewards.xp} Experience Points</div>
                      <div className="text-yellow-400">• {selectedQuest.rewards.essence} Mystical Essence</div>
                      {selectedQuest.rewards.title && (
                        <div className="text-purple-400">• Title: {selectedQuest.rewards.title}</div>
                      )}
                      {selectedQuest.rewards.items && selectedQuest.rewards.items.map((item, index) => (
                        <div key={index} className="text-green-400">• {item}</div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Time Limit */}
                  {selectedQuest.timeLimit && (
                    <div className="text-sm">
                      <span className="text-orange-400">Time Remaining: </span>
                      <span className="text-white">{formatTimeRemaining(selectedQuest.timeLimit)}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuestSystem;