import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2, RotateCcw, Zap, Eye, Settings } from 'lucide-react';
import { SystemNotification } from './MagicalOS';

interface User {
  username: string;
  accessLevel: 'root' | 'executor' | 'guest';
  authenticated: boolean;
}

interface ThreeDChamberViewProps {
  user: User;
  onNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp'>) => void;
  selectedChamber: string;
  energyLevel: number;
}

interface ChamberModel {
  name: string;
  geometry: string;
  color: string;
  particles: number;
  effects: string[];
}

const ThreeDChamberView: React.FC<ThreeDChamberViewProps> = ({ 
  user, 
  onNotification, 
  selectedChamber, 
  energyLevel 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showParticles, setShowParticles] = useState(true);
  const [renderQuality, setRenderQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [isLoading, setIsLoading] = useState(true);

  const chamberModels: Record<string, ChamberModel> = {
    'Prism Atrium': {
      name: 'Prism Atrium',
      geometry: 'crystalline',
      color: '#8b5cf6',
      particles: 150,
      effects: ['light_refraction', 'crystal_resonance']
    },
    'Metamorphic Conclave': {
      name: 'Metamorphic Conclave',
      geometry: 'organic',
      color: '#10b981',
      particles: 200,
      effects: ['shape_shifting', 'bio_luminescence']
    },
    'Ember Ring': {
      name: 'Ember Ring',
      geometry: 'circular',
      color: '#f59e0b',
      particles: 300,
      effects: ['fire_particles', 'heat_distortion']
    },
    'Void Nexus': {
      name: 'Void Nexus',
      geometry: 'void',
      color: '#1f2937',
      particles: 50,
      effects: ['void_distortion', 'dark_energy']
    },
    'Memory Sanctum': {
      name: 'Memory Sanctum',
      geometry: 'neural',
      color: '#3b82f6',
      particles: 100,
      effects: ['memory_streams', 'consciousness_flow']
    },
    'Mirror Maze': {
      name: 'Mirror Maze',
      geometry: 'reflective',
      color: '#ec4899',
      particles: 250,
      effects: ['mirror_reflections', 'infinite_recursion']
    }
  };

  useEffect(() => {
    initializeCanvas();
    const animationFrame = requestAnimationFrame(renderLoop);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [selectedChamber, energyLevel, showParticles, renderQuality]);

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * (renderQuality === 'high' ? 2 : renderQuality === 'medium' ? 1.5 : 1);
    canvas.height = canvas.offsetHeight * (renderQuality === 'high' ? 2 : renderQuality === 'medium' ? 1.5 : 1);
    
    setIsLoading(false);
  };

  const renderLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Render chamber
    renderChamber(ctx, canvas);
    
    // Render particles if enabled
    if (showParticles) {
      renderParticles(ctx, canvas);
    }
    
    // Render energy effects
    renderEnergyEffects(ctx, canvas);
    
    requestAnimationFrame(renderLoop);
  };

  const renderChamber = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const chamber = chamberModels[selectedChamber];
    if (!chamber) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const size = Math.min(canvas.width, canvas.height) * 0.3 * zoom;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation.y * 0.01);

    // Create gradient based on energy level
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    gradient.addColorStop(0, `${chamber.color}${Math.floor(energyLevel * 2.55).toString(16).padStart(2, '0')}`);
    gradient.addColorStop(1, `${chamber.color}20`);

    ctx.fillStyle = gradient;
    ctx.strokeStyle = chamber.color;
    ctx.lineWidth = 3;

    // Render different geometries
    switch (chamber.geometry) {
      case 'crystalline':
        renderCrystalGeometry(ctx, size);
        break;
      case 'organic':
        renderOrganicGeometry(ctx, size);
        break;
      case 'circular':
        renderCircularGeometry(ctx, size);
        break;
      case 'void':
        renderVoidGeometry(ctx, size);
        break;
      case 'neural':
        renderNeuralGeometry(ctx, size);
        break;
      case 'reflective':
        renderReflectiveGeometry(ctx, size);
        break;
    }

    ctx.restore();
  };

  const renderCrystalGeometry = (ctx: CanvasRenderingContext2D, size: number) => {
    // Draw crystal structure
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = Math.cos(angle) * size;
      const y = Math.sin(angle) * size;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner crystal facets
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x1 = Math.cos(angle) * size * 0.5;
      const y1 = Math.sin(angle) * size * 0.5;
      const x2 = Math.cos(angle + Math.PI / 3) * size * 0.5;
      const y2 = Math.sin(angle + Math.PI / 3) * size * 0.5;
      ctx.moveTo(0, 0);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.stroke();
  };

  const renderOrganicGeometry = (ctx: CanvasRenderingContext2D, size: number) => {
    // Draw organic, flowing shape
    ctx.beginPath();
    for (let i = 0; i <= 360; i += 10) {
      const angle = (i * Math.PI) / 180;
      const radius = size * (0.8 + 0.2 * Math.sin(angle * 3 + Date.now() * 0.001));
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  const renderCircularGeometry = (ctx: CanvasRenderingContext2D, size: number) => {
    // Draw concentric circles with fire effect
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, size * (0.3 + i * 0.3), 0, Math.PI * 2);
      ctx.globalAlpha = 0.3 + i * 0.2;
      ctx.fill();
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  const renderVoidGeometry = (ctx: CanvasRenderingContext2D, size: number) => {
    // Draw void distortion effect
    ctx.save();
    ctx.globalCompositeOperation = 'difference';
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Add swirling void effect
    for (let i = 0; i < 5; i++) {
      const angle = (Date.now() * 0.001 + i * Math.PI * 0.4) % (Math.PI * 2);
      const radius = size * 0.7;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const renderNeuralGeometry = (ctx: CanvasRenderingContext2D, size: number) => {
    // Draw neural network pattern
    const nodes = 8;
    const nodePositions = [];
    
    for (let i = 0; i < nodes; i++) {
      const angle = (i * Math.PI * 2) / nodes;
      const x = Math.cos(angle) * size * 0.8;
      const y = Math.sin(angle) * size * 0.8;
      nodePositions.push({ x, y });
      
      // Draw node
      ctx.beginPath();
      ctx.arc(x, y, size * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw connections
    ctx.lineWidth = 2;
    for (let i = 0; i < nodes; i++) {
      for (let j = i + 1; j < nodes; j++) {
        if (Math.random() > 0.5) {
          ctx.beginPath();
          ctx.moveTo(nodePositions[i].x, nodePositions[i].y);
          ctx.lineTo(nodePositions[j].x, nodePositions[j].y);
          ctx.stroke();
        }
      }
    }
  };

  const renderReflectiveGeometry = (ctx: CanvasRenderingContext2D, size: number) => {
    // Draw mirror maze structure
    const segments = 6;
    for (let i = 0; i < segments; i++) {
      const angle = (i * Math.PI * 2) / segments;
      const x1 = Math.cos(angle) * size * 0.3;
      const y1 = Math.sin(angle) * size * 0.3;
      const x2 = Math.cos(angle) * size;
      const y2 = Math.sin(angle) * size;
      
      // Create mirror effect with gradient
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, 'rgba(236, 72, 153, 0.8)');
      gradient.addColorStop(0.5, 'rgba(236, 72, 153, 0.3)');
      gradient.addColorStop(1, 'rgba(236, 72, 153, 0.1)');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  };

  const renderParticles = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const chamber = chamberModels[selectedChamber];
    if (!chamber) return;

    const particleCount = Math.floor(chamber.particles * (energyLevel / 100));
    
    for (let i = 0; i < particleCount; i++) {
      const time = Date.now() * 0.001 + i;
      const x = canvas.width / 2 + Math.cos(time + i) * (100 + i * 2) * zoom;
      const y = canvas.height / 2 + Math.sin(time * 0.7 + i) * (100 + i * 2) * zoom;
      const size = (2 + Math.sin(time * 2) * 1) * zoom;
      
      ctx.save();
      ctx.globalAlpha = 0.6 + Math.sin(time * 3) * 0.3;
      ctx.fillStyle = chamber.color;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  const renderEnergyEffects = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (energyLevel < 50) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const time = Date.now() * 0.001;
    
    // Energy pulse effect
    ctx.save();
    ctx.globalAlpha = (energyLevel - 50) / 50 * 0.5;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    
    for (let i = 0; i < 3; i++) {
      const radius = (50 + i * 30 + Math.sin(time + i) * 20) * zoom;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) { // Left mouse button
      const deltaX = e.movementX;
      const deltaY = e.movementY;
      setRotation(prev => ({
        x: prev.x + deltaY,
        y: prev.y + deltaX
      }));
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)));
  };

  const resetView = () => {
    setRotation({ x: 0, y: 0 });
    setZoom(1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    onNotification({
      type: 'info',
      title: '3D View',
      message: `${isFullscreen ? 'Exited' : 'Entered'} fullscreen mode`
    });
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'relative'} flex flex-col`}>
      {/* Controls */}
      <div className="flex items-center justify-between p-4 bg-black/30 border-b border-purple-500/30">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-purple-300">
            3D Chamber View: {selectedChamber}
          </h3>
          <div className="text-sm text-purple-400">
            Energy: {energyLevel}%
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowParticles(!showParticles)}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              showParticles
                ? 'bg-purple-500/30 text-purple-300 border border-purple-400/50'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}
          >
            Particles
          </button>
          
          <select
            value={renderQuality}
            onChange={(e) => setRenderQuality(e.target.value as any)}
            className="px-2 py-1 bg-black/30 border border-purple-500/30 rounded text-xs text-purple-300"
          >
            <option value="low">Low Quality</option>
            <option value="medium">Medium Quality</option>
            <option value="high">High Quality</option>
          </select>
          
          <button
            onClick={resetView}
            className="p-2 bg-blue-600/20 border border-blue-500/30 rounded text-blue-300 hover:bg-blue-600/30 transition-colors"
            title="Reset View"
          >
            <RotateCcw size={16} />
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-purple-600/20 border border-purple-500/30 rounded text-purple-300 hover:bg-purple-600/30 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 relative bg-black/20">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-purple-300">
              <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Initializing 3D Chamber...
            </div>
          </div>
        )}
        
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseMove={handleMouseMove}
          onWheel={handleWheel}
          style={{ imageRendering: renderQuality === 'low' ? 'pixelated' : 'auto' }}
        />
        
        {/* View Controls Overlay */}
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-xs text-purple-300">
          <div className="space-y-1">
            <div>🖱️ Drag to rotate</div>
            <div>🔄 Scroll to zoom</div>
            <div>📐 Zoom: {(zoom * 100).toFixed(0)}%</div>
            <div>🔄 Rotation: {rotation.y.toFixed(0)}°</div>
          </div>
        </div>
        
        {/* Energy Level Indicator */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <div className="text-sm text-purple-300">
              Energy Level
            </div>
          </div>
          <div className="w-32 bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${energyLevel}%` }}
            />
          </div>
          <div className="text-xs text-center text-white mt-1">
            {energyLevel}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDChamberView;