import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, TrendingUp, Activity, Zap, Users, Calendar, Download, Settings } from 'lucide-react';
import { SystemNotification } from './MagicalOS';

interface User {
  username: string;
  accessLevel: 'root' | 'executor' | 'guest';
  authenticated: boolean;
}

interface AnalyticsDashboardProps {
  user: User;
  onNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp'>) => void;
}

interface AnalyticsData {
  spellSuccessRate: number[];
  energyEfficiency: number[];
  transformationCount: number[];
  userActivity: number[];
  chamberUsage: { chamber: string; usage: number; efficiency: number }[];
  prophecyAccuracy: number[];
  systemPerformance: { metric: string; value: number; trend: 'up' | 'down' | 'stable' }[];
}

interface PredictiveInsight {
  id: string;
  type: 'optimization' | 'warning' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  recommendation: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ user, onNotification }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'predictions' | 'reports'>('overview');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    generateAnalyticsData();
    generatePredictiveInsights();
  }, [selectedTimeRange]);

  const generateAnalyticsData = () => {
    // Simulate analytics data generation
    const dataPoints = selectedTimeRange === '24h' ? 24 : selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;
    
    const data: AnalyticsData = {
      spellSuccessRate: Array.from({ length: dataPoints }, () => 70 + Math.random() * 25),
      energyEfficiency: Array.from({ length: dataPoints }, () => 80 + Math.random() * 15),
      transformationCount: Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 20)),
      userActivity: Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 100)),
      chamberUsage: [
        { chamber: 'Prism Atrium', usage: 85, efficiency: 92 },
        { chamber: 'Metamorphic Conclave', usage: 70, efficiency: 88 },
        { chamber: 'Ember Ring', usage: 95, efficiency: 95 },
        { chamber: 'Void Nexus', usage: 45, efficiency: 65 },
        { chamber: 'Memory Sanctum', usage: 80, efficiency: 90 },
        { chamber: 'Mirror Maze', usage: 60, efficiency: 82 }
      ],
      prophecyAccuracy: Array.from({ length: dataPoints }, () => 60 + Math.random() * 30),
      systemPerformance: [
        { metric: 'Response Time', value: 120, trend: 'down' },
        { metric: 'Memory Usage', value: 68, trend: 'stable' },
        { metric: 'Energy Consumption', value: 82, trend: 'up' },
        { metric: 'Error Rate', value: 2.1, trend: 'down' },
        { metric: 'Uptime', value: 99.8, trend: 'stable' }
      ]
    };
    
    setAnalyticsData(data);
  };

  const generatePredictiveInsights = () => {
    const insights: PredictiveInsight[] = [
      {
        id: '1',
        type: 'optimization',
        title: 'Energy Reallocation Opportunity',
        description: 'AI analysis suggests reallocating 15% energy from Void Nexus to Ember Ring could improve overall efficiency by 8%',
        confidence: 87,
        impact: 'medium',
        recommendation: 'Implement gradual energy transfer over 3 cycles to maintain stability'
      },
      {
        id: '2',
        type: 'warning',
        title: 'Potential Transformation Failure',
        description: 'Current soul stability patterns indicate 23% chance of transformation failure in next 48 hours',
        confidence: 76,
        impact: 'high',
        recommendation: 'Increase Memory Sanctum synchronization and delay complex transformations'
      },
      {
        id: '3',
        type: 'opportunity',
        title: 'Optimal Spell Crafting Window',
        description: 'Dimensional alignment will peak in 6 hours, creating ideal conditions for legendary spell creation',
        confidence: 94,
        impact: 'high',
        recommendation: 'Schedule advanced spell crafting sessions during peak alignment'
      },
      {
        id: '4',
        type: 'optimization',
        title: 'Chamber Maintenance Schedule',
        description: 'Predictive maintenance suggests Mirror Maze efficiency will drop 12% without intervention',
        confidence: 82,
        impact: 'medium',
        recommendation: 'Schedule maintenance cycle within next 72 hours'
      }
    ];
    
    setPredictiveInsights(insights);
  };

  const generateReport = async () => {
    if (user.accessLevel === 'guest') {
      onNotification({
        type: 'error',
        title: 'Access Denied',
        message: 'Report generation requires EXECUTOR access or higher'
      });
      return;
    }

    setIsGeneratingReport(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const reportData = {
      timeRange: selectedTimeRange,
      generatedAt: new Date().toISOString(),
      summary: {
        totalSpells: Math.floor(Math.random() * 1000),
        successRate: 87.3,
        energyEfficiency: 89.1,
        transformations: Math.floor(Math.random() * 200),
        propheciesGenerated: Math.floor(Math.random() * 50)
      },
      insights: predictiveInsights,
      recommendations: [
        'Optimize energy allocation for 8% efficiency gain',
        'Schedule preventive maintenance for Mirror Maze',
        'Implement advanced spell crafting during peak alignment'
      ]
    };

    // Create downloadable report
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eternum-analytics-${selectedTimeRange}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsGeneratingReport(false);
    
    onNotification({
      type: 'success',
      title: 'Report Generated',
      message: `Analytics report for ${selectedTimeRange} has been downloaded`
    });
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'optimization': return 'border-blue-500/30 bg-blue-900/20 text-blue-300';
      case 'warning': return 'border-yellow-500/30 bg-yellow-900/20 text-yellow-300';
      case 'opportunity': return 'border-green-500/30 bg-green-900/20 text-green-300';
      default: return 'border-purple-500/30 bg-purple-900/20 text-purple-300';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={16} className="text-green-400" />;
      case 'down': return <TrendingUp size={16} className="text-red-400 rotate-180" />;
      default: return <div className="w-4 h-1 bg-gray-400 rounded"></div>;
    }
  };

  if (!analyticsData) {
    return (
      <div className="h-full flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-purple-300">Analyzing mystical data patterns...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 overflow-y-auto bg-black/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-purple-400" />
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Analytics Dashboard
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="px-3 py-2 bg-black/30 border border-purple-500/30 rounded text-white focus:outline-none focus:border-purple-400"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            
            <button
              onClick={generateReport}
              disabled={isGeneratingReport}
              className="px-4 py-2 bg-green-600/20 border border-green-500/30 rounded text-green-300 hover:bg-green-600/30 transition-colors disabled:opacity-50"
            >
              {isGeneratingReport ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Download size={16} />
                  <span>Export Report</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2">
          {[
            { id: 'overview', name: 'Overview', icon: <BarChart3 size={16} /> },
            { id: 'performance', name: 'Performance', icon: <Activity size={16} /> },
            { id: 'predictions', name: 'AI Insights', icon: <TrendingUp size={16} /> },
            { id: 'reports', name: 'Reports', icon: <Calendar size={16} /> }
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
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-black/30 border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-purple-400">Spell Success Rate</h3>
                    <Activity className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {analyticsData.spellSuccessRate[analyticsData.spellSuccessRate.length - 1].toFixed(1)}%
                  </div>
                  <div className="text-xs text-green-400">+2.3% from last period</div>
                </div>

                <div className="bg-black/30 border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-purple-400">Energy Efficiency</h3>
                    <Zap className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {analyticsData.energyEfficiency[analyticsData.energyEfficiency.length - 1].toFixed(1)}%
                  </div>
                  <div className="text-xs text-yellow-400">+1.7% from last period</div>
                </div>

                <div className="bg-black/30 border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-purple-400">Transformations</h3>
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {analyticsData.transformationCount.reduce((a, b) => a + b, 0)}
                  </div>
                  <div className="text-xs text-blue-400">Total this period</div>
                </div>

                <div className="bg-black/30 border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-purple-400">Prophecy Accuracy</h3>
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {analyticsData.prophecyAccuracy[analyticsData.prophecyAccuracy.length - 1].toFixed(1)}%
                  </div>
                  <div className="text-xs text-purple-400">+5.2% from last period</div>
                </div>
              </div>

              {/* Chamber Usage */}
              <div className="bg-black/30 border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-300 mb-4">Chamber Usage & Efficiency</h3>
                <div className="space-y-4">
                  {analyticsData.chamberUsage.map((chamber, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-300">{chamber.chamber}</span>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-white">Usage: {chamber.usage}%</span>
                          <span className="text-yellow-400">Efficiency: {chamber.efficiency}%</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{ width: `${chamber.usage}%` }}
                          />
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
                            style={{ width: `${chamber.efficiency}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'performance' && (
            <motion.div
              key="performance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* System Performance Metrics */}
              <div className="bg-black/30 border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-300 mb-4">System Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analyticsData.systemPerformance.map((metric, index) => (
                    <div key={index} className="bg-black/20 border border-purple-500/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-300">{metric.metric}</span>
                        {getTrendIcon(metric.trend)}
                      </div>
                      <div className="text-xl font-bold text-white">
                        {metric.value}{metric.metric.includes('Rate') || metric.metric.includes('Usage') || metric.metric.includes('Uptime') ? '%' : 'ms'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Charts Placeholder */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black/30 border border-purple-500/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-300 mb-4">Spell Success Trends</h3>
                  <div className="h-48 flex items-center justify-center text-purple-400/50">
                    <div className="text-center">
                      <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Interactive charts coming soon</p>
                    </div>
                  </div>
                </div>

                <div className="bg-black/30 border border-purple-500/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-300 mb-4">Energy Efficiency</h3>
                  <div className="h-48 flex items-center justify-center text-purple-400/50">
                    <div className="text-center">
                      <TrendingUp size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Real-time monitoring active</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'predictions' && (
            <motion.div
              key="predictions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-black/30 border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-300 mb-4">AI-Generated Insights</h3>
                <div className="space-y-4">
                  {predictiveInsights.map((insight) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`border rounded-lg p-4 ${getInsightColor(insight.type)}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold mb-1">{insight.title}</h4>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="px-2 py-1 bg-black/20 rounded capitalize">{insight.type}</span>
                            <span className={`${getImpactColor(insight.impact)}`}>
                              {insight.impact.toUpperCase()} IMPACT
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{insight.confidence}%</div>
                          <div className="text-xs opacity-70">confidence</div>
                        </div>
                      </div>
                      
                      <p className="text-sm mb-3 opacity-90">{insight.description}</p>
                      
                      <div className="bg-black/20 rounded p-3">
                        <div className="text-xs font-medium mb-1">Recommendation:</div>
                        <div className="text-sm">{insight.recommendation}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-black/30 border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-300 mb-4">Custom Reports</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-black/20 border border-purple-500/20 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-300 mb-2">Performance Summary</h4>
                      <p className="text-sm text-gray-300 mb-3">
                        Comprehensive overview of system performance, efficiency metrics, and optimization opportunities.
                      </p>
                      <button className="w-full py-2 bg-blue-600/20 border border-blue-500/30 rounded text-blue-300 hover:bg-blue-600/30 transition-colors">
                        Generate Report
                      </button>
                    </div>

                    <div className="bg-black/20 border border-purple-500/20 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-300 mb-2">Transformation Analysis</h4>
                      <p className="text-sm text-gray-300 mb-3">
                        Detailed analysis of transformation success rates, patterns, and recommendations for improvement.
                      </p>
                      <button className="w-full py-2 bg-green-600/20 border border-green-500/30 rounded text-green-300 hover:bg-green-600/30 transition-colors">
                        Generate Report
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-black/20 border border-purple-500/20 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-300 mb-2">Energy Optimization</h4>
                      <p className="text-sm text-gray-300 mb-3">
                        AI-powered recommendations for optimal energy allocation across all chambers.
                      </p>
                      <button className="w-full py-2 bg-yellow-600/20 border border-yellow-500/30 rounded text-yellow-300 hover:bg-yellow-600/30 transition-colors">
                        Generate Report
                      </button>
                    </div>

                    <div className="bg-black/20 border border-purple-500/20 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-300 mb-2">Prophecy Accuracy</h4>
                      <p className="text-sm text-gray-300 mb-3">
                        Statistical analysis of prophecy generation and fulfillment patterns over time.
                      </p>
                      <button className="w-full py-2 bg-purple-600/20 border border-purple-500/30 rounded text-purple-300 hover:bg-purple-600/30 transition-colors">
                        Generate Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;