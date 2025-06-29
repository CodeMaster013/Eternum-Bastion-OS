import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Music, Settings, Play, Pause, SkipForward, SkipBack } from 'lucide-react';

interface EnhancedAudioSystemProps {
  currentTheme: string;
  isVisible: boolean;
  onToggle: () => void;
}

interface AudioTrack {
  id: string;
  name: string;
  theme: string;
  url: string;
  duration: number;
  type: 'ambient' | 'action' | 'mystical' | 'dramatic';
}

interface SoundEffect {
  id: string;
  name: string;
  url: string;
  category: 'ui' | 'spell' | 'transformation' | 'notification' | 'ambient';
}

const EnhancedAudioSystem: React.FC<EnhancedAudioSystemProps> = ({ 
  currentTheme, 
  isVisible, 
  onToggle 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [volume, setVolume] = useState(0.7);
  const [sfxVolume, setSfxVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(true);
  const [visualizerData, setVisualizerData] = useState<number[]>([]);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // Sample audio tracks for different themes
  const audioTracks: AudioTrack[] = [
    {
      id: 'default_ambient',
      name: 'Mystical Resonance',
      theme: 'default',
      url: '/audio/mystical-ambient.mp3', // These would be actual audio files
      duration: 180,
      type: 'ambient'
    },
    {
      id: 'fire_ambient',
      name: 'Ember Flames',
      theme: 'fire',
      url: '/audio/fire-ambient.mp3',
      duration: 200,
      type: 'ambient'
    },
    {
      id: 'ice_ambient',
      name: 'Frozen Echoes',
      theme: 'ice',
      url: '/audio/ice-ambient.mp3',
      duration: 190,
      type: 'ambient'
    },
    {
      id: 'void_ambient',
      name: 'Void Whispers',
      theme: 'void',
      url: '/audio/void-ambient.mp3',
      duration: 220,
      type: 'mystical'
    },
    {
      id: 'nature_ambient',
      name: 'Living Forest',
      theme: 'nature',
      url: '/audio/nature-ambient.mp3',
      duration: 210,
      type: 'ambient'
    },
    {
      id: 'celestial_ambient',
      name: 'Starlight Symphony',
      theme: 'celestial',
      url: '/audio/celestial-ambient.mp3',
      duration: 195,
      type: 'mystical'
    }
  ];

  // Sample sound effects
  const soundEffects: SoundEffect[] = [
    { id: 'spell_cast', name: 'Spell Cast', url: '/audio/sfx/spell-cast.mp3', category: 'spell' },
    { id: 'transformation', name: 'Transformation', url: '/audio/sfx/transformation.mp3', category: 'transformation' },
    { id: 'notification', name: 'Notification', url: '/audio/sfx/notification.mp3', category: 'notification' },
    { id: 'ui_click', name: 'UI Click', url: '/audio/sfx/ui-click.mp3', category: 'ui' },
    { id: 'energy_flow', name: 'Energy Flow', url: '/audio/sfx/energy-flow.mp3', category: 'ambient' }
  ];

  useEffect(() => {
    // Auto-switch music based on theme
    const themeTrack = audioTracks.find(track => track.theme === currentTheme);
    if (themeTrack && (!currentTrack || currentTrack.theme !== currentTheme)) {
      setCurrentTrack(themeTrack);
    }
  }, [currentTheme]);

  useEffect(() => {
    // Setup audio context for visualization
    if (audioRef.current && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaElementSource(audioRef.current);
        source.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        
        analyserRef.current.fftSize = 256;
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
      } catch (error) {
        console.warn('Audio context not supported:', error);
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    // Audio visualization loop
    if (isPlaying && analyserRef.current && dataArrayRef.current) {
      const updateVisualizer = () => {
        analyserRef.current!.getByteFrequencyData(dataArrayRef.current!);
        const data = Array.from(dataArrayRef.current!);
        setVisualizerData(data.slice(0, 32)); // Use first 32 frequency bins
        
        if (isPlaying) {
          requestAnimationFrame(updateVisualizer);
        }
      };
      updateVisualizer();
    }
  }, [isPlaying]);

  useEffect(() => {
    // Update audio time
    const audio = audioRef.current;
    if (audio) {
      const updateTime = () => {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration || 0);
      };
      
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateTime);
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateTime);
      };
    }
  }, [currentTrack]);

  const playTrack = (track: AudioTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        // Resume audio context if suspended
        if (audioContextRef.current?.state === 'suspended') {
          audioContextRef.current.resume();
        }
        audio.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    const currentIndex = audioTracks.findIndex(track => track.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % audioTracks.length;
    playTrack(audioTracks[nextIndex]);
  };

  const previousTrack = () => {
    const currentIndex = audioTracks.findIndex(track => track.id === currentTrack?.id);
    const prevIndex = currentIndex === 0 ? audioTracks.length - 1 : currentIndex - 1;
    playTrack(audioTracks[prevIndex]);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const playSound = (soundId: string) => {
    const sound = soundEffects.find(s => s.id === soundId);
    if (sound) {
      const audio = new Audio(sound.url);
      audio.volume = sfxVolume;
      audio.play().catch(console.error);
    }
  };

  // Global sound effect function
  useEffect(() => {
    (window as any).playSound = playSound;
    return () => {
      delete (window as any).playSound;
    };
  }, [sfxVolume]);

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 left-4 w-12 h-12 bg-purple-600/20 border border-purple-500/30 rounded-full flex items-center justify-center text-purple-400 hover:bg-purple-600/30 transition-colors z-40"
      >
        <Volume2 size={20} />
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed bottom-4 left-4 bg-black/80 border border-purple-500/30 rounded-lg backdrop-blur-sm z-40 overflow-hidden"
    >
      {/* Audio Element */}
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.url}
          loop={isLooping}
          volume={isMuted ? 0 : volume}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            if (!isLooping) {
              nextTrack();
            }
          }}
        />
      )}

      {/* Compact Player */}
      {!showControls && (
        <div className="p-3 flex items-center space-x-3 min-w-64">
          <button
            onClick={togglePlayPause}
            className="w-8 h-8 bg-purple-600/20 border border-purple-500/30 rounded-full flex items-center justify-center text-purple-400 hover:bg-purple-600/30 transition-colors"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="text-sm text-purple-300 truncate">
              {currentTrack?.name || 'No track selected'}
            </div>
            <div className="text-xs text-gray-400">
              {currentTrack && `${formatTime(currentTime)} / ${formatTime(duration)}`}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            
            <button
              onClick={() => setShowControls(true)}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Settings size={16} />
            </button>
            
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Expanded Controls */}
      {showControls && (
        <div className="p-4 w-80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-300">Audio System</h3>
            <button
              onClick={() => setShowControls(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Current Track Info */}
          {currentTrack && (
            <div className="mb-4">
              <div className="text-sm text-purple-300 mb-1">{currentTrack.name}</div>
              <div className="text-xs text-gray-400 mb-2">
                {currentTrack.type} • {currentTrack.theme} theme
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-1 mb-2">
                <div
                  className="h-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}
          
          {/* Playback Controls */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <button
              onClick={previousTrack}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              <SkipBack size={20} />
            </button>
            
            <button
              onClick={togglePlayPause}
              className="w-10 h-10 bg-purple-600/20 border border-purple-500/30 rounded-full flex items-center justify-center text-purple-400 hover:bg-purple-600/30 transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            
            <button
              onClick={nextTrack}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              <SkipForward size={20} />
            </button>
          </div>
          
          {/* Volume Controls */}
          <div className="space-y-3 mb-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-purple-400">Music Volume</span>
                <span className="text-xs text-gray-400">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-purple-400">SFX Volume</span>
                <span className="text-xs text-gray-400">{Math.round(sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={sfxVolume}
                onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
          
          {/* Audio Visualizer */}
          {isPlaying && visualizerData.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-purple-400 mb-2">Audio Visualizer</div>
              <div className="flex items-end justify-center space-x-1 h-16 bg-black/30 rounded p-2">
                {visualizerData.slice(0, 16).map((value, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-t from-purple-500 to-pink-500 rounded-sm transition-all duration-100"
                    style={{
                      height: `${Math.max(2, (value / 255) * 48)}px`,
                      width: '8px'
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Track Selection */}
          <div className="mb-4">
            <div className="text-sm text-purple-400 mb-2">Available Tracks</div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {audioTracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => playTrack(track)}
                  className={`w-full text-left p-2 rounded text-xs transition-colors ${
                    currentTrack?.id === track.id
                      ? 'bg-purple-500/30 text-purple-300 border border-purple-400/50'
                      : 'bg-black/20 text-gray-300 hover:bg-purple-500/20'
                  }`}
                >
                  <div className="font-medium">{track.name}</div>
                  <div className="text-gray-400">{track.theme} • {track.type}</div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Options */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm text-purple-400">
              <input
                type="checkbox"
                checked={isLooping}
                onChange={(e) => setIsLooping(e.target.checked)}
                className="rounded"
              />
              <span>Loop</span>
            </label>
            
            <button
              onClick={onToggle}
              className="px-3 py-1 bg-gray-600/20 border border-gray-500/30 rounded text-gray-300 hover:bg-gray-600/30 transition-colors text-sm"
            >
              Minimize
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default EnhancedAudioSystem;