
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, RotateCcw, Settings } from 'lucide-react';
import { behavioralEngine } from '@/utils/behavioralEngine';

const PersonalizationDashboard = () => {
  const [learningProfile, setLearningProfile] = useState(behavioralEngine.getLearningProfile());
  const [preferences, setPreferences] = useState(behavioralEngine.getUserPreferences());
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Refresh data periodically
    const interval = setInterval(() => {
      setLearningProfile(behavioralEngine.getLearningProfile());
      setPreferences(behavioralEngine.getUserPreferences());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const resetLearning = () => {
    behavioralEngine.resetBehavior();
    setLearningProfile(behavioralEngine.getLearningProfile());
    setPreferences(behavioralEngine.getUserPreferences());
  };

  const getCuisineData = () => {
    const { cuisineAffinities } = learningProfile;
    const total = Object.values(cuisineAffinities).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(cuisineAffinities)
      .map(([cuisine, count]) => ({
        cuisine,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getTimeData = () => {
    const { timePreferences } = learningProfile;
    const total = Object.values(timePreferences).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(timePreferences)
      .map(([time, count]) => ({
        time,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  };

  const cuisineData = getCuisineData();
  const timeData = getTimeData();
  const totalInteractions = Object.values(learningProfile.cuisineAffinities).reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Brain size={20} className="text-fuzo-purple mr-2" />
          <h2 className="text-xl font-semibold">AI Learning Status</h2>
        </div>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => setShowDetails(!showDetails)}
        >
          <Settings size={16} className="mr-1" />
          {showDetails ? 'Hide' : 'Details'}
        </Button>
      </div>

      {/* Learning Progress Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp size={18} className="mr-2 text-fuzo-coral" />
            Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Taste Profile</span>
                <span>{Math.min(totalInteractions * 10, 100)}%</span>
              </div>
              <Progress value={Math.min(totalInteractions * 10, 100)} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-fuzo-purple">{totalInteractions}</p>
                <p className="text-xs text-gray-500">Food Interactions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-fuzo-coral">{cuisineData.length}</p>
                <p className="text-xs text-gray-500">Cuisine Types Learned</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cuisine Preferences */}
      {cuisineData.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Top Cuisine Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cuisineData.map((item, index) => (
                <div key={item.cuisine} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="secondary" 
                      className={`${index === 0 ? 'bg-fuzo-yellow/30' : 'bg-gray-100'}`}
                    >
                      #{index + 1}
                    </Badge>
                    <span className="font-medium">{item.cuisine}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-fuzo-purple h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-8">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Preferences */}
      {showDetails && timeData.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Eating Time Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {timeData.map((item) => (
                <div key={item.time} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium capitalize">{item.time}</p>
                  <p className="text-sm text-gray-500">{item.count} interactions</p>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <div 
                      className="bg-fuzo-coral h-1 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reset Learning */}
      {showDetails && (
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-red-700">Reset Learning Data</h4>
                <p className="text-sm text-red-600">Clear all behavioral data and start fresh</p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={resetLearning}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <RotateCcw size={16} className="mr-1" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PersonalizationDashboard;
