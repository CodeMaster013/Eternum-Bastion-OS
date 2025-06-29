import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Coins, Package, Users, Star, Clock, TrendingUp, Filter } from 'lucide-react';
import { SystemNotification } from './MagicalOS';

interface User {
  username: string;
  accessLevel: 'root' | 'executor' | 'guest';
  authenticated: boolean;
}

interface TradingSystemProps {
  user: User;
  onNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp'>) => void;
}

interface MysticalItem {
  id: string;
  name: string;
  type: 'spell' | 'artifact' | 'knowledge' | 'material' | 'essence';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  description: string;
  price: number;
  seller: string;
  quantity: number;
  effects?: string[];
  requirements?: string[];
  listedAt: Date;
}

interface UserInventory {
  mysticalEssence: number;
  items: MysticalItem[];
}

interface AuctionItem extends MysticalItem {
  currentBid: number;
  highestBidder: string;
  endTime: Date;
  bids: { bidder: string; amount: number; timestamp: Date }[];
}

const TradingSystem: React.FC<TradingSystemProps> = ({ user, onNotification }) => {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'auction' | 'inventory' | 'guild'>('marketplace');
  const [inventory, setInventory] = useState<UserInventory>({ mysticalEssence: 1000, items: [] });
  const [marketItems, setMarketItems] = useState<MysticalItem[]>([]);
  const [auctionItems, setAuctionItems] = useState<AuctionItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<MysticalItem | null>(null);
  const [showListModal, setShowListModal] = useState(false);

  useEffect(() => {
    // Initialize with sample data
    initializeSampleData();
    
    // Load user inventory
    const savedInventory = localStorage.getItem(`eternum_inventory_${user.username}`);
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    }
  }, [user.username]);

  const initializeSampleData = () => {
    const sampleMarketItems: MysticalItem[] = [
      {
        id: '1',
        name: 'Flame of Eternal Burning',
        type: 'spell',
        rarity: 'legendary',
        description: 'A spell that creates flames that never extinguish, perfect for the Ember Ring chamber',
        price: 500,
        seller: 'Pyromancer_Supreme',
        quantity: 1,
        effects: ['Permanent Fire', 'Energy +25%'],
        requirements: ['Fire Mastery Level 5'],
        listedAt: new Date(Date.now() - 86400000)
      },
      {
        id: '2',
        name: 'Crystal of Memory Storage',
        type: 'artifact',
        rarity: 'epic',
        description: 'Stores up to 1000 consciousness patterns for safe transformation backup',
        price: 300,
        seller: 'Memory_Keeper',
        quantity: 3,
        effects: ['Memory Backup', 'Stability +15%'],
        requirements: ['Memory Sanctum Access'],
        listedAt: new Date(Date.now() - 172800000)
      },
      {
        id: '3',
        name: 'Void Essence',
        type: 'material',
        rarity: 'mythic',
        description: 'Pure essence extracted from the void itself, extremely dangerous but powerful',
        price: 1000,
        seller: 'Void_Walker',
        quantity: 1,
        effects: ['Void Manipulation', 'Reality Distortion'],
        requirements: ['Root Access', 'Void Resistance'],
        listedAt: new Date(Date.now() - 259200000)
      },
      {
        id: '4',
        name: 'Transformation Manual: Draconic Forms',
        type: 'knowledge',
        rarity: 'rare',
        description: 'Complete guide to achieving stable draconic transformations',
        price: 150,
        seller: 'Dragon_Scholar',
        quantity: 5,
        effects: ['Draconic Knowledge', 'Transformation Success +20%'],
        requirements: ['Executor Access'],
        listedAt: new Date(Date.now() - 345600000)
      },
      {
        id: '5',
        name: 'Prism Shard',
        type: 'material',
        rarity: 'common',
        description: 'A small fragment of crystalline energy, useful for basic spell crafting',
        price: 25,
        seller: 'Crystal_Miner',
        quantity: 20,
        effects: ['Light Amplification'],
        requirements: [],
        listedAt: new Date(Date.now() - 432000000)
      }
    ];

    const sampleAuctionItems: AuctionItem[] = [
      {
        id: 'a1',
        name: 'Mirror of Infinite Reflections',
        type: 'artifact',
        rarity: 'mythic',
        description: 'Legendary artifact that can create perfect duplicates of any entity',
        price: 2000,
        seller: 'Mirror_Master',
        quantity: 1,
        effects: ['Perfect Duplication', 'Reality Manipulation'],
        requirements: ['Root Access', 'Mirror Maze Mastery'],
        listedAt: new Date(Date.now() - 86400000),
        currentBid: 2500,
        highestBidder: 'Reflection_Lord',
        endTime: new Date(Date.now() + 3600000),
        bids: [
          { bidder: 'Mystic_Collector', amount: 2000, timestamp: new Date(Date.now() - 3600000) },
          { bidder: 'Artifact_Hunter', amount: 2200, timestamp: new Date(Date.now() - 1800000) },
          { bidder: 'Reflection_Lord', amount: 2500, timestamp: new Date(Date.now() - 900000) }
        ]
      }
    ];

    setMarketItems(sampleMarketItems);
    setAuctionItems(sampleAuctionItems);
  };

  const saveInventory = (newInventory: UserInventory) => {
    setInventory(newInventory);
    localStorage.setItem(`eternum_inventory_${user.username}`, JSON.stringify(newInventory));
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400/30';
      case 'rare': return 'text-blue-400 border-blue-400/30';
      case 'epic': return 'text-purple-400 border-purple-400/30';
      case 'legendary': return 'text-yellow-400 border-yellow-400/30';
      case 'mythic': return 'text-red-400 border-red-400/30';
      default: return 'text-gray-400 border-gray-400/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'spell': return '🔮';
      case 'artifact': return '⚱️';
      case 'knowledge': return '📜';
      case 'material': return '💎';
      case 'essence': return '✨';
      default: return '📦';
    }
  };

  const getFilteredItems = (items: MysticalItem[]) => {
    return items.filter(item => {
      const matchesType = filterType === 'all' || item.type === filterType;
      const matchesRarity = filterRarity === 'all' || item.rarity === filterRarity;
      const matchesSearch = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesType && matchesRarity && matchesSearch;
    });
  };

  const purchaseItem = (item: MysticalItem) => {
    if (inventory.mysticalEssence < item.price) {
      onNotification({
        type: 'error',
        title: 'Insufficient Essence',
        message: `You need ${item.price - inventory.mysticalEssence} more mystical essence`
      });
      return;
    }

    // Check requirements
    if (item.requirements && item.requirements.length > 0) {
      const hasRequirements = item.requirements.every(req => {
        if (req === 'Root Access') return user.accessLevel === 'root';
        if (req === 'Executor Access') return user.accessLevel !== 'guest';
        return true; // Simplified requirement checking
      });

      if (!hasRequirements) {
        onNotification({
          type: 'error',
          title: 'Requirements Not Met',
          message: `Missing requirements: ${item.requirements.join(', ')}`
        });
        return;
      }
    }

    const newInventory = {
      ...inventory,
      mysticalEssence: inventory.mysticalEssence - item.price,
      items: [...inventory.items, { ...item, seller: user.username }]
    };

    saveInventory(newInventory);

    // Remove from market or reduce quantity
    setMarketItems(prev => prev.map(marketItem => 
      marketItem.id === item.id 
        ? { ...marketItem, quantity: marketItem.quantity - 1 }
        : marketItem
    ).filter(marketItem => marketItem.quantity > 0));

    onNotification({
      type: 'success',
      title: 'Purchase Successful',
      message: `Acquired ${item.name} for ${item.price} mystical essence`
    });
  };

  const placeBid = (auctionItem: AuctionItem, bidAmount: number) => {
    if (inventory.mysticalEssence < bidAmount) {
      onNotification({
        type: 'error',
        title: 'Insufficient Essence',
        message: 'Not enough mystical essence for this bid'
      });
      return;
    }

    if (bidAmount <= auctionItem.currentBid) {
      onNotification({
        type: 'error',
        title: 'Bid Too Low',
        message: `Bid must be higher than ${auctionItem.currentBid} essence`
      });
      return;
    }

    const newBid = {
      bidder: user.username,
      amount: bidAmount,
      timestamp: new Date()
    };

    setAuctionItems(prev => prev.map(item => 
      item.id === auctionItem.id 
        ? {
            ...item,
            currentBid: bidAmount,
            highestBidder: user.username,
            bids: [...item.bids, newBid]
          }
        : item
    ));

    onNotification({
      type: 'success',
      title: 'Bid Placed',
      message: `Bid of ${bidAmount} essence placed on ${auctionItem.name}`
    });
  };

  const formatTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="h-full flex bg-black/20 backdrop-blur-sm">
      {/* Main Trading Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-8 h-8 text-purple-400" />
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Mystical Marketplace
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-black/30 border border-yellow-500/30 rounded-lg px-3 py-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-bold">{inventory.mysticalEssence}</span>
              <span className="text-yellow-300 text-sm">Essence</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6">
          {[
            { id: 'marketplace', name: 'Marketplace', icon: <ShoppingCart size={16} /> },
            { id: 'auction', name: 'Auction House', icon: <Clock size={16} /> },
            { id: 'inventory', name: 'Inventory', icon: <Package size={16} /> },
            { id: 'guild', name: 'Guild Trading', icon: <Users size={16} /> }
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

        {/* Filters */}
        {(activeTab === 'marketplace' || activeTab === 'auction') && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 bg-black/30 border border-purple-500/30 rounded text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
              placeholder="Search items..."
            />
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-black/30 border border-purple-500/30 rounded text-white focus:outline-none focus:border-purple-400"
            >
              <option value="all">All Types</option>
              <option value="spell">Spells</option>
              <option value="artifact">Artifacts</option>
              <option value="knowledge">Knowledge</option>
              <option value="material">Materials</option>
              <option value="essence">Essence</option>
            </select>
            
            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="px-3 py-2 bg-black/30 border border-purple-500/30 rounded text-white focus:outline-none focus:border-purple-400"
            >
              <option value="all">All Rarities</option>
              <option value="common">Common</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
              <option value="mythic">Mythic</option>
            </select>
            
            <div className="flex items-center space-x-2 text-sm text-purple-300">
              <Filter size={16} />
              <span>{getFilteredItems(activeTab === 'marketplace' ? marketItems : auctionItems).length} items</span>
            </div>
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'marketplace' && (
            <motion.div
              key="marketplace"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {getFilteredItems(marketItems).map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-black/30 border rounded-lg p-4 hover:border-purple-400/50 transition-colors ${getRarityColor(item.rarity)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getTypeIcon(item.type)}</span>
                      <div>
                        <h3 className="font-semibold text-purple-300">{item.name}</h3>
                        <div className="flex items-center space-x-2 text-xs">
                          <span className={`px-2 py-1 rounded ${getRarityColor(item.rarity)} bg-opacity-20`}>
                            {item.rarity}
                          </span>
                          <span className="text-gray-400">{item.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 font-bold">{item.price}</div>
                      <div className="text-xs text-gray-400">essence</div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-3 line-clamp-3">{item.description}</p>
                  
                  {item.effects && (
                    <div className="mb-3">
                      <div className="text-xs text-purple-400 mb-1">Effects:</div>
                      <div className="flex flex-wrap gap-1">
                        {item.effects.map((effect, index) => (
                          <span key={index} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                            {effect}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      by {item.seller} • Qty: {item.quantity}
                    </div>
                    <button
                      onClick={() => purchaseItem(item)}
                      className="px-3 py-1 bg-green-600/20 border border-green-500/30 rounded text-green-300 hover:bg-green-600/30 transition-colors text-sm"
                    >
                      Buy Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'auction' && (
            <motion.div
              key="auction"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {getFilteredItems(auctionItems).map((item) => (
                <motion.div
                  key={item.id}
                  className={`bg-black/30 border rounded-lg p-6 ${getRarityColor(item.rarity)}`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <div className="flex items-start space-x-4">
                        <span className="text-3xl">{getTypeIcon(item.type)}</span>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-purple-300 mb-2">{item.name}</h3>
                          <div className="flex items-center space-x-2 mb-3">
                            <span className={`px-2 py-1 rounded text-xs ${getRarityColor(item.rarity)} bg-opacity-20`}>
                              {item.rarity}
                            </span>
                            <span className="text-gray-400 text-xs">{item.type}</span>
                          </div>
                          <p className="text-sm text-gray-300 mb-3">{item.description}</p>
                          
                          {item.effects && (
                            <div className="mb-3">
                              <div className="text-xs text-purple-400 mb-1">Effects:</div>
                              <div className="flex flex-wrap gap-1">
                                {item.effects.map((effect, index) => (
                                  <span key={index} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                                    {effect}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
                        <div className="text-center">
                          <div className="text-yellow-400 font-bold text-2xl">{item.currentBid}</div>
                          <div className="text-xs text-gray-400">Current Bid</div>
                          <div className="text-sm text-purple-300 mt-1">by {item.highestBidder}</div>
                        </div>
                        
                        <div className="mt-4 text-center">
                          <div className="flex items-center justify-center space-x-2 text-orange-400">
                            <Clock size={16} />
                            <span className="font-medium">{formatTimeRemaining(item.endTime)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <input
                            type="number"
                            placeholder={`Min: ${item.currentBid + 1}`}
                            className="w-full px-3 py-2 bg-black/30 border border-purple-500/30 rounded text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
                          />
                          <button
                            onClick={() => {
                              const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                              const bidAmount = parseInt(input.value);
                              if (bidAmount) placeBid(item, bidAmount);
                            }}
                            className="w-full py-2 bg-blue-600/20 border border-blue-500/30 rounded text-blue-300 hover:bg-blue-600/30 transition-colors"
                          >
                            Place Bid
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-purple-300 mb-2">Recent Bids</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {item.bids.slice(-5).reverse().map((bid, index) => (
                            <div key={index} className="flex justify-between text-xs">
                              <span className="text-gray-400">{bid.bidder}</span>
                              <span className="text-yellow-400">{bid.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'inventory' && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inventory.items.map((item, index) => (
                  <motion.div
                    key={index}
                    className={`bg-black/30 border rounded-lg p-4 ${getRarityColor(item.rarity)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getTypeIcon(item.type)}</span>
                        <div>
                          <h3 className="font-semibold text-purple-300">{item.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${getRarityColor(item.rarity)} bg-opacity-20`}>
                            {item.rarity}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-3 line-clamp-3">{item.description}</p>
                    
                    {item.effects && (
                      <div className="mb-3">
                        <div className="text-xs text-purple-400 mb-1">Effects:</div>
                        <div className="flex flex-wrap gap-1">
                          {item.effects.map((effect, effectIndex) => (
                            <span key={effectIndex} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                              {effect}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <button className="flex-1 py-1 bg-blue-600/20 border border-blue-500/30 rounded text-blue-300 hover:bg-blue-600/30 transition-colors text-sm">
                        Use
                      </button>
                      <button className="flex-1 py-1 bg-green-600/20 border border-green-500/30 rounded text-green-300 hover:bg-green-600/30 transition-colors text-sm">
                        Sell
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {inventory.items.length === 0 && (
                <div className="text-center py-12 text-purple-400/50">
                  <Package size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Your inventory is empty. Visit the marketplace to acquire mystical items!</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'guild' && (
            <motion.div
              key="guild"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <Users size={48} className="mx-auto mb-4 text-purple-400 opacity-50" />
              <h3 className="text-xl font-semibold text-purple-300 mb-2">Guild Trading</h3>
              <p className="text-purple-400/70 mb-4">
                Form mystical orders and trade exclusively with guild members
              </p>
              <button className="px-6 py-3 bg-purple-600/20 border border-purple-500/30 rounded text-purple-300 hover:bg-purple-600/30 transition-colors">
                Coming Soon
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TradingSystem;