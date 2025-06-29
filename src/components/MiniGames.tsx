import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Puzzle, Zap, Brain, Shuffle, Trophy, Star, Timer, Target } from 'lucide-react';
import { SystemNotification } from './MagicalOS';

interface User {
  username: string;
  accessLevel: 'root' | 'executor' | 'guest';
  authenticated: boolean;
}

interface MiniGamesProps {
  user: User;
  onNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp'>) => void;
}

interface GameScore {
  game: string;
  score: number;
  timestamp: Date;
}

interface RunePattern {
  id: string;
  symbol: string;
  color: string;
  matched: boolean;
}

const MiniGames: React.FC<MiniGamesProps> = ({ user, onNotification }) => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [gameScores, setGameScores] = useState<GameScore[]>([]);
  
  // Rune Matching Game State
  const [runeGrid, setRuneGrid] = useState<RunePattern[]>([]);
  const [selectedRunes, setSelectedRunes] = useState<number[]>([]);
  const [runeScore, setRuneScore] = useState(0);
  const [runeLevel, setRuneLevel] = useState(1);
  const [runeTimeLeft, setRuneTimeLeft] = useState(60);
  
  // Energy Balancing Game State
  const [energyChannels, setEnergyChannels] = useState<number[]>([50, 50, 50, 50, 50, 50]);
  const [targetEnergy, setTargetEnergy] = useState<number[]>([]);
  const [energyScore, setEnergyScore] = useState(0);
  const [energyMoves, setEnergyMoves] = useState(0);
  
  // Memory Palace Game State
  const [memorySequence, setMemorySequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [memoryLevel, setMemoryLevel] = useState(1);
  const [showingSequence, setShowingSequence] = useState(false);
  const [memoryScore, setMemoryScore] = useState(0);

  const runeSymbols = ['🔥', '💧', '🌍', '💨', '⚡', '🌟', '🌙', '☀️'];
  const runeColors = ['text-red-400', 'text-blue-400', 'text-green-400', 'text-cyan-400', 'text-yellow-400', 'text-purple-400', 'text-indigo-400', 'text-orange-400'];

  useEffect(() => {
    // Load saved scores
    const savedScores = localStorage.getItem('eternum_game_scores');
    if (savedScores) {
      setGameScores(JSON.parse(savedScores));
    }
  }, []);

  useEffect(() => {
    // Rune matching timer
    if (activeGame === 'rune-matching' && runeTimeLeft > 0) {
      const timer = setTimeout(() => {
        setRuneTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (activeGame === 'rune-matching' && runeTimeLeft === 0) {
      endRuneGame();
    }
  }, [activeGame, runeTimeLeft]);

  const saveScore = (game: string, score: number) => {
    const newScore: GameScore = {
      game,
      score,
      timestamp: new Date()
    };
    const updatedScores = [...gameScores, newScore];
    setGameScores(updatedScores);
    localStorage.setItem('eternum_game_scores', JSON.stringify(updatedScores));
  };

  const getHighScore = (game: string) => {
    const gameScores = gameScores.filter(s => s.game === game);
    return gameScores.length > 0 ? Math.max(...gameScores.map(s => s.score)) : 0;
  };

  // Rune Matching Game Functions
  const startRuneGame = () => {
    setActiveGame('rune-matching');
    setRuneScore(0);
    setRuneLevel(1);
    setRuneTimeLeft(60);
    generateRuneGrid();
  };

  const generateRuneGrid = () => {
    const gridSize = 16;
    const symbolCount = Math.min(4 + runeLevel, runeSymbols.length);
    const grid: RunePattern[] = [];
    
    // Create pairs
    for (let i = 0; i < gridSize / 2; i++) {
      const symbolIndex = i % symbolCount;
      const pattern: RunePattern = {
        id: `rune-${i}`,
        symbol: runeSymbols[symbolIndex],
        color: runeColors[symbolIndex],
        matched: false
      };
      grid.push(pattern, { ...pattern, id: `rune-${i}-pair` });
    }
    
    // Shuffle grid
    for (let i = grid.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [grid[i], grid[j]] = [grid[j], grid[i]];
    }
    
    setRuneGrid(grid);
    setSelectedRunes([]);
  };

  const selectRune = (index: number) => {
    if (selectedRunes.length === 2 || runeGrid[index].matched) return;
    
    const newSelected = [...selectedRunes, index];
    setSelectedRunes(newSelected);
    
    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (runeGrid[first].symbol === runeGrid[second].symbol) {
        // Match found
        setTimeout(() => {
          setRuneGrid(prev => prev.map((rune, i) => 
            i === first || i === second ? { ...rune, matched: true } : rune
          ));
          setRuneScore(prev => prev + 100 * runeLevel);
          setSelectedRunes([]);
          
          // Check if level complete
          if (runeGrid.filter(r => !r.matched).length === 2) {
            setRuneLevel(prev => prev + 1);
            setRuneTimeLeft(prev => prev + 30);
            setTimeout(generateRuneGrid, 1000);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setSelectedRunes([]);
        }, 1000);
      }
    }
  };

  const endRuneGame = () => {
    saveScore('rune-matching', runeScore);
    onNotification({
      type: 'success',
      title: 'Rune Matching Complete',
      message: `Final Score: ${runeScore} points! Level reached: ${runeLevel}`
    });
    setActiveGame(null);
  };

  // Energy Balancing Game Functions
  const startEnergyGame = () => {
    setActiveGame('energy-balancing');
    setEnergyScore(0);
    setEnergyMoves(0);
    generateEnergyTarget();
  };

  const generateEnergyTarget = () => {
    const target = Array.from({ length: 6 }, () => Math.floor(Math.random() * 100));
    setTargetEnergy(target);
    setEnergyChannels([50, 50, 50, 50, 50, 50]);
  };

  const adjustEnergy = (channelIndex: number, delta: number) => {
    setEnergyChannels(prev => prev.map((energy, i) => 
      i === channelIndex ? Math.max(0, Math.min(100, energy + delta)) : energy
    ));
    setEnergyMoves(prev => prev + 1);
    
    // Check if target achieved
    const tolerance = 5;
    const achieved = energyChannels.every((energy, i) => 
      Math.abs(energy - targetEnergy[i]) <= tolerance
    );
    
    if (achieved) {
      const score = Math.max(0, 1000 - energyMoves * 10);
      setEnergyScore(prev => prev + score);
      onNotification({
        type: 'success',
        title: 'Energy Balance Achieved',
        message: `Perfect harmony! +${score} points`
      });
      setTimeout(generateEnergyTarget, 2000);
    }
  };

  // Memory Palace Game Functions
  const startMemoryGame = () => {
    setActiveGame('memory-palace');
    setMemoryScore(0);
    setMemoryLevel(1);
    generateMemorySequence();
  };

  const generateMemorySequence = () => {
    const sequence = Array.from({ length: memoryLevel + 2 }, () => Math.floor(Math.random() * 9));
    setMemorySequence(sequence);
    setPlayerSequence([]);
    setShowingSequence(true);
    
    setTimeout(() => {
      setShowingSequence(false);
    }, sequence.length * 800 + 1000);
  };

  const addToPlayerSequence = (number: number) => {
    if (showingSequence) return;
    
    const newSequence = [...playerSequence, number];
    setPlayerSequence(newSequence);
    
    // Check if correct so far
    if (newSequence[newSequence.length - 1] !== memorySequence[newSequence.length - 1]) {
      // Wrong sequence
      onNotification({
        type: 'error',
        title: 'Memory Palace Failed',
        message: `Sequence broken at step ${newSequence.length}`
      });
      saveScore('memory-palace', memoryScore);
      setActiveGame(null);
      return;
    }
    
    // Check if sequence complete
    if (newSequence.length === memorySequence.length) {
      const score = memoryLevel * 100;
      setMemoryScore(prev => prev + score);
      setMemoryLevel(prev => prev + 1);
      onNotification({
        type: 'success',
        title: 'Memory Palace Level Complete',
        message: `Level ${memoryLevel} mastered! +${score} points`
      });
      setTimeout(generateMemorySequence, 1500);
    }
  };

  const games = [
    {
      id: 'rune-matching',
      name: 'Rune Matching',
      description: 'Match mystical runes to unlock ancient knowledge',
      icon: <Puzzle className="w-6 h-6" />,
      difficulty: 'Easy',
      rewards: 'Spell Components'
    },
    {
      id: 'energy-balancing',
      name: 'Energy Balancing',
      description: 'Optimize chamber energy for maximum efficiency',
      icon: <Zap className="w-6 h-6" />,
      difficulty: 'Medium',
      rewards: 'Energy Crystals'
    },
    {
      id: 'memory-palace',
      name: 'Memory Palace',
      description: 'Navigate through consciousness streams',
      icon: <Brain className="w-6 h-6" />,
      difficulty: 'Hard',
      rewards: 'Memory Fragments'
    },
    {
      id: 'transformation-sim',
      name: 'Transformation Simulator',
      description: 'Practice complex transformations safely',
      icon: <Shuffle className="w-6 h-6" />,
      difficulty: 'Expert',
      rewards: 'Transformation Mastery'
    }
  ];

  return (
    <div className="h-full p-6 overflow-y-auto bg-black/20 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        {!activeGame ? (
          <motion.div
            key="game-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  Mystical Mini-Games
                </h2>
              </div>
              
              <div className="text-sm text-purple-300">
                Total Games Played: {gameScores.length}
              </div>
            </div>

            {/* High Scores */}
            <div className="bg-black/30 border border-purple-500/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center">
                <Star className="w-5 h-5 mr-2" />
                High Scores
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {games.map(game => (
                  <div key={game.id} className="text-center">
                    <div className="text-yellow-400 font-bold text-lg">
                      {getHighScore(game.id)}
                    </div>
                    <div className="text-xs text-gray-400">{game.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Game Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {games.map((game) => (
                <motion.div
                  key={game.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-black/30 border border-purple-500/30 rounded-lg p-6 hover:border-purple-400/50 transition-colors cursor-pointer"
                  onClick={() => {
                    if (game.id === 'rune-matching') startRuneGame();
                    else if (game.id === 'energy-balancing') startEnergyGame();
                    else if (game.id === 'memory-palace') startMemoryGame();
                    else {
                      onNotification({
                        type: 'info',
                        title: 'Coming Soon',
                        message: `${game.name} will be available in a future update`
                      });
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-purple-400">
                      {game.icon}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">High Score</div>
                      <div className="text-yellow-400 font-bold">
                        {getHighScore(game.id)}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-purple-300 mb-2">
                    {game.name}
                  </h3>
                  <p className="text-sm text-gray-300 mb-4">
                    {game.description}
                  </p>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className={`px-2 py-1 rounded ${
                      game.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                      game.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      game.difficulty === 'Hard' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {game.difficulty}
                    </span>
                    <span className="text-purple-400">{game.rewards}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : activeGame === 'rune-matching' ? (
          <motion.div
            key="rune-matching"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-6"
          >
            {/* Game Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-purple-300">Rune Matching</h2>
              <button
                onClick={() => setActiveGame(null)}
                className="px-4 py-2 bg-red-600/20 border border-red-500/30 rounded text-red-300 hover:bg-red-600/30 transition-colors"
              >
                Exit Game
              </button>
            </div>

            {/* Game Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-black/30 border border-purple-500/30 rounded-lg p-3 text-center">
                <div className="text-purple-400 text-sm">Score</div>
                <div className="text-white font-bold text-lg">{runeScore}</div>
              </div>
              <div className="bg-black/30 border border-purple-500/30 rounded-lg p-3 text-center">
                <div className="text-purple-400 text-sm">Level</div>
                <div className="text-white font-bold text-lg">{runeLevel}</div>
              </div>
              <div className="bg-black/30 border border-purple-500/30 rounded-lg p-3 text-center">
                <div className="text-purple-400 text-sm">Time</div>
                <div className="text-white font-bold text-lg">{runeTimeLeft}s</div>
              </div>
              <div className="bg-black/30 border border-purple-500/30 rounded-lg p-3 text-center">
                <div className="text-purple-400 text-sm">Matches</div>
                <div className="text-white font-bold text-lg">
                  {runeGrid.filter(r => r.matched).length / 2}
                </div>
              </div>
            </div>

            {/* Rune Grid */}
            <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
              {runeGrid.map((rune, index) => (
                <motion.button
                  key={index}
                  onClick={() => selectRune(index)}
                  className={`aspect-square border-2 rounded-lg flex items-center justify-center text-2xl transition-all ${
                    rune.matched 
                      ? 'border-green-400 bg-green-400/20 opacity-50' 
                      : selectedRunes.includes(index)
                      ? 'border-yellow-400 bg-yellow-400/20'
                      : 'border-purple-500/30 bg-black/30 hover:border-purple-400/50'
                  }`}
                  whileHover={{ scale: rune.matched ? 1 : 1.05 }}
                  whileTap={{ scale: rune.matched ? 1 : 0.95 }}
                  disabled={rune.matched}
                >
                  <span className={rune.color}>
                    {selectedRunes.includes(index) || rune.matched ? rune.symbol : '?'}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : activeGame === 'energy-balancing' ? (
          <motion.div
            key="energy-balancing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-6"
          >
            {/* Game Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-yellow-300">Energy Balancing</h2>
              <button
                onClick={() => setActiveGame(null)}
                className="px-4 py-2 bg-red-600/20 border border-red-500/30 rounded text-red-300 hover:bg-red-600/30 transition-colors"
              >
                Exit Game
              </button>
            </div>

            {/* Game Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 border border-purple-500/30 rounded-lg p-3 text-center">
                <div className="text-purple-400 text-sm">Score</div>
                <div className="text-white font-bold text-lg">{energyScore}</div>
              </div>
              <div className="bg-black/30 border border-purple-500/30 rounded-lg p-3 text-center">
                <div className="text-purple-400 text-sm">Moves</div>
                <div className="text-white font-bold text-lg">{energyMoves}</div>
              </div>
            </div>

            {/* Energy Channels */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-300">Balance the Energy Channels</h3>
              {energyChannels.map((energy, index) => (
                <div key={index} className="bg-black/30 border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-300">Chamber {index + 1}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white">{energy}%</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-yellow-400">{targetEnergy[index]}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => adjustEnergy(index, -5)}
                      className="px-2 py-1 bg-red-600/20 border border-red-500/30 rounded text-red-300 hover:bg-red-600/30 transition-colors"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => adjustEnergy(index, -1)}
                      className="px-2 py-1 bg-red-600/20 border border-red-500/30 rounded text-red-300 hover:bg-red-600/30 transition-colors"
                    >
                      -1
                    </button>
                    
                    <div className="flex-1 relative">
                      <div className="w-full bg-gray-700 rounded-full h-4">
                        <div
                          className="h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                          style={{ width: `${energy}%` }}
                        />
                      </div>
                      <div
                        className="absolute top-0 w-1 h-4 bg-yellow-400 rounded"
                        style={{ left: `${targetEnergy[index]}%` }}
                      />
                    </div>
                    
                    <button
                      onClick={() => adjustEnergy(index, 1)}
                      className="px-2 py-1 bg-green-600/20 border border-green-500/30 rounded text-green-300 hover:bg-green-600/30 transition-colors"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => adjustEnergy(index, 5)}
                      className="px-2 py-1 bg-green-600/20 border border-green-500/30 rounded text-green-300 hover:bg-green-600/30 transition-colors"
                    >
                      +5
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : activeGame === 'memory-palace' ? (
          <motion.div
            key="memory-palace"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-6"
          >
            {/* Game Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-blue-300">Memory Palace</h2>
              <button
                onClick={() => setActiveGame(null)}
                className="px-4 py-2 bg-red-600/20 border border-red-500/30 rounded text-red-300 hover:bg-red-600/30 transition-colors"
              >
                Exit Game
              </button>
            </div>

            {/* Game Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 border border-purple-500/30 rounded-lg p-3 text-center">
                <div className="text-purple-400 text-sm">Score</div>
                <div className="text-white font-bold text-lg">{memoryScore}</div>
              </div>
              <div className="bg-black/30 border border-purple-500/30 rounded-lg p-3 text-center">
                <div className="text-purple-400 text-sm">Level</div>
                <div className="text-white font-bold text-lg">{memoryLevel}</div>
              </div>
            </div>

            {/* Memory Grid */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-purple-300 mb-4">
                {showingSequence ? 'Memorize the Sequence' : 'Repeat the Sequence'}
              </h3>
              
              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                {Array.from({ length: 9 }, (_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => addToPlayerSequence(index)}
                    className={`aspect-square border-2 rounded-lg flex items-center justify-center text-2xl font-bold transition-all ${
                      showingSequence && memorySequence.includes(index)
                        ? 'border-blue-400 bg-blue-400/30 text-blue-300'
                        : playerSequence.includes(index)
                        ? 'border-green-400 bg-green-400/20 text-green-300'
                        : 'border-purple-500/30 bg-black/30 hover:border-purple-400/50 text-purple-300'
                    }`}
                    whileHover={{ scale: showingSequence ? 1 : 1.05 }}
                    whileTap={{ scale: showingSequence ? 1 : 0.95 }}
                    disabled={showingSequence}
                  >
                    {index + 1}
                  </motion.button>
                ))}
              </div>
              
              {showingSequence && (
                <div className="mt-4 text-yellow-400">
                  <Timer className="w-5 h-5 inline mr-2" />
                  Watch carefully...
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default MiniGames;