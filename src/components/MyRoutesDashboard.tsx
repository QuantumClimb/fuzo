
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Plus, Star, Navigation } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface SavedRoute {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  eateries: RouteEatery[];
  lastUsed: string;
  frequency: number;
  estimatedTime: string;
}

interface RouteEatery {
  id: string;
  name: string;
  cuisine: string;
  isFrequent: boolean;
  isNewSuggestion: boolean;
  relevanceScore: number;
}

const MyRoutesDashboard = () => {
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [showNewRouteModal, setShowNewRouteModal] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteStart, setNewRouteStart] = useState('');
  const [newRouteEnd, setNewRouteEnd] = useState('');

  useEffect(() => {
    loadSavedRoutes();
  }, []);

  const loadSavedRoutes = () => {
    // Load from localStorage or use synthetic data
    const stored = localStorage.getItem('fuzo_saved_routes');
    if (stored) {
      setSavedRoutes(JSON.parse(stored));
    } else {
      setSavedRoutes(generateSyntheticRoutes());
    }
  };

  const generateSyntheticRoutes = (): SavedRoute[] => {
    return [
      {
        id: '1',
        name: 'Morning Office Route',
        startPoint: 'Home - Midtown',
        endPoint: 'Tech Hub Office',
        lastUsed: '2 days ago',
        frequency: 15,
        estimatedTime: '25 min',
        eateries: [
          {
            id: '1',
            name: 'Morning Brew Cafe',
            cuisine: 'Coffee & Pastries',
            isFrequent: true,
            isNewSuggestion: false,
            relevanceScore: 95
          },
          {
            id: '2',
            name: 'Fresh Bagel Stop',
            cuisine: 'Breakfast',
            isFrequent: true,
            isNewSuggestion: false,
            relevanceScore: 88
          },
          {
            id: '3',
            name: 'Green Smoothie Bar',
            cuisine: 'Healthy',
            isFrequent: false,
            isNewSuggestion: true,
            relevanceScore: 82
          }
        ]
      },
      {
        id: '2',
        name: 'Weekend Food Tour',
        startPoint: 'Downtown Square',
        endPoint: 'Riverside Park',
        lastUsed: '1 week ago',
        frequency: 8,
        estimatedTime: '45 min',
        eateries: [
          {
            id: '4',
            name: 'Street Taco Stand',
            cuisine: 'Mexican',
            isFrequent: true,
            isNewSuggestion: false,
            relevanceScore: 92
          },
          {
            id: '5',
            name: 'Artisan Ice Cream',
            cuisine: 'Dessert',
            isFrequent: true,
            isNewSuggestion: false,
            relevanceScore: 90
          },
          {
            id: '6',
            name: 'Korean BBQ Fusion',
            cuisine: 'Asian Fusion',
            isFrequent: false,
            isNewSuggestion: true,
            relevanceScore: 85
          }
        ]
      },
      {
        id: '3',
        name: 'Late Night Cravings',
        startPoint: 'Entertainment District',
        endPoint: 'Home',
        lastUsed: '5 days ago',
        frequency: 6,
        estimatedTime: '20 min',
        eateries: [
          {
            id: '7',
            name: '24/7 Donut Shop',
            cuisine: 'Dessert',
            isFrequent: true,
            isNewSuggestion: false,
            relevanceScore: 94
          },
          {
            id: '8',
            name: 'Midnight Ramen',
            cuisine: 'Japanese',
            isFrequent: false,
            isNewSuggestion: true,
            relevanceScore: 87
          }
        ]
      }
    ];
  };

  const saveNewRoute = () => {
    if (!newRouteName || !newRouteStart || !newRouteEnd) return;

    const newRoute: SavedRoute = {
      id: Date.now().toString(),
      name: newRouteName,
      startPoint: newRouteStart,
      endPoint: newRouteEnd,
      lastUsed: 'Never',
      frequency: 0,
      estimatedTime: '-- min',
      eateries: []
    };

    const updatedRoutes = [...savedRoutes, newRoute];
    setSavedRoutes(updatedRoutes);
    localStorage.setItem('fuzo_saved_routes', JSON.stringify(updatedRoutes));
    
    setShowNewRouteModal(false);
    setNewRouteName('');
    setNewRouteStart('');
    setNewRouteEnd('');
  };

  const RouteCard = ({ route }: { route: SavedRoute }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{route.name}</CardTitle>
          <Badge variant="secondary" className="bg-fuzo-yellow/20 text-fuzo-dark">
            Used {route.frequency}x
          </Badge>
        </div>
        <div className="flex items-center text-sm text-gray-500 space-x-4">
          <div className="flex items-center">
            <Navigation size={12} className="mr-1" />
            {route.startPoint} → {route.endPoint}
          </div>
          <div className="flex items-center">
            <Clock size={12} className="mr-1" />
            {route.estimatedTime}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Food Stops</h4>
          {route.eateries.map((eatery) => (
            <div key={eatery.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <MapPin size={14} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium">{eatery.name}</p>
                  <p className="text-xs text-gray-500">{eatery.cuisine}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {eatery.isNewSuggestion && (
                  <Badge className="bg-fuzo-coral/20 text-fuzo-coral text-xs">
                    New
                  </Badge>
                )}
                {eatery.isFrequent && (
                  <Star size={12} className="text-fuzo-yellow fill-current" />
                )}
                <span className="text-xs text-gray-500">{eatery.relevanceScore}%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex space-x-2 mt-4">
          <Button size="sm" className="flex-1 bg-fuzo-purple hover:bg-fuzo-purple/90">
            Use Route
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            Optimize
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Routes</h2>
        <Button 
          size="sm" 
          onClick={() => setShowNewRouteModal(true)}
          className="bg-fuzo-coral hover:bg-fuzo-coral/90"
        >
          <Plus size={16} className="mr-1" />
          New Route
        </Button>
      </div>
      
      {savedRoutes.length === 0 ? (
        <Card className="p-8 text-center">
          <Navigation size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No saved routes yet</h3>
          <p className="text-gray-500 mb-4">Create your first route to get personalized food recommendations</p>
          <Button onClick={() => setShowNewRouteModal(true)} className="bg-fuzo-coral hover:bg-fuzo-coral/90">
            <Plus size={16} className="mr-2" />
            Create First Route
          </Button>
        </Card>
      ) : (
        savedRoutes.map((route) => <RouteCard key={route.id} route={route} />)
      )}

      <Dialog open={showNewRouteModal} onOpenChange={setShowNewRouteModal}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Create New Route</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Route name (e.g., Morning Commute)"
              value={newRouteName}
              onChange={(e) => setNewRouteName(e.target.value)}
            />
            <Input
              placeholder="Starting point"
              value={newRouteStart}
              onChange={(e) => setNewRouteStart(e.target.value)}
            />
            <Input
              placeholder="Destination"
              value={newRouteEnd}
              onChange={(e) => setNewRouteEnd(e.target.value)}
            />
            <div className="flex space-x-2">
              <Button 
                onClick={saveNewRoute}
                disabled={!newRouteName || !newRouteStart || !newRouteEnd}
                className="flex-1 bg-fuzo-coral hover:bg-fuzo-coral/90"
              >
                Save Route
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowNewRouteModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyRoutesDashboard;
